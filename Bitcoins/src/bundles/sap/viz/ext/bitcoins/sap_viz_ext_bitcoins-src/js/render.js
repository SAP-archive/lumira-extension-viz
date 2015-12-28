define("sap_viz_ext_bitcoins-src/js/render", [], function() {

	var render = function(data, container) {
		var margin = {
			top: 20,
			right: 120,
			bottom: 20,
			left: 120
		};
		//prepare canvas with width and height of container
		var width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom;
		var H = height;
		var W = width;
		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

		var dsets = data.meta.dimensions(),
			msets = data.meta.measures();

		var ms1 = data.meta.measures(0);
		var ms2 = data.meta.measures(1);

		var ds1 = data.meta.dimensions(0);
		var ds2 = data.meta.dimensions(1);

		var maxP = -1,
			minP = 1000000;
		var maps = [];
		var fdata = data.map(function(d) {
			if (d[ms1[0]] != null) {
				maps.push({
					input: d[ds1[0]],
					output: d[ds2[0]],
					price: d[ms1[0]],
					childPrice: d[ms2[0]]
				});
			}
		});
		d3.isv = {};
		//Stand Alone Tooltip implementation
		d3.isv.tooltip = function() {
			var width = "auto", // default width
				height = "auto",
				html = "tooltip",
				classed = "left",
				x = 10,
				y = 10,
				position = [x, y],
				disp = "none";

			function tooltip() {
				// generate tooltip here, using `width` and `height`
				var tt = d3.select("body").append("div").attr("id", "sap_viz_ext_bitcoins_t-tip").style("display", disp);
				var tooltip = tt.append("div").attr("class", "sap_viz_ext_bitcoins_btt-inner").style("text-align", "left");
				tooltip.append("div").attr("id", "sap_viz_ext_bitcoins_triangle").attr("class", classed);
				tooltip.append("div").attr("id", "tt-body");

				tooltip.visibility = function(value) {
					d3.selectAll("#sap_viz_ext_bitcoins_t-tip").style("display", value);
				};
				tooltip.orientation = function(value) {
					d3.selectAll("#sap_viz_ext_bitcoins_t-tip #sap_viz_ext_bitcoins_triangle").attr("class", value);
				};
				tooltip.move = function(value) {
					d3.selectAll("#sap_viz_ext_bitcoins_t-tip").style("top", value[0]).style("left", value[1]);
				};
				tooltip.fillData = function(value) {
					d3.selectAll("#sap_viz_ext_bitcoins_t-tip #tt-body").html(value);
				};
				return tooltip;
			}
			tooltip.width = function(value) {
				if (!arguments.length) {
					return width;
				}
				width = value;
				return tooltip;
			};
			tooltip.height = function(value) {
				if (!arguments.length) {
					return height;
				}
				height = value;
				return tooltip;
			};
			return tooltip;
		};

		var t_tip = new d3.isv.tooltip();
		var ltooltip = t_tip();
		var rScale = d3.scale.linear()
			.range([3, 15]);

		//Building data set
		function findRoot(data) {
			for (var i = 0; i < data.length; i++) {
				var flag = 0;
				for (var j = 0; j < data.length; j++) {
					if (data[i].input === data[j].output) {
						flag = 1;
						break;
					}
				}
				if (flag == 0) {
					return i;
				}
			}
		}

		var visited = [];
		var ds = [];
		var element;

		function dfs(root, data, parent, level, price, cprice) {
			var element = {
				"name": root,
				"parent": parent,
				"level": level,
				"price": ((price)),
				"cprice": cprice
			};
			var items = [];
			for (var i = 0; i < data.length; i++) {
				if (data[i].input === root) {
					if (visited.indexOf(data[i].output) === -1) {
						visited.push(data[i].output);
						var price = 0;
						for (var j = 0; j < maps.length; j++) {
							if (data[i].output === maps[j].input) {
								price = maps[j].price;
							}
						}
						items.push(dfs(data[i].output, data, root, level + 1, price, data[i].childPrice));
						element.children = items;
					}
				}
			}
			return element;
		}
		var root = findRoot(maps);
		var newdata = [];
		if (root === undefined) {
			root = 0;
		} else {
			visited.push(maps[root].input);
			newdata.push(dfs(maps[root].input, maps, null, 0, maps[root].price, maps[root].price));
			var treeData = newdata;
			var width = W - margin.right - margin.left,
				height = H - margin.top - margin.bottom;
			var counter = 2;
			var maxi = 1;
			var depth = width;
			var i = 0,
				duration = 750;
			var tree = d3.layout.tree()
				.size([height, width]);
			var diagonal = d3.svg.diagonal()
				.projection(function(d) {
					return [d.y, d.x];
				});
			var svg = vis.append("svg")
				.attr("width", width + margin.right + margin.left)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			root = treeData[0];
			root.x0 = height / 2;
			root.y0 = 0;
			function collapse(d) {
				if (d.children) {
					d._children = d.children;
					d._children.forEach(collapse);
					d.children = null;
				}
			}
			root.children.forEach(collapse);
			update(root);
			d3.select(self.frameElement).style("height", height);
			function update(source) {
				// Compute the new tree layout.
				var nodes = tree.nodes(root).reverse(),
					links = tree.links(nodes);
				maxi = -1;
				minP = 100000000;
				maxP = -1;
				var coinsDataSet = [];
				nodes.forEach(function(d) {
					if (d.parent != null) {
						coinsDataSet.push(d.parent.name);
					}
					if (coinsDataSet.indexOf(d.name) !== -1) {
						d.bit = d.price;
					}
					else {
						d.bit = d.cprice;
					}
					if (d.level > maxi) {
						maxi = d.level;
					}
					if (d.price < minP) {
						minP = d.price;
					}
					if (d.price > maxP) {
						maxP = d.price;
					}
				});
				if (maxi < 1) {
					maxi = 1;
				}
				//Normalizing tree depth
				depth = width / maxi;
				nodes.forEach(function(d) {
					d.y = d.depth * depth;
				});
				// Update the nodes…
				var node = svg.selectAll("g.node")
					.data(nodes, function(d) {
						return d.id || (d.id = ++i);
					});
				// Enter any new nodes at the parent's previous position.
				var nodeEnter = node.enter().append("g")
					.attr("class", "node")
					.attr("transform", function(d) {
						return "translate(" + source.y0 + "," + source.x0 + ")";
					})
					.on("click", click);
				nodeEnter.append("circle")
					.attr("r", 10)
					.style("fill", function(d) {
						return d._children ? "rgb(199,217,232)" : "steelblue";
					})
					.on("mouseover", function(d) {
						ltooltip.visibility("block");
						var ltt = ltooltip;
						var matrix = this.getScreenCTM()
							.translate(+this.getAttribute("x"), +this.getAttribute("y"));
						var leftPos = (window.pageXOffset + matrix.e);
						var classed = "left";
						ltooltip.orientation(classed);
						var tt_data = "<div class='sap_viz_ext_bitcoins_btt-item sap_viz_ext_bitcoins_btt-combo'>" + ds1 + ": " + d.name + "</div>";
						tt_data += "<div class='sap_viz_ext_bitcoins_btt-item sap_viz_ext_bitcoins_btt-combo'>" + "Value: " + d.bit + "</div>";
						ltooltip.fillData(tt_data);
						ltooltip.move([(window.pageYOffset + matrix.f - 20) + "px", (leftPos + 20) + "px"]);
					})
					.on("mouseout", function(d) {
						ltooltip.visibility("none");
					});
				rScale.domain([minP, maxP]);
				// nodeEnter.append("text")
				// 	.attr("class", "bPrice")
				// 	.attr("x", function(d) {
				// 		return d.children || d._children ? (rScale(d.price)) : (rScale(d.price));
				// 	})
				// 	.attr("y", function(d) {
				// 		return -(rScale(d.price) + 10);
				// 	})
				// 	.attr("dy", ".35em")
				// 	.attr("text-anchor", function(d) {
				// 		return d.children || d._children ? "end" : "start";
				// 	})
				// 	.text(function(d) {
				// 		return ("Value: " + d.bit);
				// 	})
				// 	.style("fill-opacity", 1e-6);
				nodeEnter.append("text")
					.attr("class", "sap_viz_ext_bitcoins_bName")
					.attr("x", function(d) {
						return d.children || d._children ? -(rScale(d.price)) : (rScale(d.price)) + 10;
					})
					.attr("y", function(d) {
						return (rScale(d.price));
					})
					.attr("dy", ".35em")
					.attr("text-anchor", function(d) {
						return d.children || d._children ? "end" : "start";
					})
					.text(function(d) {
						return d.name;
					})
					.style("fill-opacity", 1e-6);

				// Transition nodes to their new position.
				var nodeUpdate = node.transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(" + d.y + "," + d.x + ")";
					});
				nodeUpdate.select("circle")
					.attr("r", function(d) {
						return rScale(d.price);
					})
					.style("fill", function(d) {
						return d._children ? "rgb(199,217,232)" : "steelblue";
					});
				// nodeUpdate.selectAll(".bPrice")
				// 	.text(function(d) {
				// 		return ("Value: " + d.bit);
				// 	})
				// 	.style("fill-opacity", 1);
				nodeUpdate.selectAll(".sap_viz_ext_bitcoins_bName")
					.text(function(d) {
						return d.name;
					})
					.style("fill-opacity", 1);

				// Transition exiting nodes to the parent's new position.
				var nodeExit = node.exit().transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(" + source.y + "," + source.x + ")";
					})
					.remove();
				nodeExit.select("circle")
					.attr("r", 10);
				// nodeExit.selectAll(".bPrice")
				// 	.style("fill-opacity", 1e-6);
				nodeExit.selectAll(".sap_viz_ext_bitcoins_bName")
					.style("fill-opacity", 1e-6);

				// Update the links…
				var link = svg.selectAll("path.link")
					.data(links, function(d) {
						return d.target.id;
					});

				// Enter any new links at the parent's previous position.
				link.enter().insert("path", "g")
					.attr("class", "link")
					.attr("d", function(d) {
						var o = {
							x: source.x0,
							y: source.y0
						};
						return diagonal({
							source: o,
							target: o
						});
					});

				// Transition links to their new position.
				link.transition()
					.duration(duration)
					.attr("d", diagonal);

				// Transition exiting nodes to the parent's new position.
				link.exit().transition()
					.duration(duration)
					.attr("d", function(d) {
						var o = {
							x: source.x,
							y: source.y
						};
						return diagonal({
							source: o,
							target: o
						});
					})
					.remove();

				// Stash the old positions for transition.
				nodes.forEach(function(d) {
					d.x0 = d.x;
					d.y0 = d.y;
				});
			}

			// Toggle children on click.
			function click(d) {
				var x = ltooltip.visibility("none");
				if (d.children) {
					d._children = d.children;
					d.children = null;
				} else {
					d.children = d._children;
					d._children = null;
				}
				update(d);
			}
		}
	};

	return render;
});