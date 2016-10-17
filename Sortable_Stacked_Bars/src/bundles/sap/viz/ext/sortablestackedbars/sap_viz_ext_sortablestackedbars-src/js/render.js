define("sap_viz_ext_sortablestackedbars-src/js/render", [], function() {
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
	var sortBy;
	var sortSign = 1;
	var render = function(data, container) {
		var width = this.width(),
			height = this.height(),
			margin = {
				top: 0,
				right: 90,
				bottom: 15,
				left: 70
			},
			plotWidth = width - margin.left - margin.right,
			plotHeight = height - margin.top - margin.bottom;
		var barHeight = 30;
		var colorPalette = this.properties().colorPalette;

		//get Dimensions and Measures
		var dset1 = data.meta.dimensions(0),

			dimName = dset1[0];

		var mesValues = data.meta.measures(0);

		if (sortBy) {
			data.sort(function(a, b) {
				return sortSign*(b[mesValues[sortBy]] - a[mesValues[sortBy]]);
			});
		}

		function sumUp(arr, start, end) {
			var result = 0;
			for (var i = start; i <= end; i++) {
				result += arr[mesValues[i]];
			}
			return result;
		}
		container.selectAll("svg").remove();
		var svg = container.append("svg").attr("width", width).attr("height", "100%");
		var vis = svg.append("g").attr("class", "vis").attr("width", plotWidth).attr("height", "100%");
		var legend = svg.append("g").attr("class", "v-m-ColorLegend").attr("width", margin.right).attr("height", "100%").attr("transform",
			"translate(" + (plotWidth + 80) + ", 0)");
		var legendContent = legend.append("g").attr("class", "v-content");
		legendContent.append("text").attr("class", "v-title viz-legend-title").attr("dy", "14").attr("font-weight", "bold").attr("font-size",
			"14px").text("Measures");
		var legendContentElements = legendContent.append("g").attr("class", "v-groups v-label viz-legend-valueLabel").attr("transform",
				"translate(0, 22)").attr("font-size", "14px")
			.append("g").attr("class", "v-legend-content");

		vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		d3.select(".v-m-plot").attr("transform", "");

		d3.isv = {};
		//Stand Alone Tooltip implementation
		d3.selectAll("#sap_viz_ext_sortablestackedbars_t-tip").remove();

		d3.isv.tooltip = function() {
			var html = "tooltip",
				classed = "left",
				x = 10,
				y = 10,
				position = [x, y],
				disp = "none";

			function tooltip() {
				// generate tooltip here, using `width` and `height`
				var tt = d3.select("body").append("div").attr("id", "sap_viz_ext_sortablestackedbars_t-tip").attr("class", "v-m-tooltip").style(
					"display", disp);
				var tooltip = tt.append("div").attr("class", "sap_viz_ext_sortablestackedbars_att-inner").style("text-align", "left");
				tooltip.append("div").attr("id", "sap_viz_ext_electionextension_main").attr("class", "v-background").append("div").attr("id",
					"tt-body").attr("class", "v-tooltip-mainDiv");
				tooltip.visibility = function(value) {
					//if (!arguments.length) return html;
					d3.selectAll("#sap_viz_ext_sortablestackedbars_t-tip").style("display", value);
				};
				tooltip.move = function(value) {
					d3.selectAll("#sap_viz_ext_sortablestackedbars_t-tip").style("top", value[0]).style("left", value[1]);
				};
				tooltip.fillData = function(value) {
					d3.selectAll("#sap_viz_ext_sortablestackedbars_t-tip #tt-body").html(value);
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

		var zt_tip = new d3.isv.tooltip();
		var ztooltip = zt_tip();
		vis.append("text").attr("x", -plotHeight / 2).attr("y", -margin.left + 12).text(dimName).attr("transform", "rotate(-90)").style(
			"text-anchor", "middle").attr("class", "sap_viz_ext_sortablestackedbars_labelYAxis");
		vis.append("text").attr("x", plotWidth / 2).attr("y", plotHeight + 25 + margin.bottom).text(function() {
				var result = "";
				for (var y = 0; y < mesValues.length - 1; y++) {
					result = result + mesValues[y];
					result = result + " & ";
				}
				result = result + mesValues[mesValues.length - 1];
				return result;
			}).style("text-anchor", "middle")
			.attr("class", "sap_viz_ext_sortablestackedbars_labelXAxis");

		var maxWidth = 0;
		var maxSpacesLeft = [];
		for (var i = 0; i < mesValues.length; i++) {
			var maxSpaceLeft = 0,
				maxSpaceRight = 0;
			for (var j = 0; j < data.length; j++) {
				var spaceLeft = sumUp(data[j], 0, i - 1);
				var spaceRight = sumUp(data[j], i, mesValues.length - 1);
				maxSpaceLeft = Math.max(maxSpaceLeft, spaceLeft);
				maxSpaceRight = Math.max(maxSpaceRight, spaceRight);
			}
			maxWidth = Math.max(maxWidth, maxSpaceLeft + maxSpaceRight);
			maxSpacesLeft.push(maxSpaceLeft);
			var legendRow = legendContentElements.append("g").attr("class", "v-row sap_viz_ext_sortablestackedbars_legendItemHover").attr("transform", "translate(0, " + i * 20 + ")");
			legendRow.append("rect").attr("width", "12").attr("height", "12").attr("fill", colorPalette[i]).attr("transform", "translate(0, 2)").datum({
				"idx": i
			}).on("click", function(d) {
				repositionBars(d.idx, 1000);
			});
			legendRow.append("text").attr("x", "18").attr("y", "12").text(mesValues[i]).datum({
				"idx": i
			}).on("click", function(d) {
				repositionBars(d.idx, 1000);
			});
		}

		var scaleX = d3.scale.linear()
			.domain([0, maxWidth])
			.range([0, plotWidth]);
		var scaleXForAxis = d3.scale.linear()
			.domain([0, maxWidth])
			.range([0, plotWidth]);
		var scaleY = d3.scale.ordinal()
			.rangeRoundBands([0, plotHeight], (1.0 / 3.0), (1.0 / 6.0)).domain(data.map(function(d) {
				return d[dimName];
			}));

		barHeight = scaleY.rangeBand();

		var xAxis = d3.svg.axis()
			.scale(scaleXForAxis)
			.orient("bottom")
			.tickFormat(Math.abs);

		var yAxis = d3.svg.axis()
			.scale(scaleY)
			.orient("left");

		vis.append("g")
			.attr("class", "v-m-axisBody")
			.attr("id", "sap_viz_ext_sortablestackedbars_SortableStackedBarsYAxis")
			.call(yAxis);

		d3.select("#sap_viz_ext_sortablestackedbars_SortableStackedBarsYAxis > .tick > line").style("display", "none");

		vis.append("g").attr("class", "v-m-axisBody")
			.attr("id", "sap_viz_ext_sortablestackedbars_SortableStackedBarsXAxis")
			.attr("transform", "translate(0, " + plotHeight + ")")
			.call(xAxis);

		d3.select("#sap_viz_ext_sortablestackedbars_SortableStackedBarsYAxis").selectAll(".tick > line").attr("transform", "translate(0, " + (-3.0 / 4.0 * barHeight) + ")");

		var barGroups = vis.selectAll("barGroup").data(data).enter().append("g").classed("barGroup", true).attr("transform", function(d, idx) {
			return "translate(0, " + scaleY(d[dimName]) + ")";
		});

		barGroups.each(function(d, idx) {
			var group = d3.select(this);
			for (var l = 0; l < mesValues.length; l++) {
				var x = scaleX(sumUp(d, 0, l - 1));
				group.append("rect").classed("barRect", true).attr("x", x).attr("height", barHeight).attr("fill", colorPalette[l]).attr("width",
					scaleX(d[mesValues[l]])).datum({
					"dataSet": d,
					"idx": l
				});

				group.append("rect").classed("sap_viz_ext_sortablestackedbars_barRectHover", true).attr("x", x).attr("height", barHeight).attr("fill", "black").attr("width",
					scaleX(d[mesValues[l]])).datum({
					"dataSet": d,
					"idx": l
				});
			}
		});

		function updateTooltip(d) {
			ztooltip.fillData("<table><tr><td class=\"sap_viz_ext_sortablestackedbars_tooltipItemName\">" + dimName + ": </td><td class=\"sap_viz_ext_sortablestackedbars_tooltipItemValue\">" + d.dataSet[
					dimName
				] + "</td></tr>" + "<tr><td class=\"sap_viz_ext_sortablestackedbars_tooltipItemName\">" + mesValues[d.idx] + ": </td><td class=\"sap_viz_ext_sortablestackedbars_tooltipItemValue\">" + d.dataSet
				[mesValues[d.idx]] + "</td></tr></table>");
		}

		function handleMouseMove(d) {
			d3.selectAll(".sap_viz_ext_sortablestackedbars_barRectHover").classed("hover", false);
			d3.select(this).classed("hover", true);
			ztooltip.move([(d3.event.pageY) + "px", (d3.event.pageX) + "px"]);
			ztooltip.visibility("");
			updateTooltip(d);
		}

		d3.selectAll(".sap_viz_ext_sortablestackedbars_barRectHover").on("mouseout", function() {
			ztooltip.visibility("none");
			d3.select(this).classed("hover", false);
		}).on("mousemove", handleMouseMove);

		function repositionBars(idx, duration, event) {
			sortSign = sortBy === idx ? sortSign*-1 : 1;

			d3.select("#sap_viz_ext_sortablestackedbars_SortableStackedBarsYAxis > .tick > line").style("display", "");
			barGroups.sort(function(a, b) {
				return sortSign*(b[mesValues[idx]] - a[mesValues[idx]]);
			});
			data.sort(function(a, b) {
				return sortSign*(b[mesValues[idx]] - a[mesValues[idx]]);
			});
			scaleY.domain(data.map(function(d) {
				return d[dimName];
			}));
			barGroups.transition().duration(duration).attr("transform", function(d, n) {
				var transformX = scaleX(maxSpacesLeft[idx] - sumUp(d, 0, idx - 1));
				return "translate(" + transformX + ", " + scaleY(d[dimName]) + ")";
			});
			d3.select("#sap_viz_ext_sortablestackedbars_SortableStackedBarsYAxis").transition().duration(duration).call(yAxis);
			d3.select("#sap_viz_ext_sortablestackedbars_SortableStackedBarsYAxis").selectAll(".tick > line").attr("transform", "translate(0, " + (-3.0 / 4.0 * barHeight) + ")");
			scaleXForAxis.domain([-maxSpacesLeft[idx], maxWidth - maxSpacesLeft[idx]]);
			d3.select("#sap_viz_ext_sortablestackedbars_SortableStackedBarsXAxis").transition().duration(duration).call(xAxis);
			d3.select("#sap_viz_ext_sortablestackedbars_SortableStackedBarsYAxis > .tick > line").style("display", "none");
			sortBy = idx;
			if (event) {
				window.setTimeout(refreshTooltip, 1100, event.pageX, event.pageY);
			}

		}

		d3.selectAll(".sap_viz_ext_sortablestackedbars_barRectHover").on("click", function(d) {
			repositionBars(d.idx, 1000, d3.event);
		});

		if (sortBy) {
			repositionBars(sortBy, 0, null);
		}

		function refreshTooltip(x, y) {
			var el = document.elementFromPoint(x, y);
			d3.selectAll(".sap_viz_ext_sortablestackedbars_barRectHover").classed("hover", false);
			d3.select(el).classed("hover", true).call(function(rect) {updateTooltip(rect.datum());});
		}

	};
	return render;
});