define("sap_viz_ext_competitionchart-src/js/render", [], function() {
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

		var width = this.width();
		var height = this.height();
		var colorPalette = this.colorPalette();

		var showLabels = false;
		var additionalValue = false;

		var margin = {
			top: 40,
			right: 40,
			bottom: 40,
			left: 40
		};

		//Extract dimensions and measures from the dataset.
		var dset0 = data.meta.dimensions(0);
		var mset0 = data.meta.measures(0);
		var mset1 = data.meta.measures(1);
		var mset2;
		if (data.meta._meta.measureSets.length === 3) {
			additionalValue = true;
			mset2 = data.meta.measures(2);
		}

		var ds0 = dset0[0]; //Name
		var ms0 = mset0[0]; //Value
		var ms1 = mset1[0]; //Benefit
		var ms2;
		if (additionalValue) {
			ms2 = mset2[0]; //Additional
		}

		//Get data of first row
		var ownBenefit = data[0][ms1];
		var ownValue = data[0][ms0];
		var ownAdditional;
		if (additionalValue) {
			ownAdditional = data[0][ms2];
		}

		//Clone data
		var dataset = JSON.parse(JSON.stringify(data));

		//process data and calculate percentages
		data.forEach(function(d, i) {
			//Benefit
			dataset[i][ms1] = (d[ms1] / ownBenefit) * 100;

			//Value
			dataset[i][ms0] = (d[ms0] / ownValue) * 100;

			//Additional
			if (additionalValue) {
				dataset[i][ms2] = (d[ms2] / ownAdditional) * 100;
			}
		});

		//remove previous svg
		container.selectAll('svg').remove();

		//prepare svg canvas with width and height of container
		var svg = container.append('svg')
			.attr("width", width)
			.attr("height", height);

		//Square chart
		if (width < height)
			height = width;
		height = height - margin.top - margin.bottom;
		width = height;

		//Container for the chart
		svg = svg.append('g').attr('class', 'vis').attr('width', width).attr('height', height)
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		//Determine max and min of the data and add padding
		var xMax1 = (d3.max(dataset, function(d) {
			return d[ms1];
		}));
		var yMax1 = (d3.max(dataset, function(d) {
			return d[ms0];
		}));
		var xMin1 = (d3.min(dataset, function(d) {
			return d[ms1];
		}));
		var yMin1 = (d3.min(dataset, function(d) {
			return d[ms0];
		}));

		var xMax = xMax1 + (xMax1 - xMin1) * 0.1;
		var yMax = yMax1 + (yMax1 - yMin1) * 0.1;
		var xMin = xMin1 - (xMax1 - xMin1) * 0.1;
		var yMin = yMin1 - (yMax1 - yMin1) * 0.1;

		//X and Y scales    
		var x = d3.scale.linear()
			.domain([xMin, xMax])
			.range([0, height]);

		var y = d3.scale.linear()
			.domain([yMin, yMax])
			.range([height, 0]);

		//20 colors for the circles
		var color = d3.scale.ordinal()
			.range(colorPalette);

		//Create x and y axis
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");

		//Append x Axis
		svg.append("g")
			.attr("class", "sap_viz_ext_competitionchart_x sap_viz_ext_competitionchart_axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.append("text")
			.attr("class", "sap_viz_ext_competitionchart_label")
			.attr("x", height)
			.attr("y", -6)
			.attr("font-size", "1.3em")
			.style("text-anchor", "end")
			.text(ms1 + " in %");

		//Append y Axis
		svg.append("g")
			.attr("class", "sap_viz_ext_competitionchart_ sap_viz_ext_competitionchart_axis")
			.call(yAxis)
			.append("text")
			.attr("class", "sap_viz_ext_competitionchart_label")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.attr("font-size", "1.3em")
			.style("text-anchor", "end")
			.text(ms0 + " in %");

		//Draw line at 100% / 100%
		var lineX = {
			'x1': (function(d) {
				return x(xMin);
			}),
			'y1': (function(d) {
				return y(100);
			}),
			'x2': (function(d) {
				return x(xMax);
			}),
			'y2': (function(d) {
				return y(100);
			})
		};

		var lineY = {
			'x1': (function(d) {
				return x(100);
			}),
			'y1': (function(d) {
				return y(yMax);
			}),
			'x2': (function(d) {
				return x(100);
			}),
			'y2': (function(d) {
				return y(yMin);
			})
		};

		//Append both lines    
		var lines = svg.append("g");
		lines.append("svg:line")
			.attr("x1", lineX.x1)
			.attr("y1", lineX.y1)
			.attr("x2", lineX.x2)
			.attr("y2", lineX.y2)
			.attr("class", "sap_viz_ext_competitionchart_label-line");

		lines.append("svg:line")
			.attr("x1", lineY.x1)
			.attr("y1", lineY.y1)
			.attr("x2", lineY.x2)
			.attr("y2", lineY.y2)
			.attr("class", "sap_viz_ext_competitionchart_label-line");

		//Append circles 
		var circleGroup = svg.selectAll("sap_viz_ext_competitionchart_circleGroup")
			.data(dataset)
			.enter().append("g")
			.attr("class", "sap_viz_ext_competitionchart_circleGroup");

		var dots = circleGroup.append("circle")
			.attr("class", "sap_viz_ext_competitionchart_dot")
			.style("fill", function(d, i) {
				return color(i);
			});

		//Checkbox for labels
		var texts;

		svg.append("foreignObject")
			.attr("width", 100)
			.attr("height", 100)
			.attr("x", height)
			.append("xhtml:div")
			.html("<form><input type=checkbox id=sap_viz_ext_competitionchart_check style=display:inline-block/><b> Show labels</b></form>")
			.on("click", function(d, i) {
				showLabels = !showLabels;
				if (showLabels) {
					$("#sap_viz_ext_competitionchart_check").prop('checked', true);
					texts = circleGroup.append("text")
						.attr("text-anchor", "middle")
						.attr("dx", function(d) {
							return x(d[ms1]);
						})
						.attr("dy", function(d) {
							var returnValue;
							if (additionalValue) {
								returnValue = (y(d[ms0]) + ((d[ms2] / 5) + height / 60) * (height / 650));
							} else {
								returnValue = (y(d[ms0]) + height / 23);
							}
							return returnValue;

						})
						.attr("font-size", height / 60 + "px")
						.text(function(d) {
							return d[ds0];
						});
				} else {
					$("#sap_viz_ext_competitionchart_check").prop('checked', false);
					circleGroup.selectAll("text").remove();
				}
			});

		//Add tooltip
		dots.on("mouseover", function(d, i) {
			//Get mouse coordinates
			var coordinates = d3.mouse(this);

			//Append tooltip
			var tooltip = svg.append("g").attr("class", "sap_viz_ext_competitionchart_tooltip");
			tooltip.append("rect")
				.attr("class", "sap_viz_ext_competitionchart_label");
			tooltip.append("text")
				.attr("class", "sap_viz_ext_competitionchart_label_name");

			//Set position and opacity of tooltip
			tooltip
				.attr("x", coordinates[0] + 20)
				.attr("y", coordinates[1] + 20)
				.style("opacity", 1);

			//Add description for bubble size in tooltip	
			var bubbleSizeText;
			if (additionalValue) {
				bubbleSizeText = "<tspan x=\"" + (coordinates[0] + 20) + "\" dy=\"1.8em\"><tspan font-weight=\"bold\">" + ms2 + ": </tspan>" + (Math
					.round(d[ms2] * 10) / 10) + "%  (" + data[i][ms2] + ")</tspan>";
			} else {
				bubbleSizeText = "";
			}

			//Set text for tooltip
			var text = tooltip.select('.sap_viz_ext_competitionchart_label_name')
				.attr("fill", "#111")
				.attr("dy", "1.8em")
				.attr("x", coordinates[0] + 20)
				.attr("y", coordinates[1] + 20)
				.attr("font-size", "1.3em")
				.html("<tspan x=\"" + (coordinates[0] + 20) + "\" ><tspan font-weight=\"bold\">Name: </tspan>" + d[ds0] + "</tspan>" + "<tspan x=\"" +
					(coordinates[0] + 20) + "\" dy=\"1.8em\"><tspan font-weight=\"bold\">" + ms1 + ": </tspan>" + (Math.round(d[ms1] * 10) / 10) +
					"%  (" + data[i][ms1] + ")</tspan>" + "<tspan x=\"" + (coordinates[0] + 20) + "\" dy=\"1.8em\"><tspan font-weight=\"bold\">" + ms0 +
					": </tspan>" + (Math.round(d[ms0] * 10) / 10) + "%  (" + data[i][ms0] + ")</tspan>" + bubbleSizeText);

			//Used for the position of the label element
			var bbox = text.node().getBBox();

			//Background element for the text 
			tooltip.select('.sap_viz_ext_competitionchart_label')
				.attr("x", bbox.x - (bbox.width * 0.15))
				.attr("y", bbox.y - (bbox.height * 0.15))
				.attr("width", bbox.width * 1.35)
				.attr("height", bbox.height * 1.35)
				.attr("fill", "#ccc")
				.attr("stroke-width", 1)
				.attr("rx", 2)
				.attr("ry", 2)
				.attr("stroke", "#aaa")
				.attr("opacity", .8);

		})
			.on("mouseout", function(d, i) {
				//Remove tooltip
				d3.select(".sap_viz_ext_competitionchart_tooltip").remove();
			});

		//Add animation for circles    
		dots.transition()
			.duration(2000)
			.each("start", function() {
				d3.select(this)
					.attr("r", function(d) {
						var returnValue;
						if (additionalValue) {
							returnValue = ((d[ms2] / 14) * (height / 650));
						} else {
							returnValue = height / 65;
						}
						return returnValue;
					})
					.attr("cx", height / 2)
					.attr("cy", height / 2);
			})
			.attr("cx", function(d) {
				return x(d[ms1]);
			})
			.attr("cy", function(d) {
				return y(d[ms0]);
			})
			.attr("r", function(d) {
				var returnValue;
				if (additionalValue) {
					returnValue = ((d[ms2] / 6) * (height / 650));
				} else {
					returnValue = height / 44;
				}
				return returnValue;

			});

	};

	return render;
});