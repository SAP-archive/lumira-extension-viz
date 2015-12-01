define("sap_viz_ext_kpitree-src/js/render", [], function() {
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

		//Helper functions
		function formatShort(num) {
			if (Math.abs(num) / 1000000.0 > 1) {
				if (Math.abs(num) / 1000000.0 > 10) {
					return (num / 1000000.0).toFixed(0) + "M";
				} else {
					if (num < -1000000) {
						return (num / 1000000.0).toFixed(0) + "M";
					} else {
						return (num / 1000000.0).toFixed(1) + "M";
					}
				}
			} else {
				return (num / 1000.0).toFixed(0) + "K";
			}
		}

		function wrap(text, width) {
			text.each(function() {
				var text = d3.select(this),
					words = text.text().split(/\s+/).reverse(),
					word,
					line = [],
					lineNumber = 0,
					lineHeight = 1.0, // ems
					y = text.attr("y"),
					dy = parseFloat(text.attr("dy")),
					tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
				while (word = words.pop()) {
					line.push(word);
					tspan.text(line.join(" "));
					if (tspan.node().getComputedTextLength() > width) {
						line.pop();
						tspan.text(line.join(" "));
						line = [word];
						tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", (++lineNumber * lineHeight) + dy + "em").text(word);
					}
				}
			});
		}

		//Set our margins
		var margin = {
			top: 60,
			right: 20,
			bottom: 20,
			left: 20
		};
		var width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom,
			colorPalette = this.colorPalette(),
			properties = this.properties(),
			dispatch = this.dispatch();
		//Prepare canvas with width and height of container  
		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height)
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var rad_size = d3.scale.linear().domain([-1.0, 0, 1.0]).range([50, 10, 50]);
		var default_radius = 15;

		var color = d3.scale.linear()
			.domain([0.75, 1.0, 1.5])
			.domain([-0.5, 0.0, 0.5])
			.range(["red", "gold", "green"]);

		var dataMap = data.reduce(function(map, node) {
			map[node.name] = node;
			return map;
		}, {});

		// create the tree array
		var treeData = [];
		data.forEach(function(node) {
			// add to parent
			var parent = dataMap[node.parent];
			if (parent) {
				// create child array if it doesn't exist
				(parent.children || (parent.children = []))
				// add node to child array
				.push(node);
			} else {
				// parent is null or missing
				treeData.push(node);
			}
		});
		//console.log(treeData)

		var i = 0,
			duration = 200,
			root;

		var tree = d3.layout.tree()
			.size([width, height]);

		var diagonal = d3.svg.diagonal()
			.projection(function(d) {
				return [d.x, d.y];
			});

		root = treeData[0];
		update(root, true);

		function update(source, udefault) {
			var isDefault = udefault;

			// Compute the new tree layout.
			var nodes = tree.nodes(source).reverse(),
				links = tree.links(nodes);
			//console.log(links);
			// Normalize for fixed-depth.
			nodes.forEach(function(d) {
				d.y = (d.depth * 120);
			});

			// Declare the nodes
			var node = vis.selectAll("g.node")
				.data(nodes, function(d) {
					return d.id || (d.id = ++i);
				});

			// Enter the nodes.
			var nodeEnter = node.enter().append("g")
				.attr("class", "sap_viz_ext_kpitree node")
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				})
				.on("mouseover", updateSelection)
				.on("mouseout", updateDefault);

			nodeEnter.append("circle")
				.attr("r", 1e-6)
				.style("fill", function(d) {
					return color(+d.balance / +d.revenue);
				});

			nodeEnter.append("text")
				.attr("class", "sap_viz_ext_kpitree label")
				.attr("x", 0)
				.attr("dy", ".3em")
				.attr("text-anchor", "middle")
				.text(function(d) {
					return d.label;
				})
				.style("fill-opacity", 1e-6);

			nodeEnter.append("rect")
				.attr("class", "sap_viz_ext_kpitree rinfo")
				.attr("x", -22)
				.attr("y", default_radius + 5)
				.attr("width", 40)
				.attr("height", 42)
				.style("fill-opacity", 1e-6);
			nodeEnter.append("text")
				.attr("class", "sap_viz_ext_kpitree info")
				.attr("x", 0)
				.attr("y", default_radius + 16)
				.attr("text-anchor", "middle")
				.text(function(d) {
					return formatShort(+d.balance);
				})
				.style("fill", function(d) {
					return color(+d.balance / +d.revenue);
				})
				.style("fill-opacity", 1e-6)
				.style("stroke-opacity", 1e-6);

			nodeEnter.append("text")
				.attr("class", "sap_viz_ext_kpitree revenue")
				.attr("x", 0)
				.attr("y", default_radius + 32)
				.attr("text-anchor", "middle")
				.text(function(d) {
					return formatShort(+d.revenue);
				})
				.style("fill-opacity", 1e-6)
				.style("stroke-opacity", 1e-6);

			nodeEnter.append("text")
				.attr("class", "sap_viz_ext_kpitree cost")
				.attr("x", 0)
				.attr("y", default_radius + 42)
				.attr("text-anchor", "middle")
				.text(function(d) {
					return formatShort(+d.cost);
				})
				.style("fill-opacity", 1e-6)
				.style("stroke-opacity", 1e-6);

			var reason = nodeEnter.append("text")
				.attr("class", "sap_viz_ext_kpitree reason")
				.attr("y", -default_radius - 50)
				.attr("dy", "0em")
				.attr("text-anchor", "middle")
				.style("fill-opacity", 1e-6)
				.text(function(d) {
					return d.reason;
				});
			wrap(reason, 80);

			// Transition nodes to their new position.
			var nodeUpdate = node.transition()
				.duration(duration);

			nodeUpdate.select("circle")
				.attr("r", function(d) {
					ret = default_radius;
					if (!isDefault) {
						if (d.parent == source) {
							ret = rad_size(+d.weight);
						}
						if (d == source) {
							ret = 60;
						}
					}
					return ret;
				})
				.attr("class", function(d) {
					ret = "circle";
					if (!isDefault) {
						ret = "circle.selected";
					}
					return ret;
				})
				.style("fill", function(d) {
					ret = color(+d.balance / +d.revenue);
					if (!isDefault) {
						if (d.parent !== source) {
							if (d !== source) {
								ret = "#ccc";
							}
						}
					}
					return ret;
				});

			vis.selectAll("g.node").sort(function(a, b) {
				if (a.id === source.id) {
					return 1;
				} else {
					if (Math.abs(a.weight) > Math.abs(b.weight)) return -1;
					else return 1;
				}
			});

			nodeUpdate.select(".label")
				.text(function(d) {
					ret = d.label;
					if (!isDefault) {
						if (d === source) ret = d.name;
					}
					return ret;
				})
				.style("fill-opacity", 1)
				.style("font-size", function(d) {
					ret = "10px";
					if (!isDefault) {
						if (d === source) ret = "16px";
					}
					return ret;
				});

			nodeUpdate.select(".rinfo")
				.style("fill-opacity", function(d) {
					ret = 1e-6;
					if (!isDefault) {
						if (d.parent === source) ret = 0.95;
						if (d === source) ret = 0.95;

					}
					return ret;
				})

			nodeUpdate.select(".info")
				.style("fill-opacity", function(d) {
					ret = 1e-6;
					if (!isDefault) {
						if (d.parent === source) ret = 1;
						if (d === source) ret = 1;

					}
					return ret;
				});
			nodeUpdate.select(".revenue")
				.style("fill-opacity", function(d) {
					ret = 1e-6;
					if (!isDefault) {
						if (d.parent === source) ret = 1;
						if (d === source) ret = 1;

					}
					return ret;
				});
			nodeUpdate.select(".cost")
				.style("fill-opacity", function(d) {
					ret = 1e-6;
					if (!isDefault) {
						if (d.parent === source) ret = 1;
						if (d === source) ret = 1;

					}
					return ret;
				});

			nodeUpdate.select(".reason")
				.style("fill-opacity", function(d) {
					ret = 1e-6;
					if (!isDefault) {
						//if(d.parent===source) ret = 1;
						if (d === source) ret = 1;

					}
					return ret;
				});

			// Transition exiting nodes to the parent's new position.
			var nodeExit = node.exit().transition()
				.duration(duration)
				//.remove();

			nodeExit.select("circle")
				.attr("r", default_radius)
				.style("fill", "#ccc");

			nodeExit.select(".label")
				.text(function(d) {
					return d.label;
				})
				.style("fill-opacity", 0.5);

			// Declare the links
			var link = vis.selectAll("path.link")
				.data(links, function(d) {
					return d.target.id;
				});

			// Enter the links.
			link.enter().insert("path", "g")
				.attr("class", "sap_viz_ext_kpitree link")
				.attr("d", diagonal);

		}

		// Toggle children on click.
		function updateSelection(d) {
			update(d, false);
		}

		function updateDefault(d) {
			update(root, true);
		}

	};

	return render;
});