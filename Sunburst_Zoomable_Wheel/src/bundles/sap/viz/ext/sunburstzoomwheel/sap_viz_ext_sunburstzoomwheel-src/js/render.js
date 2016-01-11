define("sap_viz_ext_sunburstzoomwheel-src/js/render", [], function() {
	/************BEGIN MAIN RENDER FUNCTION*************/
	var render = function(data, container) {

		/*******DATA MAPPING TO MEASURES AND DIMENSIONS*********/
		var mset = data.meta.measures(0),
			dset = data.meta.dimensions(0);

		//find names of measures and dimensions
		var measure = mset[0],
			dim = dset[0],
			dim2 = dset[1];

		/*******PREPARE CANVAS WITH CHART CONTAINER*********/
		var margin = {
			top: 20,
			right: 20,
			bottom: 20,
			left: 40
		};
		var width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom,
			colorPalette = this.colorPalette();

		// Dimensions of sunburst
		var radius = Math.min(width, height) / 2,
			x = d3.scale.linear().range([0, 2 * Math.PI]),
			y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, radius]),
			padding = 5,
			duration = 1000;
		container.selectAll("svg").remove();
		var vis = container.append("svg").attr("width", width + padding * 2)
			.attr("height", height + padding * 2)
			.append("g").attr("class", "vis")
			.attr("transform", "translate(" + [radius + padding, radius + padding] + ")");

		//Partition for sunburst
		var partition = d3.layout.partition()
			.sort(null)
			.value(function(d) {
				return 5.8 - d.depth;
			});
		// Define arcs 
		var arc = d3.svg.arc()
			.startAngle(function(d) {
				return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
			})
			.endAngle(function(d) {
				return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
			})
			.innerRadius(function(d) {
				return Math.max(0, d.y ? y(d.y) : d.y);
			})
			.outerRadius(function(d) {
				return Math.max(0, y(d.y + d.dy));
			});
		var json = buildHierarchy(data, dim);
		var nodes = partition.nodes({
			children: json
		});
		var color = d3.scale.ordinal()
			.range(colorPalette);
		var path = vis.selectAll("path").data(nodes);
		path.enter().append("path")
			.attr("class", "sap_viz_ext_sunburstzoomwheel_sections")
			.attr("id", function(d, i) {
				return "path-" + i;
			})
			.attr("d", arc)
			.attr("fill-rule", "evenodd")
			.style("fill", function(d, i) {
				return color(i);
			})
			.on("click", click);
		var text = vis.selectAll("text").data(nodes);
		var textEnter = text.enter().append("text")
			.style("fill-opacity", 1)
			.style("fill", function(d) {
				return "000";
			})
			.attr("text-anchor", function(d) {
				return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
			})
			.attr("dy", ".2em")
			.attr("transform", function(d) {
				var multiline = (d.name || "").split(" ").length > 1,
					angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
					rotate = angle + (multiline ? -.5 : 0);
				return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
			})
			.attr("class", "sap_viz_ext_sunburstzoomwheel_text")
			.on("click", click);
		textEnter.append("tspan")
			.attr("x", 0)
			.text(function(d) {
				return d.depth ? d.name.split(" ")[0] : "";
			});
		textEnter.append("tspan")
			.attr("x", 0)
			.attr("dy", "1em")
			.text(function(d) {
				return d.depth ? d.name.split(" ")[1] || "" : "";
			});

		function click(d) {
			path.transition()
				.duration(duration)
				.attrTween("d", arcTween(d));
			text.style("visibility", function(e) {
				return isParentOf(d, e) ? null : d3.select(this).style("visibility");
			})
				.transition()
				.duration(duration)
				.attrTween("text-anchor", function(d) {
					return function() {
						return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
					};
				})
				.attrTween("transform", function(d) {
					var multiline = (d.name || "").split(" ").length > 1;
					return function() {
						var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
							rotate = angle + (multiline ? -.5 : 0);
						return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
					};
				})
				.style("fill-opacity", function(e) {
					return isParentOf(d, e) ? 1 : 1e-6;
				})
				.each("end", function(e) {
					d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
				});
		}

		function isParentOf(p, c) {
			if (p === c) return true;
			if (p.children) {
				return p.children.some(function(d) {
					return isParentOf(d, c);
				});
			}
			return false;
		}
		// Interpolate the scales
		function arcTween(d) {
			var my = maxY(d),
				xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
				yd = d3.interpolate(y.domain(), [d.y, my]),
				yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
			return function(d) {
				return function(t) {
					x.domain(xd(t));
					y.domain(yd(t)).range(yr(t));
					return arc(d);
				};
			};
		}

		function maxY(d) {
			return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
		}

		function brightness(rgb) {
			return rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
		}

		function buildHierarchy(csv, dim) {
			var root = {
				"name": "root",
				"children": []
			};
			for (var i = 0; i < csv.length; i++) {
				var row = csv[i];
				var sequence = row[dim];
				var colour = row[dim2];
				if (isNaN(colour)) { // e.g. if this is a header row
					// continue;
				}
				var parts = sequence.split("-");
				var currentNode = root;
				for (var j = 0; j < parts.length; j++) {
					var children = currentNode["children"];
					var nodeName = parts[j];
					var childNode;
					if (j + 1 < parts.length) {
						// Not yet at the end of the sequence; move down the tree.
						var foundChild = false;
						for (var k = 0; k < children.length; k++) {
							if (children[k]["name"] == nodeName) {
								childNode = children[k];
								foundChild = true;
								break;
							}
						}
						// If we don't already have a child node for this branch, create it.
						if (!foundChild) {
							childNode = {
								"name": nodeName,
								"children": []
							};
							children.push(childNode);
						}
						currentNode = childNode;
					} else {
						// Reached the end of the sequence; create a leaf node.
						childNode = {
							"name": nodeName,
							"colour": colour
						};
						children.push(childNode);
					}
				}
			}
			return root["children"];
		}
	};
	return render;
});