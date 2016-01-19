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
		var meas1 = data.meta.measures(0),
			meas2 = data.meta.measures(0),
			meas3 = data.meta.measures(0),
			dset1 = data.meta.dimensions(0),
			dset2 = data.meta.dimensions(0);

		//find names of measures and dimensions
		var measure1 = meas1[0],
			measure2 = meas2[1],
			measure3 = meas3[2],
			dim1 = dset1[0],
			dim2 = dset2[1]; 

		//convert measures into numbers
		data.forEach(function(d) {
			d[measure1] = +d[measure1];
			d[measure2] = +d[measure2];
			d[measure3] = +d[measure3];
		});
		// console.log(data);
		//prepare canvas with width and height of container
		var width = this.width(),
			height = this.height(),
			colorPalette = this.colorPalette();
		// properties = this.properties(),
		// dispatch = this.dispatch();

		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

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
			return d[measure2] * 1.1;
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
				return x(d[measure1]);
			})
			.attr("y", function(d) {
				console.log(d[measure3]);
				return y(d[measure3]);
			})
			.attr("width", function(d) {
				return x(d[measure2] - d[measure1]);
			})
			.attr("height", function(d) {
				return y(0) - y(d[measure3]);
			})
			.style("fill", function(d) {
				return color(d[dim2]);
			})
			.style("stroke", "black")
			.style("shape-rendering", "crispEdges");

		//Axes
		vis.append("g")
			.attr("class", "sap_viz_ext_extendedbarchart_x_axis")
			.attr("transform", "translate(0," + plotHeight + ")")
			.call(xAxis);

		vis.append("g")
			.attr("class", "sap_viz_ext_extendedbarchart_y_axis")
			.call(yAxis);

		vis.append("text")
			.attr("transform", "translate(" + (plotWidth / 2) + " ," + (plotHeight + margin.bottom - 5) + ")")
			.style("text-anchor", "middle")
			.text("X Axis");

		vis.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - margin.left)
			.attr("x", 0 - (plotHeight / 2))
			.attr("dy", "1em")
			.style("text-anchor", "middle")
			.text(measure3);

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