define("sap_viz_ext_force-src/js/render", [], function() {
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
		var ds = meta.dimensions('Nodes');
		var ms = meta.measures('Force');
		var sourceNode = ds[0];
		var targetNode = ds[1];
		var force = ms[0];

		var links = [];
		data.forEach(function(element) {
			var obj = {};
			obj["source"] = element[sourceNode];
			obj["target"] = element[targetNode];
			obj["value"] = element[force];
			links.push(obj)
		});
		var nodes = {};

		// Compute the distinct nodes from the links.
		links.forEach(function(link) {
			link.source = nodes[link.source] ||
				(nodes[link.source] = {
				name: link.source
			});
			link.target = nodes[link.target] ||
				(nodes[link.target] = {
				name: link.target
			});
			link.value = +link.value;
		});

		var color = d3.scale.category20c();

		var force = d3.layout.force()
			.nodes(d3.values(nodes))
			.links(links)
			.size([width, height])
			.linkDistance(60)
			.charge(-300)
			.on("tick", tick)
			.start();

		// Set the range
		var v = d3.scale.linear().range([0, 100]);

		// Scale the range of the data
		v.domain([0, d3.max(links, function(d) {
			return d.value;
		})]);

		// asign a type per value to encode opacity
		links.forEach(function(link) {
			if (v(link.value) <= 25) {
				link.type = "twofive";
			} else if (v(link.value) <= 50 && v(link.value) > 25) {
				link.type = "fivezero";
			} else if (v(link.value) <= 75 && v(link.value) > 50) {
				link.type = "sevenfive";
			} else if (v(link.value) <= 100 && v(link.value) > 75) {
				link.type = "onezerozero";
			}
		});

		// build the arrow.
		vis.append("svg:defs").selectAll("marker")
			.data(["end"]) // Different link/path types can be defined here
		.enter().append("svg:marker") // This section adds in the arrows
		.attr("id", String)
			.attr("viewBox", "0 -5 10 10")
			.attr("refX", 15)
			.attr("refY", -1.5)
			.attr("markerWidth", 6)
			.attr("markerHeight", 6)
			.attr("orient", "auto")
			.append("svg:path")
			.attr("d", "M0,-5L10,0L0,5");

		// add the links and the arrows
		var path = vis.append("svg:g").selectAll("path")
			.data(force.links())
			.enter().append("svg:path")
			.attr("class", function(d) {
				return "link " + d.type + " sap_viz_ext_force_path";
			})
			.attr("marker-end", "url(#end)");

		// define the nodes
		var node = vis.selectAll(".node")
			.data(force.nodes())
			.enter().append("g")
			.attr("class", "sap_viz_ext_force_node")
			.on("click", click)
			.on("dblclick", dblclick)
			.call(force.drag);

		// add the nodes
		node.append("circle")
			.attr("r", 5)
			.attr("class", "sap_viz_ext_force_circle")
			.style("fill", function(d) {
				return color(d.name);
			});

		// add the text 
		node.append("text")
			.attr("x", 12)
			.attr("dy", ".35em")
			.attr("class", "sap_viz_ext_force_text")
			.text(function(d) {
				return d.name;
			});

		// add the curvy lines
		function tick() {
			path.attr("d", function(d) {
				var dx = d.target.x - d.source.x,
					dy = d.target.y - d.source.y,
					dr = Math.sqrt(dx * dx + dy * dy);
				return "M" +
					d.source.x + "," +
					d.source.y + "A" +
					dr + "," + dr + " 0 0,1 " +
					d.target.x + "," +
					d.target.y;
			});

			node
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});
		}

		// action to take on mouse click
		function click() {
			d3.select(this).select("text").transition()
				.duration(750)
				.attr("x", 22)
				.style("stroke", "lightsteelblue")
				.style("stroke-width", ".5px")
				.style("font", "20px sans-serif");
			d3.select(this).select("circle").transition()
				.duration(750)
				.attr("r", 16);
		}

		// action to take on mouse double click
		function dblclick() {
			d3.select(this).select("circle").transition()
				.duration(750)
				.attr("r", 6);
			d3.select(this).select("text").transition()
				.duration(750)
				.attr("x", 12)
				.style("stroke", "none")
				.style("fill", "black")
				.style("stroke", "none")
				.style("font", "10px sans-serif");
		}
		// END: sample render code

	};

	return render;
});