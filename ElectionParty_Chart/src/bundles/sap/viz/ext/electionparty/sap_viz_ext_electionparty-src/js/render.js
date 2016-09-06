define("sap_viz_ext_electionparty-src/js/render", [], function() {
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
		var width = this.width(),
			height = this.height(),
			margin = {
				top: 20,
				right: 40 + 0.1*width,
				bottom: 40,
				left: 50
			},
			legendSquareEdgeWidth = width*0.02,
			plotWidth = width - margin.left - margin.right,
			plotHeight = height - margin.top - margin.bottom;

		var colorPalette = this.properties().colorPalette;

		//get Dimensions and Measures
		var dset1 = data.meta.dimensions(0),

			dim_0 = dset1[0],
			dim_1 = dset1[1],
			dim_2 = dset1[2];

		var mset1 = data.meta.measures(0),

			mes_0 = mset1[0];

		//sort data by dimension 0 
		data = data.sort(function(a, b) {
			return a[dim_0] - b[dim_0];
		});
		container.selectAll('svg').remove();
		var divContainer = container.append("foreignObject")
			.attr("width", width + "px")
			.attr("height", height + "px")
			.attr("class", "sap_viz_ext_electionparty_forobj")
			.append("xhtml:div")
			.attr("class", "sap_viz_ext_electionparty-forobj-div-container")
			.style("width", width + "px")
			.style("height", height + "px")
			.style("left", "0px")
			.style("top", 20 + "px");

		var svg = divContainer.append('svg').attr('width', width).attr('height', height);
		var vis = svg.append('g').attr('class', 'vis').attr('width', width).attr('height', height);
		
		vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		//x and y scales
		var x = d3.time.scale().range([0, plotWidth]);
		var y = d3.scale.linear().range([plotHeight, 0]);

		x.domain([d3.min(data, function(d) {
			return new Date(d[dim_0]);
		}) * 0.9999, d3.max(data, function(d) {
			return new Date(d[dim_0]);
		}) * 1.0001]);

		y.domain([d3.min(data, function(d) {
			return d[mes_0];
		}) * 0.98, d3.max(data, function(d) {
			return d[mes_0];
		}) * 1.02]);

		//bgAreas: array of background rectangles to be drawn
		//bgItemTypes: assigns a color to a certain value in dimension 1 
		//(background rectangles with the same value in dimension 1 should have the same color)
		//legendItems: also contains the color assignment, but now as an array to use it for the .data() operator in order to draw the color legend
		var bgAreas = [],
			bgAreaX,
			bgAreaDim1,
			bgAreaDim2,
			bgAreaFirstDatum,
			bgColorCount = 0,
			bgItemTypes = {},
			legendItems = [];

		d3.isv = {};
		//Stand Alone Tooltip implementation
		d3.selectAll("#sap_viz_ext_electionparty_t-tip").remove();
		d3.isv.tooltip = function() {
			var html = "tooltip",
				classed = "left",
				x = 10,
				y = 10,
				position = [x, y],
				disp = "none";

			function tooltip() {
				// generate tooltip here, using `width` and `height`
				var tt = d3.select("body").append("div").attr("id", "sap_viz_ext_electionparty_t-tip").style("display", disp);
				var tooltip = tt.append("div").attr("class", "sap_viz_ext_electionparty_att-inner").style("text-align", "left");
				tooltip.append("div").attr("id", "sap_viz_ext_electionparty_triangle").attr("class", classed);
				tooltip.append("div").attr("id", "tt-body");
				tooltip.visibility = function(value) {
					//if (!arguments.length) return html;
					d3.selectAll("#sap_viz_ext_electionparty_t-tip").style("display", value);
				};
				tooltip.orientation = function(value) {
					//if (!arguments.length) return html;
					d3.selectAll("#sap_viz_ext_electionparty_t-tip #sap_viz_ext_electionparty_triangle").attr("class", value);
				};
				tooltip.move = function(value) {
					d3.selectAll("#sap_viz_ext_electionparty_t-tip").style("top", value[0]).style("left", value[1]);
				};
				tooltip.fillData = function(value) {
					d3.selectAll("#sap_viz_ext_electionparty_t-tip #tt-body").html(value);
				};
				return tooltip;
			}
			tooltip.width = function(value) {
				if (!arguments.length) {
					return width;
				}
				width = value;
				return tooltip;
			};
			tooltip.height = function(value) {
				if (!arguments.length) {
					return height;
				}
				height = value;
				return tooltip;
			};
			return tooltip;
		};
		
		var bgAreaTextHeight = 0.07 * Math.min(width, height);
		var shortestPeriod = {},
			shortestPeriodWidth,
			bgAreaDate;
		for (var j = 0; j < data.length; j++) {
			if (data[j][dim_2] !== bgAreaDim2 || j === data.length - 1) {
				if (bgAreaDim2) {
					if (!shortestPeriod.len || shortestPeriod.len > data[j][dim_0] - bgAreaDate) {
						shortestPeriod.start = bgAreaDate;
						shortestPeriod.end = data[j][dim_0];
						shortestPeriod.len = data[j][dim_0] - bgAreaDate;
					}
				}
				bgAreaDate = data[j][dim_0];
				bgAreaDim2 = data[j][dim_2];
			}

		}
		bgAreaDim2 = null;
		shortestPeriodWidth = x(shortestPeriod.end) - x(shortestPeriod.start);
		if (shortestPeriodWidth < bgAreaTextHeight) {
			var newRangeEnd = bgAreaTextHeight/(shortestPeriodWidth)*plotWidth;
			x.range([0, newRangeEnd]);
			svg.attr("width", newRangeEnd + margin.left + margin.right);
			vis.attr("width", newRangeEnd + margin.left + margin.right);
			plotWidth = newRangeEnd;
		}
		
		//loop through the data and combine subsequent datasets with the same value in dimension 2 to one background rectangle
		for (var i = 0; i < data.length; i++) {
			if (data[i][dim_2] !== bgAreaDim2 || i === data.length - 1) {
				if (bgAreaDim2) {
					var area = {};
					area.x = bgAreaX;
					area.width = x(data[i][dim_0]) - bgAreaX;
					area.dim2 = bgAreaDim1;
					area.dim3 = bgAreaDim2;
					//check if there is already a color assigned to the current value in dimension 1 
					if (bgItemTypes[bgAreaDim1]) {
						area.color = bgItemTypes[bgAreaDim1].color;
					} else {
						bgItemTypes[bgAreaDim1] = {};
						area.color = colorPalette[bgColorCount++];
						bgColorCount++;
						bgItemTypes[bgAreaDim1].color = area.color;
						bgItemTypes[bgAreaDim1].name = bgAreaDim1;
						legendItems.push(bgItemTypes[bgAreaDim1]);
					}
					area.dim1 = bgAreaDim1;
					area.dim2 = bgAreaDim2;
					area.diffMes0Abs = data[i][mes_0] - bgAreaFirstDatum[mes_0];
					area.diffMes0Rel = area.diffMes0Abs / bgAreaFirstDatum[mes_0];
					bgAreas.push(area);
				}
				bgAreaX = x(new Date(data[i][dim_0]));
				bgAreaDim1 = data[i][dim_1];
				bgAreaDim2 = data[i][dim_2];
				bgAreaFirstDatum = data[i];
			}
		}

		var chart = vis.append("g").attr("class", "sap_viz_ext_electionparty_bgAreaGroup");
		var bgFullAreaRect = chart.append("rect").attr("width", plotWidth).attr("height", plotHeight).attr("fill", "none");
		//append the background rectangles

		var bgAreaRects = chart.selectAll(".sap_viz_ext_electionparty_backgroundRect")
			.data(bgAreas).enter()
			.append("rect")
			.attr("x", function(d) {
				return (d.x + 1);
			})
			.attr("y", 0)
			.attr("width", function(d) {
				return d.width - 2;
			})
			.attr("height", plotHeight)
			.attr("fill", function(d) {
				return d.color;
			})
			.attr("class", "sap_viz_ext_electionparty_backgroundRect");

		var bgAreaRectsTransparent = chart.selectAll(".sap_viz_ext_electionparty_bgAreaOverlayTransparent")
			.data(bgAreas).enter()
			.append("rect")
			.attr("x", function(d) {
				return (d.x);
			})
			.attr("y", 0)
			.attr("width", function(d) {
				return d.width;
			})
			.attr("height", plotHeight)
			.attr("fill", "white")
			.attr("class", "sap_viz_ext_electionparty_bgAreaOverlayTransparent");

		//create x axis
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");
			//.innerTickSize(-plotHeight)
			//.outerTickSize(0)
			//.tickPadding(10);

		//create y axis
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickFormat(d3.format(".3s"))
			.innerTickSize(-plotWidth)
			.outerTickSize(0)
			.tickPadding(10);

		//create d3 line
		var valueline = d3.svg.line()
			.x(function(d) {
				return x(d[dim_0]);
			})
			.y(function(d) {
				return y(d[mes_0]);
			});

		//append axes
		chart.append("g")
			.attr("class", "x sap_viz_ext_electionparty_axis")
			.attr("transform", "translate(0," + plotHeight + ")")
			.call(xAxis);

		chart.append("g")
			.attr("class", "y sap_viz_ext_electionparty_axis")
			.call(yAxis);

		//append the background texts in the middle of the background rectangles
		chart.selectAll(".sap_viz_ext_electionparty_backgroundText")
			.data(bgAreas).enter()
			.append("text")
			.attr("x", function(d) {
				return d.x + 1 + d.width / 2;
			})
			.attr("y", 25) 
			.attr("fill", "white")
			.attr("class", "sap_viz_ext_electionparty_backgroundText")
			.attr("text-anchor", "end")
			.attr("transform", function(d) {
				return "rotate(-90 " + (d.x + d.width / 2) + ",25)"; 
			})
			.text(function(d) {
				return d.dim3;
			});

		//append dots for single values
		var svg = chart.selectAll("svg")
			.data(data)
			.enter()
			.append("g")
			.attr("transform", function(d, idx) {
				return "translate(" + x(d[dim_0]) + "," + y(d[mes_0]) + ")";
			})
			.append("circle")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", 3)
			.attr("fill", "white")
			.attr("class", "sap_viz_ext_electionparty_valueDot");

		//append graph
		chart.append("path")
			.attr("class", "sap_viz_ext_electionparty_line")
			.attr("d", valueline(data))
			.attr("fill", "none")
			.attr("stroke", "white")
			.attr("stroke-width", 3); 

		//create legend
		var legend = vis.selectAll(".sap_viz_ext_electionparty_colorLegend").data(legendItems).enter()
			.append("g").attr("class", "sap_viz_ext_electionparty_colorLegend").attr("transform", function(d, idx) {
				return "translate(" + (plotWidth + 5) + "," + idx * (legendSquareEdgeWidth + 10) + ")"; 
			});

		legend.append("rect").attr("width", legendSquareEdgeWidth).attr("height", legendSquareEdgeWidth).attr("fill", function(d) {
			return d.color;
		});

		legend.append("text").attr("x", legendSquareEdgeWidth + 3).attr("y", legendSquareEdgeWidth/2).attr("class", "sap_viz_ext_electionparty_legendText").text(function(d) {
			return d.name;
		});
		
		var zt_tip = new d3.isv.tooltip();
		var ztooltip = zt_tip();
		
		bgAreaRectsTransparent.on("mouseenter", function() {
			ztooltip.visibility("block");
			ztooltip.fillData(
				"<div>" + data.meta.dimensions()[1] + ": " + d3.select(this).datum().dim1 + "</div>"
				+ "<div>" + data.meta.dimensions()[2] + ": " + d3.select(this).datum().dim2 + "</div>"
				+ "<div>" + "Absolute change: " + d3.format(".3s")(d3.select(this).datum().diffMes0Abs) + "</div>"
				+ "<div>" + "Relative change: " + (d3.select(this).datum().diffMes0Rel * 100).toFixed(2) + "% </div>"
			);
			bgAreaRectsTransparent.classed("sap_viz_ext_electionparty_bgAreaOverlay", true).classed("sap_viz_ext_electionparty_bgAreaOverlayTransparent", false);
			d3.select(this).classed("sap_viz_ext_electionparty_bgAreaOverlayTransparent", true).classed("sap_viz_ext_electionparty_bgAreaOverlay", false);
		});

		chart.on("mouseleave", function() {
			bgAreaRectsTransparent.classed("sap_viz_ext_electionparty_bgAreaOverlay", false).classed("sap_viz_ext_electionparty_bgAreaOverlayTransparent", true);
			ztooltip.visibility("none");
		});

		chart.on("mousemove", function() {
			ztooltip.move([(d3.event.pageY - 20 ) + "px", (d3.event.pageX + 20) + "px"]);
		});

		bgFullAreaRect.on("mouseenter", function() {
			d3.event.stopPropagation();
		});

	};
	return render;
});