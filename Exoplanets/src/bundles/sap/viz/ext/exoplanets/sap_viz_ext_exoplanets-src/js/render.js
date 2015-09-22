define("sap_viz_ext_exoplanets-src/js/render", [], function() {
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
		//Retrieve chart properties  
		var width = this.width(),
			height = this.height(),
			colorPalette = this.colorPalette(),
			properties = this.properties(),
			dispatch = this.dispatch();
		//Prepare canvas with width and height of container  
		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

		var color = d3.scale.quantize()
			.range(["#156b87", "#876315", "#543510", "#872815"]);

		// MDL: Get the names of the (name, radius and distance) columns to use when we are in VizPacker/Lumira.
		var meta = data.meta;
		var nameFields = meta.dimensions('Name');
		var nameCol = nameFields[0];
		var radiusFields = meta.measures('Radius');
		var radiusCol = radiusFields[0];
		var distanceFields = meta.measures('Distance');
		var distanceCol = distanceFields[0];
		// MDL: end

		// MDL: Define the chart width and height to make it easy to adjust to the size within viz Packer.
		// var size = 960;
		var chartWidth = width;
		var chartHeight = height;
		// MDL: end

		var pack = d3.layout.pack()
			.sort(null)
			// MDL: Adjustable chart size.
			//    .size([size, size])
			.size([chartWidth, chartHeight])
			// MDL: end
			// MDL: Get the radius from the data column: radiusCol.
			//   .value(function(d) { return d.radius * d.radius; })
			.value(function(d) {
				return d[radiusCol] * d[radiusCol];
			})
			// MDL: end
			.padding(5);

		// MDL: "vis" defined on the page already.
		//var svg = d3.select("body").append("svg")
		//    .attr("width", size)
		//    .attr("height", size);
		// MD: end

		// MDL: Using data JSON array instead of loading from CSV
		//    d3.csv("exoplanets.csv", type, function(error, exoplanets) {
		// MDL: end
		// MDL: Renamed "exoplanets" to "data" as that is what viz Packer will pass in to the render function.
		//    exoplanets.sort(function(a, b) {
		data.sort(function(a, b) {
			// MDL: end
			// MDL: Get the distance from the data column: distanceCol.
			// MDL: Handle the fact that viz Packer passes in measures as strings in Lumira 1.15.
			//    return isFinite(a.distance) || isFinite(b.distance)
			//        ? a.distance - b.distance
			//        : 0;
			return isFinite(a[distanceCol]) || isFinite(b[distanceCol]) ? a[distanceCol] - b[distanceCol] : 0;
			// MDL: end
		});

		// MDL: Get the radius from the data column: radiusCol.
		//    color.domain(d3.extent(exoplanets, function(d) { return d.radius; }));
		color.domain(d3.extent(data, function(d) {
			return d[radiusCol];
		}));
		// MDL: end

		// MDL: Use "vis" as that is passed in to the viz Packer render function.
		//  svg.selectAll("circle")
		vis.selectAll("circle")
		// MDL: end
		// MDL: Renamed "exoplanets" to "data" as that is what viz Packer will pass in to the render function.
		//      .data(pack.nodes({children: exoplanets}).slice(1))
		.data(pack.nodes({
			children: data
		}).slice(1))
		// MDL: end
		.enter().append("circle")
			.attr("r", function(d) {
				return d.r;
			})
			.attr("cx", function(d) {
				return d.x;
			})
			.attr("cy", function(d) {
				return d.y;
			})
		// MDL: Get the radius from the data column: radiusCol.
		//      .style("fill", function(d) { return color(d.radius); })
		.style("fill", function(d) {
			return color(d[radiusCol]);
		})
		// MDL: end
		.append("title")
			.text(function(d) {
				// MDL: Get the radius, name and distance from the data column: radiusCol, nameCol, distanceCol.
				//        return d.name
				//            + "\nplanet radius: " + d.radius + " EU"
				//            + "\nstar distance: " + isFinite(d.distance) ? d.distance : "N/A" + " pc";
				return d[nameCol] + "\nRadius: " + d[radiusCol] + "\nDistance: " + isFinite(d[distanceCol]) ? d[distanceCol] : "N/A";
				// MDL: end
			});

		// MDL: Using data JSON array instead of loading from CSV
		//});
		// MDL: end

		// MDL: CSV to "data" is done in the "exoplanets_csv.js" so this is not needed anymore.
		//function type(d) {
		//  d.radius = +d.radius;
		//  d.distance = d.distance ? +d.distance : Infinity;
		//  return d;
		//}
		// MDL: end

		// MDL: Adjustable chart size.
		//d3.select(self.frameElement).style("height", size + "px");
		//d3.select(self.frameElement).style("height", chartHeight + "px");
		// MDL: end
	};

	return render;
});