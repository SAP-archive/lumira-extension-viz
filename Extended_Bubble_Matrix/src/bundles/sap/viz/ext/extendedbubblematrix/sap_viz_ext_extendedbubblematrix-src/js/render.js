define("sap_viz_ext_extendedbubblematrix-src/js/render", [], function() {
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
		/*******DATA MAPPING TO MEASURES AND DIMENSIONS*********/
		var mset1 = data.meta.measures(0),
			mset2 = data.meta.measures(1),
			mset3 = data.meta.measures(2),
			dset = data.meta.dimensions(0);

		//find names of measures and dimensions
		var measure1 = mset1[0],
			measure2 = mset2[0],
			measure3 = mset3[0],
			dim = dset[0];

		//convert measures into numbers
		data.forEach(function(d) {
			d[measure1] = +d[measure1];
			d[measure2] = +d[measure2];
			d[measure3] = +d[measure3];
		});

		//prepare canvas with width and height of container
		var margin = {
			top: 20,
			right: 20,
			bottom: 20,
			left: 40
		};
		var width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom,
			colorPalette = this.colorPalette();
		// properties = this.properties(),
		// dispatch = this.dispatch();

		var xDomainMin, xDomainMax, yDomainMin, yDomainMax, rDomainMin, rDomainMax;
		var showLabels = false;

		container.selectAll("svg").remove();
		var vis = container.append("svg").attr("class", "sap_viz_ext_extendedbubblematrix_grid").attr("width", width).attr("height", height)
			.append("g").attr("class", "vis").attr("width", width).attr("height", height);

		/******CALCULATE DOMAINS FOR BOTH AXES*********/
		xDomainMin = d3.min(data, function(d) {
			return +d[measure1] - 5;
		});
		xDomainMax = d3.max(data, function(d) {
			return +d[measure1] + 5;
		});
		yDomainMin = d3.min(data, function(d) {
			return +d[measure2] - 5;
		});
		yDomainMax = d3.max(data, function(d) {
			return +d[measure2] + 5;
		});
		rDomainMin = d3.min(data, function(d) {
			return +d[measure3];
		});
		rDomainMax = d3.max(data, function(d) {
			return +d[measure3];
		});

		/*******DETERMINE SCALES FOR AXES*******/
		var x = d3.scale.linear()
			.domain([xDomainMin, xDomainMax])
			.range([margin.left + 10, width - margin.right]);

		var y = d3.scale.linear()
			.domain([yDomainMin, yDomainMax])
			.range([height - margin.bottom - 10, margin.top]);

		/*******DRAW X AND Y AXES*******/
		var xAxis = d3.svg.axis()
			.scale(x);

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");

		vis.append("g")
			.attr("class", "sap_viz_ext_extendedbubblematrix_x_axis")
			.attr("transform", "translate(0, " + (height - margin.top - 10) + ")")
			.call(xAxis)
			.append("text")
			.attr("transform", "translate(" + (width / 2) + " ," + (margin.bottom + 10) + ")")
			.style("text-anchor", "middle")
			.text(measure1);

		vis.append("g")
			.attr("class", "sap_viz_ext_extendedbubblematrix_y_axis")
			.attr("transform", "translate(" + (margin.left + 10) + ", 0)")
			.call(yAxis)
			.append("text")
			.attr("transform", "translate(" + (-margin.right) + ", " + (height / 2) + "), rotate(-90)")
			.style("text-anchor", "middle")
			.text(measure2);

		/*******DRAW RECTANGULAR AREA --- POSITIVE CHART AREA*******/
		//calculate origin lines
		var xOrigin = function() {
				if ((x(0) > xDomainMin)) {
					return x(0);
				} else {
					return x(xDomainMin);
				}
			},
			yOrigin = function() {
				if ((y(0) > yDomainMin)) {
					return y(0);
				} else {
					return y(yDomainMin);
				}
			};

		vis.append("rect")
			.attr("x", xOrigin)
			.attr("y", 0)
			.attr("width", width)
			.attr("height", yOrigin)
			.attr("fill", "#e6e4e3");

		/*******DRAW GRID LINES*******/
		//vertical white grids
		function verticalGridLines() {
			return d3.svg.axis()
				.scale(x);
		}
		var verticalGrid = vis.append("g")
			.attr("class", "sap_viz_ext_extendedbubblematrix_verticalgrid")
			.attr("transform", "translate(0," + (height * 0.93) + ")")
			.call(verticalGridLines()
				.tickSize(-height, 10, 0)
				.tickFormat("")
			);
		verticalGrid.selectAll("line")
			.attr("class", "sap_viz_ext_extendedbubblematrix_vtick")
			.attr("stroke", "#fff")
			.attr("opacity", "1")
			.attr("stroke-dasharray", "10, 10");

		//horizontal white grids
		function horizontalGridLines() {
			return d3.svg.axis()
				.scale(y)
				.orient("left");
		}
		var horizontalGrid = vis.append("g")
			.attr("class", "sap_viz_ext_extendedbubblematrix_horizontalgrid")
			.attr("transform", "translate(" + (margin.left * 1.25) + ", 0)")
			.call(horizontalGridLines()
				.tickSize(-width, 0, 0)
				.tickFormat("")
			);
		horizontalGrid.selectAll("line").attr("class", "sap_viz_ext_extendedbubblematrix_htick")
			.attr("stroke", "#fff")
			.attr("opacity", "1")
			.attr("stroke-dasharray", "10, 10");

		//horizontal black origin grid line
		function horizontalBlackGridLine() {
			return d3.svg.axis()
				.scale(y)
				.orient("left")
				.tickValues([0]);
		}
		var blackGrid = vis.append("g")
			.attr("class", "sap_viz_ext_extendedbubblematrix_blackgrid")
			.attr("transform", "translate(" + (margin.left) + ", 0)")
			.call(horizontalBlackGridLine()
				.tickSize(-width, 0, 0)
				.tickFormat("")
			);
		blackGrid.selectAll("line").attr("class", "sap_viz_ext_extendedbubblematrix_btick")
			.attr("stroke", "#000")
			.attr("opacity", "1")
			.attr("stroke-dasharray", "10, 10");

		/*******DRAW BUBBLES*******/

		var color = d3.scale.ordinal()
			.range(colorPalette);

		var xPosition = function(d) {
			return x(d[measure1]);
		};
		var yPosition = function(d) {
			return y(d[measure2]);
		};
		var radius = function(d) {
			return (d[measure3] * margin.left) / rDomainMax;
		};

		//Append bubbles			
		var bubbles = vis.selectAll(".node")
			.data(data)
			.enter()
			.append("g");

		bubbles.append("circle")
			.attr("class", "sap_viz_ext_extendedbubblematrix_bubble")
			.attr("cx", xPosition)
			.attr("cy", yPosition)
			.attr("r", radius)
			.style("fill", function(d, i) {
				return color(i);
			});
		/*******ADD TOOLTIP FOR BUBBLES*******/
		bubbles.on("mouseover", function(d) {
			//declare variable for getting current mouse position
			var position = d3.mouse(this);

			//append tooltip element
			var tooltip = vis.append("g")
				.attr("class", "sap_viz_ext_extendedbubblematrix_tooltip-container");

			//append tooltip text
			var tooltip_text = tooltip.append("text").attr("class", "sap_viz_ext_extendedbubblematrix_tooltip-text")
				.attr("x", position[0] - 50)
				.attr("y", position[1] + 15)
				.attr("dy", "1.2em")
				.attr("font-size", "1.3em")
				.attr("font-family", "sans-serif")
				.html("<tspan dy=\"1.2em\" font-weight=\"bold\">" + [dim] + "</tspan>: <tspan>" + d[dim] + "</tspan>" +
					"<tspan x=\"" + (position[0] - 50) + "\" dy=\"1.2em\" font-weight=\"bold\">" + [measure1] + "</tspan>: <tspan>" + d[measure1] +
					"</tspan>" +
					"<tspan x=\"" + (position[0] - 50) + "\" dy=\"1.2em\" font-weight=\"bold\">" + [measure2] + "</tspan>: <tspan>" + d[measure2] +
					"</tspan>" +
					"<tspan x=\"" + (position[0] - 50) + "\" dy=\"1.2em\" font-weight=\"bold\">" + [measure3] + "</tspan>: <tspan>" + d[measure3] +
					"</tspan>");

			//append tooltip rectangular label
			var bbox = tooltip_text.node().getBBox();
			var bboxw = bbox.width * 1.1;
			tooltip.append("rect").attr("class", "sap_viz_ext_extendedbubblematrix_tooltip-label")
				.attr("x", position[0] - 55)
				.attr("y", position[1] + 15)
				.attr("width", bboxw)
				.attr("height", 75)
				.attr("fill", "#F9FBF7")
				.attr("stroke", "#000")
				.attr("stroke-width", 0.5)
				.style("opacity", 0.3);

		})
			.on("mouseout", function() {
				d3.select(".sap_viz_ext_extendedbubblematrix_tooltip-container").remove();
			});

		/************ADD LABELS FOR BUBBLES*******************/
		vis.append("foreignObject")
			.attr("width", 200)
			.attr("height", 100)
			.attr("x", width - (margin.left * 3.5))
			.append("xhtml:div")
			.html(
				"<form><input type=checkbox id=sap_viz_ext_extendedbubblematrix_check style=display:inline-block/><tspan font-weight=\"bold\" font-family=\"Sans-Serif\" font-size=\"12px\">SHOW DATA LABELS</tspan></form>"
		)
			.on("click", function(d) {
				showLabels = !showLabels;
				if (showLabels) {
					$("#sap_viz_ext_extendedbubblematrix_check").prop('checked', true);
					bubbles.append("text")
						.attr("text-anchor", "middle")
						.attr("dx", function(d) {
							return x(d[measure1]);
						})
						.attr("dy", function(d) {
							return y(d[measure2]);

						})
						.attr("font-size", "12px")
						.attr("font-family", "Sans-Serif")
						.text(function(d) {
							return d[dim];
						});
				} else {
					$("#sap_viz_ext_extendedbubblematrix_check").prop('checked', false);
					bubbles.selectAll("text").remove();
				}
			});
	};

	return render;
});