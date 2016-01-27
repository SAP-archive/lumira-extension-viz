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
		// var dset = data.meta.dimensions(),
		// 	mset = data.meta.measures();

		var dim = data.meta.dimensions(0);
		var measures = data.meta.measures(0);

		//convert measures into numbers
		data.forEach(function(d) {
			d[measures] = +d[measures];
		});

		//prepare canvas with width and height of container
		var width = this.width(),
			height = this.height();
			// colorPalette = this.colorPalette(),
			// properties = this.properties(),
			// dispatch = this.dispatch();
		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

		var format = d3.format("0,000");
		var dateparse = d3.time.format("%m/%d/%Y").parse;
		var dataset = [];

		dataset = data.map(function(d) {
			//console.log(d);
			var dimension = dateparse(d[dim]),
				measure0 = (d[measures[0]] ? d[measures[0]] : -1),
				measure1 = d[measures[1]],
				measure2 = d[measures[2]],
				measure3 = (d[measures[3]] ? d[measures[3]] : -1),
				measure4 = d[measures[4]],
				measure5 = d[measures[5]],
				measure6 = d[measures [6]],
				measure7 = (d[measures[7]] ? d[measures[7]] : -1),
				measure8 = (d[measures[8]] ? d[measures[8]] : -1),
				measure9 = (d[measures[9]] ? d[measures[9]] : -1),
				measure10 = (d[measures[10]] ? d[measures[10]] : -1),
				measure11 = (d[measures[11]] ? d[measures[11]] : -1);

			return {
				"dimension": dimension,
				"measure0": measure0,
				"measure1": measure1,
				"measure2": measure2,
				"measure3": measure3,
				"measure4": measure4,
				"measure5": measure5,
				"measure6": measure6,
				"measure7": measure7,
				"measure8": measure8,
				"measure9": measure9,
				"measure10": measure10,
				"measure11": measure11
			};
		});

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
			return d.dimension;
		}));

		//2 y scales: 

		var y1 = d3.scale.linear()
			.range([plotHeight, 0]);
		y1.domain([0, d3.max(dataset, function(d) {
			return d.measure6 * 1.1;
		})]);

		var y2 = d3.scale.linear()
			.range([plotHeight, 0]);
		y2.domain([0, d3.max(dataset, function(d) {
			return d3.max([d.measure0 * 1.1, d.measure11 * 1.1]);
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
				return x(d.dimension);
			})
			.y0(y1(0))
			.y1(function(d) {
				return y1(d.measure6);
			});

		var norm_cap = d3.svg.area()
			.x(function(d) {
				return x(d.dimension);
			})
			.y0(y1(0))
			.y1(function(d) {
				return y1(d.measure5);
			});

		var min_cap = d3.svg.area()
			.x(function(d) {
				return x(d.dimension);
			})
			.y0(y1(0))
			.y1(function(d) {
				return y1(d.measure1);
			});

		var abs_line = d3.svg.line()
			.x(function(d) {
				return x(d.dimension);
			})
			.y(function(d) {
				return y1(d.measure4);
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
			if (+dataset[i].measure3 === -1) {
				present_split = i;
				break;
			}
		}

		var past = dataset.slice(0, present_split);
		var future = dataset.slice(present_split);

		var labelVar = "dimension";
		var varNames = ["measure3", "measure10"];
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
				return "translate(" + x(d.dimension) + ",0)";
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

		varNames = ["measure8", "measure7", "measure9"];

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
				return "translate(" + x(d.dimension) + ",0)";
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
			if (dataset[i].measure0 > -1) {
				if (!pendown) {
					dpath += "M";
					pendown = true;
				} else {
					dpath += "L";
				}
				dpath += x(dataset[i].dimension);
				dpath = dpath + "," + y2(dataset[i].measure0);
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
			if (dataset[i].measure11 > -1) {
				if (!pendown) {
					dpath += "M";
					pendown = true;
				} else {
					dpath += "L";
				}
				dpath += x(dataset[i].dimension);
				dpath = dpath + "," + y2(dataset[i].measure11);
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
			.style("fill", color("measure3"))
			.style("stroke", "#404040")
			.style("stroke-width", "1");
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", "20")
			.attr("y", "0")
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text(measures[3]);

		legend_g.append("rect")
			.attr("y", 15)
			.attr("width", "16")
			.attr("height", "8")
			.style("fill", color("measure10"))
			.style("stroke", "#404040")
			.style("stroke-width", "1");
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", 20)
			.attr("y", 15)
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text(measures[10]);

		legend_g.append("rect")
			.attr("y", 30)
			.attr("width", "16")
			.attr("height", "8")
			.style("fill", color("measure8"))
			.style("stroke", "#404040")
			.style("stroke-width", "1");
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", 20)
			.attr("y", 30)
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text(measures[8]);

		legend_g.append("rect")
			.attr("y", 45)
			.attr("width", "16")
			.attr("height", "8")
			.style("fill", color("measure7"))
			.style("stroke", "#404040")
			.style("stroke-width", "1");
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", 20)
			.attr("y", 45)
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text(measures[7]);

		legend_g.append("rect")
			.attr("y", 60)
			.attr("width", "16")
			.attr("height", "8")
			.style("fill", color("measure9"))
			.style("stroke", "#404040")
			.style("stroke-width", "1");
		legend_g.append("text")
			.attr("class", "sap_viz_ext_capacityplanning_legend")
			.attr("x", 20)
			.attr("y", 60)
			.attr("dy", ".75em")
			.style("text-anchor", "start")
			.text(measures[9]);

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
			.text(measures[1]);

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
			.text(measures[5]);

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
			.text(measures[6]);

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
			.text(measures[4]);

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
			.text(measures[0]);

		d3.svg.line()
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
			.text(measures[11]);

		// END: sample render code

	};

	return render;
});