define("limitless_viz_ext_chartwithtooltipandimage-src/js/render", ['require', 'd3tooltip'], function(require, d3tooltip) {
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
		/*colorPalette = this.colorPalette(),
			properties = this.properties(),
			dispatch = this.dispatch();*/

		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('class', 'vis')
			.attr('width', width)
			.attr('height', height);

		var meta = data.meta;
		var dim = meta.dimensions('X Axis')[0];
		var measures = meta.measures('Y Axis');

		var margin = {
			top: 40,
			right: 20,
			bottom: 30,
			left: 40
		};
		width = width - margin.left - margin.right;
		height = height - margin.top - margin.bottom;

		// Our X scale
		var x = d3.scale.ordinal()
			.rangeRoundBands([0, width - 50], .1);

		// Our Y scale
		var y = d3.scale.linear()
			.rangeRound([height, 100]);

		// Our color bands
		var color = d3.scale.ordinal()
			.range(["#2E9AFE", "#81BEF7", "#CED8F6"]);

		// Use our X scale to set a bottom axis
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		// Same for our left axis
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickFormat(d3.format(".2s"));

		// Add our chart to the #chart div
		var svg = vis
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var tip = d3.tip()
			.attr("class", "limitless_viz_ext_chartwithtooltipandimage_d3-tip")
			.offset([-10, 0])
			.html(function(d) {
				return "<strong>" + (d.name) + ":</strong> <span style='color:red'>" + d.oVal + "</span>" +
					"<br/><strong>Total:</strong> <span style='color:red'>" + d.total + "</span>";
			});
		svg.call(tip);

		// Make sure our numbers are really numbers
		data.forEach(function(d) {
			d[measures[0]] = +d[measures[0]];
			d[measures[1]] = +d[measures[1]];
			d[measures[2]] = +d[measures[2]];
		});

		// Map our columns to our colors
		color.domain(d3.keys(data[0]).filter(function(key) {
			return key !== dim;
		}));

		data.forEach(function(d) {
			var y0 = 0,
				oVal = 0;
			d.types = color.domain().map(function(name) {
				return {
					name: name,
					oVal: d[name],
					y0: y0,
					y1: y0 += +d[name]
				};
			});
			d.total = d.types[d.types.length - 1].y1;
			d.types.forEach(function(type_obj) {
				type_obj.total = d.total;
			});
		});

		// Our X domain is our set of Countries
		x.domain(data.map(function(d) {
			return d[dim];
		}));

		// Our Y domain is from zero to our highest total
		y.domain([0, d3.max(data, function(d) {
			return d.total;
		})]);

		svg.append("g")
			.attr("class", "limitless_viz_ext_chartwithtooltipandimage_x_axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "limitless_viz_ext_chartwithtooltipandimage_y_axis")
			.call(yAxis);

		var countries = svg.selectAll(".X Axis")
			.data(data)
			.enter().append("g")
			.attr("class", "g")
			.attr("transform", function(d) {
				return "translate(" + x(d[dim]) + ",0)";
			});

		countries.selectAll("rect")
			.data(function(d) {
				return d.types;
			})
			.enter().append("rect")
			.attr("width", x.rangeBand())
			.attr("y", function(d) {
				return y(d.y1);
			})
			.attr("height", function(d) {
				return y(d.y0) - y(d.y1);
			})
			.style("fill", function(d) {
				return color(d.name);
			})
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide);

		svg.selectAll("image").
		//data(data).enter().append("image").attr("xlink:href","https://upload.wikimedia.org/wikipedia/commons/d/d8/Compass_card_(de).svg")
		data(data).enter().append("image").attr("xlink:href", function(d) {
			var imgUrl = require.toUrl("limitless_viz_ext_chartwithtooltipandimage-src/resources/Images/" + d[dim] + ".png");
			return imgUrl;
		})
			.attr("x", function(d) {
				return x(d[dim]);
			}).attr("y", function(d) {
				return y(d.total) - 30;
			})
			.attr("width", x.rangeBand())
			.attr("height", 50).attr("style", "middle");

		var legend = svg.selectAll(".limitless_viz_ext_chartwithtooltipandimage_legend")
			.data(color.domain().slice().reverse())
			.enter().append("g")
			.attr("class", "limitless_viz_ext_chartwithtooltipandimage_legend")
			.attr("transform", function(d, i) {
				return "translate(0," + i * 20 + ")";
			});

		legend.append("rect")
			.attr("x", width - 18)
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color);

		legend.append("text")
			.attr("x", width - 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) {
				return d;
			});

	};

	return render;
});