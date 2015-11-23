define("sap_viz_ext_chordchart-src/js/render", [], function() {
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
			colorPalette = this.colorPalette(),
			properties = this.properties(),
			dispatch = this.dispatch();
		//Prepare canvas with width and height of container  
		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

		var meta = data.meta;
		var ds = meta.dimensions('Choice');
		var ms = meta.measures('Count');
		var dim_current = ds[0];
		var dim_preferred = ds[1];
		var measure_count = ms[0];

		data.forEach(function(d) {
			d[measure_count] = +d[measure_count];
		});
		
		console.log(data);

		//Matrix size is always the square root of the number of rows for chord diagrams
		var matrixSize = Math.sqrt(data.length);
		//console.log(JSON.stringify(data));
		//Initialize matrix and fill with zero
		var matrix = new Array();
		for (var i = 0; i < matrixSize; i++) {
			matrix[i] = new Array();
			for (var j = 0; j < matrixSize; j++) {
				matrix[i][j] = 0;
			}
		}

		var allNodes = new Array();
		data.forEach(function(element) {
			allNodes.push(element[dim_current]);
			allNodes.push(element[dim_preferred]);
		});
		var uniqueNodes = new Array();
		var item;
		for (i = 0; i < allNodes.length; i++) {
			item = allNodes[i];
			if (uniqueNodes.indexOf(item) < 0) {
				uniqueNodes[uniqueNodes.length] = item;
			}
		}
		//console.log(JSON.stringify(uniqueNodes));
		data.forEach(function(element) {
			var i, j;
			i = uniqueNodes.indexOf(element[dim_current]);
			j = uniqueNodes.indexOf(element[dim_preferred]);
			matrix[i][j] = element[measure_count];
		});
		// console.log(JSON.stringify(matrix));

		var chord = d3.layout.chord()
			.padding(.05)
			.sortSubgroups(d3.descending)
			.matrix(matrix);

		var innerRadius = Math.min(width, height) * .41,
			outerRadius = innerRadius * 1.1;

		var fill = d3.scale.category20();
		// .domain(d3.range(4))
		// .range(["#ED1B24", "#3A92C5", "#F1006C", "#FAE00E"]);

		var vis_g = vis.append("g")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

		vis_g.append("g").selectAll("path")
			.data(chord.groups)
			.enter().append("path")
			.style("fill", function(d) {
				return fill(d.index);
			})
			.style("stroke", function(d) {
				return fill(d.index);
			})
			.attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
			.on("mouseover", fade(.1))
			.on("mouseout", fade(1));

		var ticks = vis_g.append("g").selectAll("g")
			.data(chord.groups)
			.enter().append("g").selectAll("g")
			.data(groupTicks)
			.enter().append("g")
			.attr("transform", function(d) {
				return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + "translate(" + outerRadius + ",0)";
			});

		ticks.append("line")
			.attr("x1", 1)
			.attr("y1", 0)
			.attr("x2", 5)
			.attr("y2", 0)
			.style("stroke", "#000");

		ticks.append("text")
			.attr("x", 8)
			.attr("dy", ".35em")
			.attr("transform", function(d) {
				return d.angle > Math.PI ? "rotate(180)translate(-16)" : null;
			})
			.style("text-anchor", function(d) {
				return d.angle > Math.PI ? "end" : null;
			})
			.text(function(d) {
				return d.label;
			});

		vis_g.append("g")
			.attr("class", "sap_viz_ext_chord_chord")
			.selectAll("path")
			.data(chord.chords)
			.enter().append("path")
			.attr("d", d3.svg.chord().radius(innerRadius))
			.style("fill", function(d) {
				return fill(d.target.index);
			})
			.style("opacity", 1);

		// Returns an array of tick angles and labels, given a group.
		function groupTicks(d) {
			var k = (d.endAngle - d.startAngle) / d.value;
			return d3.range(0, d.value, 1000).map(function(v, i) {
				return {
					angle: v * k + d.startAngle,
					label: i % 5 ? null : v / 1000
				};
			});
		}

		// Returns an event handler for fading a given chord group.
		function fade(opacity) {
			return function(g, i) {
				vis_g.selectAll(".sap_viz_ext_chord_chord path")
					.filter(function(d) {
						return d.source.index != i && d.target.index != i;
					})
					.transition()
					.style("opacity", opacity);
			};
		}
		// END: sample render code

	};

	return render;
});