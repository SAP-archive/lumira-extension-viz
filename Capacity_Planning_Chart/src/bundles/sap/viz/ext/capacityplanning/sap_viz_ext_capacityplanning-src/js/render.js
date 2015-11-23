define("sap_viz_ext_capacityplanning-src/js/render", [], function() {
	/*
	 * This function is a drawing function; you should put all your drawing logic in it.
	 * it's called in moduleFunc.prototype.render
	 * @param {Object} data - proceessed dataset, check dataMapping.js
	 * @param {Object} container - the target d3.selection element of plot area
	 * @example
	 *   container size:     this.width() or this.height()
	 *   chart properties:   this.properties()
	 *   dimensions info:    data.meta.dimensions()
	 *   measures info:      data.meta.measures()
	 */
	var render = function(data, container) {
		//prepare canvas with width and height of container
		var width = this.width(),
			height = this.height(),
			colorPalette = this.colorPalette(),
			properties = this.properties(),
			dispatch = this.dispatch();
		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

		var format = d3.format("0,000");
		var dateparse = d3.time.format("%m/%d/%Y").parse;
		var dataset = [];

		dataset = data.map(function(d) {
			//console.log(d);

		var	month = dateparse(d.Month),
			full_abs_line = +d["Full Absorption Line"],
			base_cap = +d["Base Capacity (In House)"],
			max_cap_ih = +d["Maximum Capacity (In House)"],
			max_cap_sub = +d["Maximum Capacity (incl. subcontracting)"],
			comp_hours = +d["Completed Hours"],
			sub_prev_month = (d["Subcontracting previous month"] ? +d["Subcontracting previous month"] : -1),
			lab_prev_month = (d["Direct Labor Completed Hours"] ? +d["Direct Labor Completed Hours"] : -1),
			orders_not_rel = (d["Orders on Hand: Not Released"] ? +d["Orders on Hand: Not Released"] : -1),
			orders_rel = (d["Orders on Hand: Released"] ? +d["Orders on Hand: Released"] : -1),
			backlog = (d["Backlog"] ? +d["Backlog"] : -1),
			backlog_prev = (d["Backlog previous year"] ? +d["Backlog previous year"] : -1),
			forecast = (d["Sales forecast"] ? +d["Sales forecast"] : -1);

			return {
				"month": month,
				"full_abs_line": full_abs_line,
				"base_cap": base_cap,
				"max_cap_ih": max_cap_ih,
				"max_cap_sub": max_cap_sub,
				"comp_hours": comp_hours,
				"sub_prev_month": sub_prev_month,
				"lab_prev_month": lab_prev_month,
				"orders_not_rel": orders_not_rel,
				"orders_rel": orders_rel,
				"backlog": backlog,
				"backlog_prev": backlog_prev,
				"forecast": forecast
			};
		});
		//console.log(dataset);

		var margin = {
				top: 20,
				right: 220,
				bottom: 20,
				left: 40
			},
			plotWidth = width - margin.left - margin.right,
			plotHeight = height - margin.top - margin.bottom;
		//transform plot area
		vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		//time scale
		var x = d3.time.scale()
			.range([0, plotWidth]);
		x.domain(d3.extent(dataset, function(d) {
			//console.log(d.month);
			return d.month;
		}));

		//2 y scales: 

		var y1 = d3.scale.linear()
			.range([plotHeight, 0]);
		y1.domain([0, d3.max(dataset, function(d) {
			return d.max_cap_sub * 1.1;
		})]);

		var y2 = d3.scale.linear()
			.range([plotHeight, 0]);
		y2.domain([0, d3.max(dataset, function(d) {
			return d3.max([d.backlog * 1.1, d.backlog_prev * 1.1]);
		})]);

		var xAxis = d3.svg.axis()
			.orient("bottom")
			.scale(x)
			.tickFormat(d3.time.format("%b %Y"));

		var y1Axis = d3.svg.axis()
			.scale(y1)
			.orient("left")
			.tickFormat(d3.format(".2s"));

		var y2Axis = d3.svg.axis()
			.scale(y2)
			.orient("right")
			.tickFormat(d3.format(".2s"));

		/*
		 *   Data plots
		 */
		var max_cap = d3.svg.area()
			.x(function(d) {
				return x(d.month);
			})
			.y0(y1(0))
			.y1(function(d) {
				return y1(d.max_cap_sub);
			});

		var norm_cap = d3.svg.area()
			.x(function(d) {
				return x(d.month);
			})
			.y0(y1(0))
			.y1(function(d) {
				return y1(d.max_cap_ih);
			});

		var min_cap = d3.svg.area()
			.x(function(d) {
				return x(d.month);
			})
			.y0(y1(0))
			.y1(function(d) {
				return y1(d.base_cap);
			});

		var abs_line = d3.svg.line()
			.x(function(d) {
				return x(d.month);
			})
			.y(function(d) {
				return y1(d.full_abs_line);
			})
			.interpolate("linear");

		//paint areas
		vis.append("path")
			.datum(dataset)
			.attr("class", "sap_viz_ext_capacityplanning_area")
			.attr("d", max_cap)
			.style("stroke", "#404040")
			.style("fill", "#D0D0D0");

		vis.append("path")
			.datum(dataset)
			.attr("class", "sap_viz_ext_capacityplanning_area")
			.attr("d", norm_cap)
			.style("stroke", "#404040")
			.style("fill", "#B0B0B0");

		vis.append("path")
			.datum(dataset)
			.attr("class", "sap_viz_ext_capacityplanning_area")
			.attr("d", min_cap)
			.style("stroke", "#404040")
			.style("fill", "#808080");

		//bars
		/*
   console.log("comp_hours\tsub_prev_month\tlab_prev_month\torders_not_rel\torders_rel\tforecast");
   for(var i=0; i<dataset.length; i++){
       console.log(dataset[i].comp_hours + "\t" + dataset[i].sub_prev_month + "\t" + dataset[i].lab_prev_month + "\t" + dataset[i].orders_not_rel + "\t" + dataset[i].orders_rel + "\t" + dataset[i].forecast);
   }
   */

		//detect past from future. Run through lab_prev_month and see where the -1 starts.
		var present_split = 0;
		for (var i = 0; i < dataset.length; i++) {
			if (+dataset[i].lab_prev_month === -1) {
				present_split = i;
				break;
			}
		}

		var past = dataset.slice(0, present_split);
		var future = dataset.slice(present_split);

		var labelVar = "month";
		var varNames = ["lab_prev_month", "sub_prev_month"];
		var color = d3.scale.ordinal()
			.range(["#0000FF", "#00BFFF", "#008000", "#FF0000", "#FFFF80"]);

		past.forEach(function(d) {
			var y0 = 0;
			d.mapping = varNames.map(function(name) {
				return {
					name: name,
					label: d[labelVar],
					y0: y0,
					y1: y0 += +d[name]
				};
			});
			d.total = d.mapping[d.mapping.length - 1].y1;
		});

		var pastbars = vis.selectAll(".pastbars")
			.data(past)
			.enter().append("g")
			.attr("class", "sap_viz_ext_capacityplanning_pastbars")
			.attr("transform", function(d) {
				return "translate(" + x(d.month) + ",0)";
			});
		pastbars.selectAll("rect")
			.data(function(d) {
				return d.mapping;
			})
			.enter().append("rect")
			.attr("width", "30")
			.attr("x", "-15")
			.attr("y", function(d) {
				return y1(d.y1);
			})
			.attr("height", function(d) {
				return y1(d.y0) - y1(d.y1);
			})
			.style("fill", function(d) {
				return color(d.name);
			})
			.style("stroke", "#404040")
			.style("stroke-width", "1");

		//future bars

		varNames = ["orders_rel", "orders_not_rel", "forecast"];

		future.forEach(function(d) {
			var y0 = 0;
			d.mapping = varNames.map(function(name) {
				return {
					name: name,
					label: d[labelVar],
					y0: y0,
					y1: y0 += +d[name]
				};
			});
			d.total = d.mapping[d.mapping.length - 1].y1;
		});

		var futurebars = vis.selectAll(".futurebars")
			.data(future)
			.enter().append("g")
			.attr("class", "sap_viz_ext_capacityplanning_futurebars")
			.attr("transform", function(d) {
				return "translate(" + x(d.month) + ",0)";
			});
		futurebars.selectAll("rect")
			.data(function(d) {
				return d.mapping;
			})
			.enter().append("rect")
			.attr("width", "30")
			.attr("x", "-15")
			.attr("y", function(d) {
				return y1(d.y1);
			})
			.attr("height", function(d) {
				return y1(d.y0) - y1(d.y1);
			})
			.style("fill", function(d) {
				return color(d.name);
			})
			.style("stroke", "#404040")
			.style("stroke-width", "1");

		// blank out some overspill
		vis.append("rect")
			.attr("x", -margin.left)
			.attr("y", 0)
			.attr("width", margin.left)
			.attr("height", plotHeight + 10)
			.style("fill", "white");

		vis.append("rect")
			.attr("x", plotWidth)
			.attr("y", 0)
			.attr("width", margin.right)
			.attr("height", plotHeight + 10)
			.style("fill", "white");

		//lines
		vis.append("path")
			.attr("class", "sap_viz_ext_capacityplanning_line")
			.style("stroke", "#000000")
			.style("stroke-dasharray", ("5,5"))
			.style("stroke-width", "2")
			.attr("d", abs_line(dataset));

		// begin backlog lines
		var pendown = false;
		var dpath = "";
		for (i = 0; i < dataset.length - 1; i++) {
			if (dataset[i].backlog > -1) {
				if (!pendown) {
					dpath += "M";
					pendown = true;
				} else {
					dpath += "L";
				}
				dpath += x(dataset[i].month);
				dpath = dpath + "," + y2(dataset[i].backlog);
			}
		}

		vis.append("g")
			.append("path")
			.attr("class", "sap_viz_ext_capacityplanning_backlog")
			.style("stroke", "#000000")
		//.style("stroke-dasharray", ("5,5"))
		.style("stroke-width", "2")
			.style("fill", "none")
			.attr("d", dpath);

		pendown = false;
		dpath = "";
		for (i = 0; i < dataset.length - 1; i++) {
			if (dataset[i].backlog_prev > -1) {
				if (!pendown) {
					dpath += "M";
					pendown = true;
				} else {
					dpath += "L";
				}
				dpath += x(dataset[i].month);
				dpath = dpath + "," + y2(dataset[i].backlog_prev);
			}
		}

		vis.append("g")
			.append("path")
			.attr("class", "sap_viz_ext_capacityplanning_backlog")
			.style("stroke", "#000000")
			.style("stroke-dasharray", ("3,3"))
			.style("stroke-width", "2")
			.style("fill", "none")
			.attr("d", dpath);

		//paint the axes
		vis.append("g")
			.attr("class", "sap_viz_ext_capacityplanning_x_axis")
			.attr("transform", "translate(0, " + plotHeight + ")")
			.call(xAxis);

		vis.append("g")
			.attr("class", "sap_viz_ext_capacityplanning_y_axis")
			.call(y1Axis);

		vis.append("g")
			.attr("class", "sap_viz_ext_capacityplanning_y_axis")
			.attr("transform", "translate(" + plotWidth + ", 0)")
			.call(y2Axis)
			.append("text")
			.attr("dx", "-4em")
			.attr("dy", "-0.75em")
			.attr("transform", "rotate(-90)")
			.text("Backlog");

		//Legend - hardcoded: too complex to drive programmatically
		var legend_g = vis.append("g")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("transform", "translate(" + (plotWidth + 40) + ", 10)");

		legend_g.append("rect")
			.attr("y", 0)
			.attr("width", "16")
			.attr("height", "8")
			.style("fill", color("lab_prev_month"))
			.style("stroke", "#404040")
			.style("stroke-width", "1");
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", "20")
			.attr("y", "0")
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text("Direct Labor Completed Hours");

		legend_g.append("rect")
			.attr("y", 15)
			.attr("width", "16")
			.attr("height", "8")
			.style("fill", color("sub_prev_month"))
			.style("stroke", "#404040")
			.style("stroke-width", "1");
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", 20)
			.attr("y", 15)
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text("Subcontracting previous month");

		legend_g.append("rect")
			.attr("y", 30)
			.attr("width", "16")
			.attr("height", "8")
			.style("fill", color("orders_rel"))
			.style("stroke", "#404040")
			.style("stroke-width", "1");
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", 20)
			.attr("y", 30)
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text("Orders on Hand: Released");

		legend_g.append("rect")
			.attr("y", 45)
			.attr("width", "16")
			.attr("height", "8")
			.style("fill", color("orders_not_rel"))
			.style("stroke", "#404040")
			.style("stroke-width", "1");
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", 20)
			.attr("y", 45)
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text("Orders on Hand: Not Released");

		legend_g.append("rect")
			.attr("y", 60)
			.attr("width", "16")
			.attr("height", "8")
			.style("fill", color("forecast"))
			.style("stroke", "#404040")
			.style("stroke-width", "1");
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", 20)
			.attr("y", 60)
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text("Sales forecast");

		legend_g.append("rect")
			.attr("y", 80)
			.attr("width", "16")
			.attr("height", "8")
			.style("fill", "#808080")
			.style("stroke", "#404040")
			.style("stroke-width", "1");
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", 20)
			.attr("y", 80)
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text("Base Capacity (In House)");

		legend_g.append("rect")
			.attr("y", 95)
			.attr("width", "16")
			.attr("height", "8")
			.style("fill", "#B0B0B0")
			.style("stroke", "#404040")
			.style("stroke-width", "1");
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", 20)
			.attr("y", 95)
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text("Max. Capacity (In House)");

		legend_g.append("rect")
			.attr("y", 110)
			.attr("width", "16")
			.attr("height", "8")
			.style("fill", "#D0D0D0")
			.style("stroke", "#404040")
			.style("stroke-width", "1");
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", 20)
			.attr("y", 110)
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text("Max. Capacity (incl. subcontracting)");

		var legend_abs_line = d3.svg.line()
			.x(function(d) {
				return d.x;
			})
			.y(function(d) {
				return d.y;
			})
			.interpolate("linear");

		legend_g.append("path")
			.attr("class", "sap_viz_ext_capacityplanning_line")
			.style("stroke", "#000000")
			.style("stroke-dasharray", ("5,5"))
			.style("stroke-width", "2")
			.attr("d", legend_abs_line([{
				"x": 0,
				"y": 135
			}, {
				"x": 16,
				"y": 135
			}]));
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", 20)
			.attr("y", 130)
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text("Full Absorption Line");

		var legend_backlog = d3.svg.line()
			.x(function(d) {
				return d.x;
			})
			.y(function(d) {
				return d.y;
			})
			.interpolate("linear");

		legend_g.append("path")
			.attr("class", "sap_viz_ext_capacityplanning_line")
			.style("stroke", "#000000")
		//.style("stroke-dasharray", ("5,5"))
		.style("stroke-width", "2")
			.attr("d", legend_abs_line([{
				"x": 0,
				"y": 150
			}, {
				"x": 16,
				"y": 150
			}]));
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", 20)
			.attr("y", 145)
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text("Backlog");

		var legend_prevbacklog = d3.svg.line()
			.x(function(d) {
				return d.x;
			})
			.y(function(d) {
				return d.y;
			})
			.interpolate("linear");

		legend_g.append("path")
			.attr("class", "sap_viz_ext_capacityplanning_line")
			.style("stroke", "#000000")
			.style("stroke-dasharray", ("3,3"))
			.style("stroke-width", "2")
			.attr("d", legend_abs_line([{
				"x": 0,
				"y": 165
			}, {
				"x": 16,
				"y": 165
			}]));
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", 20)
			.attr("y", 160)
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text("Backlog previous year");
		
		// END: sample render code

	};

	return render;
});