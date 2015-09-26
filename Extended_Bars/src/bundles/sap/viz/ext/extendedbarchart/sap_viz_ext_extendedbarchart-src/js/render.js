define("sap_viz_ext_extendedbarchart-src/js/render", [], function() {
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
		//Prepare canvas with width and height of container 

		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

		// START: sample render code for a column chart
		// Replace the code below with your own one to develop a new extension

		/**
		 * To get the dimension set, you can use either name or index of the dimension set, for example
		 *     var dset_xaxis = data.meta.dimensions('X Axis’);    // by name
		 *     var dset1 = data.meta.dimensions(0);                // by index
		 *
		 * To get the dimension or measure name, you should only use index of the dimension and avoid
		 * hardcoded names.
		 *     var dim1= dset_xaxis[0];        // the name of first dimension of dimension set ‘X Axis'
		 *
		 * The same rule also applies to get measures by using data.meta.measures()
		 */

		console.log(data);
		var margin = {
				top: 20,
				right: 20,
				bottom: 40,
				left: 40
			},
			plotWidth = width - margin.left - margin.right,
			plotHeight = height - margin.top - margin.bottom;
		//transform plot area
		vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		//create x and y scales, domains, and axes

		var color = d3.scale.ordinal()
			//.range(["#DDCC00", "#DD8000", "#8040AA", "#FF4000", "#FF40CC"]);
			.range(colorPalette);

		var x = d3.scale.linear()
			.range([0, plotWidth]);

		x.domain([0, d3.max(data, function(d) {
			return +d.enddepth * 1.1;
		})]);

		var y = d3.scale.linear()
			.range([plotHeight, 0]);

		/* dynamic axis sizing
        y.domain([0, d3.max(tdata, function (d) {
            return +d["Hg ng/g(dm)"]*1.1;
        })]);
        */

		//fixed axis at 350
		y.domain([0, 350]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickFormat(d3.format(".0f"));

		// Same for our left axis
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickFormat(d3.format(".0f"));

		var areabars = vis.selectAll(".areabars")
			.data(data)
			.enter().append("rect")
			.attr("x", function(d) {
				return x(+d.startdepth);
			})
			.attr("y", function(d) {
				console.log(d["Hg ng/g(dm)"]);
				return y(+d["Hg ng/g(dm)"]);
			})
			.attr("width", function(d) {
				return x(+d.enddepth - d.startdepth);
			})
			.attr("height", function(d) {
				return y(0) - y(+d["Hg ng/g(dm)"]);
			})
			.style("fill", function(d) {
				return color(d.needletype);
			})
			.style("stroke", "black")
			.style("shape-rendering", "crispEdges");

		//Axes
		vis.append("g")
			.attr("class", "sap_viz_ext_extendedbarchart x axis")
			.attr("transform", "translate(0," + plotHeight + ")")
			.call(xAxis);

		vis.append("g")
			.attr("class", "sap_viz_ext_extendedbarchart y axis")
			.call(yAxis);

		vis.append("text")
			.attr("transform", "translate(" + (plotWidth / 2) + " ," + (plotHeight + margin.bottom - 5) + ")")
			.style("text-anchor", "middle")
			.text("Depth (cm)");

		vis.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - margin.left)
			.attr("x", 0 - (plotHeight / 2))
			.attr("dy", "1em")
			.style("text-anchor", "middle")
			.text("Hg ng/g(dm)");

		//set style of axis and its ticks and text
		// $(".axis path, .axis line").css({
		// 	fill: 'none',
		// 	stroke: '#000',
		// 	'shape-rendering': 'crispEdges'
		// });
		// $(".axis text").css({
		// 	'font-size': '12px'
		// });
		// $(".axis > text").css({
		// 	"font-size": "16px",
		// 	"font-weight": "bold"
		// });
		// END: sample render code

	};

	return render;
});