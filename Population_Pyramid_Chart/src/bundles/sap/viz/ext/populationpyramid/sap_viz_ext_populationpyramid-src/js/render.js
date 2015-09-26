define("sap_viz_ext_populationpyramid-src/js/render", [], function() {
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

		var margin = {
				top: 20,
				right: 40,
				bottom: 30,
				left: 20
			},
			width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom,
			colorPalette = this.colorPalette(),
			properties = this.properties(),
			dispatch = this.dispatch();
		//Prepare canvas with width and height of container  
		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

		// START: sample render code for a column chart
		var meta = data.meta;
		var dims = meta.dimensions('X Axis');
		var Y_measure = meta.measures('Y Axis')[0];

		barWidth = Math.floor(width / 19) - 1;

		var x = d3.scale.linear()
			.range([barWidth / 2, width - barWidth / 2]);

		var y = d3.scale.linear()
			.range([height, 0]);

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("right")
			.tickSize(-width)
			.tickFormat(function(d) {
				return Math.round(d / 1e6) + "M";
			});

		// An SVG element with a bottom-right origin.
		var svg = vis
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// A sliding container to hold the bars by birthyear.
		var birthyears = svg.append("g")
			.attr("class", "birthyears");

		// A label for the current year.
		var title = svg.append("text")
			.attr("class", "sap_viz_ext_populationpyramid title")
			.attr("dy", ".71em")
			.text(2000);

		// Convert strings to numbers.
		data.forEach(function(d) {
			d[Y_measure] = +d[Y_measure];
			d[dims[0]] = +d[dims[0]];
			d[dims[1]] = +d[dims[1]];
		});

		// Compute the extent of the data set in age and years.
		var age1 = d3.max(data, function(d) {
				return d[dims[1]];
			}),
			year0 = d3.min(data, function(d) {
				return d[dims[0]];
			}),
			year1 = d3.max(data, function(d) {
				return d[dims[0]];
			}),
			year = year1;

		// Update the scale domains.
		x.domain([year1 - age1, year1]);
		y.domain([0, d3.max(data, function(d) {
			return d[Y_measure];
		})]);

		// Produce a map from year and birthyear to [male, female].
		data = d3.nest()
			.key(function(d) {
				return d[dims[0]];
			})
			.key(function(d) {
				return d[dims[0]] - d[dims[1]];
			})
			.rollup(function(v) {
				return v.map(function(d) {
					return d[Y_measure];
				});
			})
			.map(data);

		// Add an axis to show the population values.
		svg.append("g")
			.attr("class", "sap_viz_ext_populationpyramid y axis")
			.attr("transform", "translate(" + width + ",0)")
			.call(yAxis)
			.selectAll("g")
			.filter(function(value) {
				return !value;
			})
			.classed("sap_viz_ext_populationpyramid zero", true);

		// Add labeled rects for each birthyear (so that no enter or exit is required).
		var birthyear = birthyears.selectAll(".birthyear")
			.data(d3.range(year0 - age1, year1 + 1, 5))
			.enter().append("g")
			.attr("class", "sap_viz_ext_populationpyramid birthyear")
			.attr("transform", function(birthyear) {
				return "translate(" + x(birthyear) + ",0)";
			});

		birthyear.selectAll("rect")
			.data(function(birthyear) {
				return data[year][birthyear] || [0, 0];
			})
			.enter().append("rect")
			.attr("class", "sap_viz_ext_populationpyramid")
			.attr("x", -barWidth / 2)
			.attr("width", barWidth)
			.attr("y", y)
			.attr("height", function(value) {
				return height - y(value);
			});

		// Add labels to show birthyear.
		birthyear.append("text")
			.attr("y", height - 4)
			.text(function(birthyear) {
				return birthyear;
			});

		// Add labels to show age (separate; not animated).
		svg.selectAll(".sap_viz_ext_populationpyramid.age")
			.data(d3.range(0, age1 + 1, 5))
			.enter().append("text")
			.attr("class", "sap_viz_ext_populationpyramid age")
			.attr("x", function(age) {
				return x(year - age);
			})
			.attr("y", height + 4)
			.attr("dy", ".71em")
			.text(function(age) {
				return age;
			});

		// Allow the arrow keys to change the displayed year.
		window.focus();
		d3.select(window).on("keydown", function() {
			switch (d3.event.keyCode) {
				case 37:
					year = Math.max(year0, year - 10);
					break;
				case 39:
					year = Math.min(year1, year + 10);
					break;
			}
			update();
		});

		function update() {
			if (!(year in data)) return;
			title.text(year);

			birthyears.transition()
				.duration(750)
				.attr("transform", "translate(" + (x(year1) - x(year)) + ",0)");

			birthyear.selectAll("rect")
				.data(function(birthyear) {
					return data[year][birthyear] || [0, 0];
				})
				.transition()
				.duration(750)
				.attr("y", y)
				.attr("height", function(value) {
					return height - y(value);
				});
		}

		// END: sample render code

	};

	return render;
});