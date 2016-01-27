define("sap_viz_ext_tubblechart-src/js/render", [], function() {
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
			height = this.height();
			// colorPalette = this.colorPalette(),
			// properties = this.properties(),
			// dispatch = this.dispatch();
		//prepare canvas with width and height of container
		container.selectAll("svg").remove();
		var vis = container.append("svg").attr("width", width).attr("height", height)
			.append("g").attr("class", "vis").attr("width", width).attr("height", height);

		var svg = vis.append("g");

		var margin = {
			top: 20,
			right: 20,
			bottom: 25,
			left: 70
		};

		//Read data feeds   
		// var dsets = data.meta.dimensions(),
		// 	msets = data.meta.measures();

		var mset1 = data.meta.measures(0),
			dset1 = data.meta.dimensions(0),
			dset2 = data.meta.dimensions(1),
			measureName = mset1[0], // Find name of measure                                                   
			dimension1 = dset1[0], // Find name of dimension
			dimension2 = dset2[0];

		//Convert measure into number
		data.forEach(function(d) {
			d[measureName] = +d[measureName];
		});

		//Find domain of data in order to calculate maximum radius of circles
		var xDomain = d3.scale.ordinal()
			.domain(data.map(function(d) {
				return d[dimension1];
			}));

		var yDomain = d3.scale.ordinal()
			.domain(data.map(function(d) {
				return d[dimension2];
			}));

		//Find maximum radius
		var rMax = (width - margin.left) / xDomain.domain().length;
		var radius2 = height / yDomain.domain().length;

		if (radius2 < rMax) {
			rMax = radius2;
		}

		//Scales for axis
		var xScale = d3.scale.ordinal()
			.domain(data.map(function(d) {
				return d[dimension1];
			}))
			.rangeBands([margin.left, width - rMax]);

		var yScale = d3.scale.ordinal()
			.domain(data.map(function(d) {
				return d[dimension2];
			}))
			.rangeBands([rMax, height]);

		//Radius scale for bubbles		
		var r = d3.scale.linear()
			.domain([0, d3.max(data, function(d) {
				return d[measureName];
			})])
			.range([0, rMax / 2.5]);

		//Create axis
		var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
		var yAxis = d3.svg.axis().scale(yScale).orient("left");

		svg.append("g")
			.attr("class", "sap_viz_ext_tubblechart_axis")
			.attr("transform", "translate(" + 0 + ", " + (height - margin.top) + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "sap_viz_ext_tubblechart_axis")
			.attr("transform", "translate(" + margin.left + "," + -margin.bottom + " )")
			.call(yAxis);

		//Calculate margins from top and sides
		var paddingX = ((width - rMax - margin.left) / xScale.domain().length / 2);
		var paddingY = ((height - rMax) / yScale.domain().length / 2) - margin.bottom;

		//max and min value for coloring bubbles
		var maxValue = d3.max(data, function(d) {
			return d[measureName];
		});
		var minValue = d3.min(data, function(d) {
			return d[measureName];
		});

		//Color generator
		var color = d3.scale.linear()
			.domain([r(minValue), r(maxValue)])
			.range(['#55B4FF', '#16458E']);

		//Draw vertical lines for each row	
		yScale.domain().forEach(drawVerticalLines);

		function drawVerticalLines(item) {
			svg.append("line")
				.attr("x1", margin.left + 5)
				.attr("y1", paddingY + yScale(item))
				.attr("x2", width - rMax)
				.attr("y2", paddingY + yScale(item))
				.attr("class", "sap_viz_ext_tubblechart_v-line");
		}

		//Create tooltip for mouse over action
		var tooltip;

		function showTooltip(value, x, y) {
			tooltip = svg.append("text").text(value)
				.attr("x", x)
				.attr("y", y)
				.attr("dy", ".35em")
				.style("text-anchor", "middle")
				.attr("class", "sap_viz_ext_tubblechart_text");
		}

		function hideTooltip() {
			tooltip.remove();
		}

		//Create circles
		var circles = svg.selectAll(".node")
			.data(data)
			.enter()
			.append("circle")
			.attr("class", "sap_viz_ext_tubblechart_circle")
			.attr("cy", function(d) {
				return paddingY + yScale(d[dimension2]);
			})
			.attr("cx", function(d) {
				return paddingX + xScale(d[dimension1]);
			})
			.attr("r", 0)
			.on("mouseover", function(d) {
				showTooltip(d[measureName], paddingX + xScale(d[dimension1]), paddingY + yScale(d[dimension2]));
			})
			.on("mouseout", function(d) {
				hideTooltip();
			});

		//add transition effect by growing them from 0 to radius
		circles.transition()
			.duration(2500)
			.style("fill", function(d) {
				return color(r(d[measureName]));
			})
			.attr("stroke", "white")
			.attr("shape-rendering", "geometricPrecision")
			.attr("stroke-width", rMax / 15)
			.attr("r", function(d) {
				return r(d[measureName]);
			});

	};

	return render;
});