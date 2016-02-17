define("sap_viz_ext_sunburstsequence-src/js/render", [], function() {
	/************DEFINE OTHER CHART ELEMENTS*************/
	var sequenceDiv;
	var legendDiv;
	var legendItems;

	/************BEGIN MAIN RENDER FUNCTION*************/
	var render = function(data, container) {
		// Sequence
		sequenceDiv = container.append("foreignObject")
			.attr("class", "sap_viz_ext_sequencessunburst_sequence")
			.attr("width", this.width())
			.attr("height", 100)
			.append("xhtml:div");
		sequenceDiv = sequenceDiv.append("div");
		// Legend
		legendDiv = container.append("foreignObject")
			.attr("class", "sap_viz_ext_sequencessunburst_legend")
			.attr("width", 100)
			.attr("height", this.height())
			.append("xhtml:div");
		legendDiv = legendDiv.append("div");

		/*******DATA MAPPING TO MEASURES AND DIMENSIONS*********/
		var mset = data.meta.measures(0),
			dset = data.meta.dimensions(0);
		//find names of measures and dimensions
		var measure = mset[0],
			dim = dset[0];
		//convert measures into numbers
		data.forEach(function(d) {
			d[measure] = +d[measure];
		});

		/*******PREPARE CANVAS WITH CHART CONTAINER*********/
		var margin = {
			top: 20,
			right: 20,
			bottom: 20,
			left: 40
		};
		var width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom;
		container.selectAll("svg").remove();
		var vis = container.append("svg").attr("width", width).attr("height", height)
			.append("g").attr("class", "vis").attr("width", width).attr("height", height)
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
		// Dimensions of sunburst
		var radius = Math.min(width, height) / 2;
		// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
		var b = {
			w: 75,
			h: 30,
			s: 3,
			t: 10
		};
		// Total size of all segments
		var totalSize = 0;
		// Text elements
		var percentage = vis.append("text")
			.text("")
			.attr("class", "sap_viz_ext_sequencessunburst_percentage")
			.attr("y", 0)
			.attr("x", (-margin.left));
		var explanation = vis.append("text")
			.text("")
			.attr("class", "sap_viz_ext_sequencessunburst_explanation")
			.attr("y", 25)
			.attr("x", (-margin.left));
		var explanation2 = vis.append("text")
			.text("")
			.attr("class", "sap_viz_ext_sequencessunburst_explanation2")
			.attr("y", 45)
			.attr("x", (-margin.left));
		//Partition for sunburst
		var partition = d3.layout.partition()
			.size([2 * Math.PI, radius * radius])
			.value(function(d) {
				return d.size;
			});
		// Define arcs 
		var arc = d3.svg.arc()
			.startAngle(function(d) {
				return d.x;
			})
			.endAngle(function(d) {
				return d.x + d.dx;
			})
			.innerRadius(function(d) {
				return Math.sqrt(d.y);
			})
			.outerRadius(function(d) {
				return Math.sqrt(d.y + d.dy);
			});
		var json = buildHierarchy(data, dim, measure);
		// Build color palette.
		var colors = {};
		var i = 0;
		var colorPalette = this.colorPalette();
		for (var name in legendItems) {
			var color = colorPalette[i++];
			colors[name] = color;
		}
		createVisualization(json);
		// Main function to draw the visualization
		function createVisualization(json) {
			// Set up breadcrumb and legend
			initializeBreadcrumbTrail();
			drawLegend();
			// Inner circle
			vis.append("svg:circle")
				.attr("r", radius)
				.attr("y", 500)
				.style("opacity", 0);
			// Filter nodes for efficiency
			var nodes = partition.nodes(json)
				.filter(function(d) {
					return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
				});
			var path = vis.data([json]).selectAll("path")
				.data(nodes)
				.enter().append("svg:path")
				.attr("display", function(d) {
					return d.depth ? null : "none";
				})
				.attr("d", arc)
				.attr("class", "sap_viz_ext_sequencessunburst_arc")
				.attr("fill-rule", "evenodd")
				.style("fill", function(d) {
					return colors[d.name];
				})
				.style("opacity", 1)
				.on("mouseover", mouseover);
			// Add mouse leave handler
			d3.select("#container").on("mouseleave", mouseleave);
			// Get total size of the tree = value of root node from partition.
			totalSize = path.node().__data__.value;
		}
		// Fade all but the current sequence, and show it in the breadcrumb trail.
		function mouseover(d) {
			var perc = (100 * d.value / totalSize).toPrecision(3);
			var percentageString = perc + "%";
			if (perc < 0.1) {
				percentageString = "< 0.1%";
			}
			d3.select(".sap_viz_ext_sequencessunburst_percentage")
				.text(percentageString);
			d3.select(".sap_viz_ext_sequencessunburst_explanation")
				.style("visibility", "");
			d3.select(".sap_viz_ext_sequencessunburst_explanation2")
				.style("visibility", "");
			var sequenceArray = getAncestors(d);
			var temp_name = '';
			for (var k = 0; k < sequenceArray.length; k++) {
				temp_name += sequenceArray[k].name + '>>>>';
			}
			d3.select(".sap_viz_ext_sequencessunburst_percentage").text(percentageString);
			d3.select(".sap_viz_ext_sequencessunburst_explanation").text("follow this");
			d3.select(".sap_viz_ext_sequencessunburst_explanation2").text("sequence");
			updateBreadcrumbs(sequenceArray, percentageString);
			// Fade all the segments.
			d3.selectAll("path")
				.style("opacity", 0.3);
			// Then highlight only those that are an ancestor of the current segment.
			vis.selectAll("path")
				.filter(function(node) {
					return (sequenceArray.indexOf(node) >= 0);
				})
				.style("opacity", 1);
		}
		// Restore everything to full opacity when moving off the visualization.
		function mouseleave(d) {
			// Hide the breadcrumb trail
			d3.select("#trail")
				.style("visibility", "hidden");
			// Deactivate all segments during transition.
			d3.selectAll("path").on("mouseover", null);
			// Transition each segment to full opacity and then reactivate it.
			d3.selectAll("path")
				.transition()
				.duration(1000)
				.style("opacity", 1)
				.each("end", function() {
					d3.select(this).on("mouseover", mouseover);
				});
			d3.select(".sap_viz_ext_sequencessunburst_explanation")
				.style("visibility", "hidden");
			d3.select(".sap_viz_ext_sequencessunburst_percentage")
				.style("visibility", "hidden");
			d3.select(".sap_viz_ext_sequencessunburst_explanation2")
				.style("visibility", "hidden");
		}
		// Given a node in a partition layout, return an array of all of its ancestor nodes, highest first, but excluding the root.
		function getAncestors(node) {
			var path = [];
			var current = node;
			while (current.parent) {
				path.unshift(current);
				current = current.parent;
			}
			return path;
		}

		function initializeBreadcrumbTrail() {
			// Add the svg area.
			var trail = sequenceDiv.append("svg:svg")
				.attr("width", width)
				.attr("height", 50)
				.attr("id", "trail");
			// Add the label at the end, for the percentage.
			trail.append("svg:text")
				.attr("id", "endlabel")
				.style("fill", "#000");
		}
		// Generate a string that describes the points of a breadcrumb polygon.
		function breadcrumbPoints(d, i) {
			var points = [];
			points.push("0,0");
			points.push(b.w + ",0");
			points.push(b.w + b.t + "," + (b.h / 2));
			points.push(b.w + "," + b.h);
			points.push("0," + b.h);
			if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
				points.push(b.t + "," + (b.h / 2));
			}
			return points.join(" ");
		}

		// Update the breadcrumb trail to show the current sequence and percentage.
		function updateBreadcrumbs(nodeArray, percentageString) {
			// Data join; key function combines name and depth (= position in sequence).
			var g = d3.select("#trail")
				.selectAll("g")
				.data(nodeArray, function(d) {
					return d.name + d.depth;
				});
			// Add breadcrumb and label for entering nodes.
			var entering = g.enter().append("svg:g");
			entering.append("svg:polygon")
				.attr("points", breadcrumbPoints)
				.style("fill", function(d) {
					return colors[d.name];
				});
			entering.append("svg:text")
				.attr("x", (b.w + b.t) / 2)
				.attr("y", b.h / 2)
				.attr("dy", "0.35em")
				.attr("text-anchor", "middle")
				.text(function(d) {
					return d.name;
				});
			// Set position for entering and updating nodes.
			g.attr("transform", function(d, i) {
				return "translate(" + i * (b.w + b.s) + ", 0)";
			});
			// Remove exiting nodes.
			g.exit().remove();
			// Now move and update the percentage at the end.
			d3.select("#trail").select("#endlabel")
				.attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
				.attr("y", b.h / 2)
				.attr("dy", "0.35em")
				.attr("text-anchor", "middle")
				.text(percentageString);
			// Make the breadcrumb trail visible, if it's hidden.
			d3.select("#trail")
				.style("visibility", "");
		}

		/*******DRAW THE LEGEND*********/
		function drawLegend() {
			// Dimensions of legend item: width, height, spacing, radius of rounded rect.
			var li = {
				w: 75,
				h: 30,
				s: 3,
				r: 3
			};
			var legend = legendDiv.append("svg:svg")
				.attr("width", li.w)
				.attr("height", d3.keys(colors).length * (li.h + li.s));
			var g = legend.selectAll("g")
				.data(d3.entries(colors))
				.enter().append("svg:g")
				.attr("transform", function(d, i) {
					return "translate(0," + i * (li.h + li.s) + ")";
				});
			g.append("svg:rect")
				.attr("rx", li.r)
				.attr("ry", li.r)
				.attr("width", li.w)
				.attr("height", li.h)
				.style("fill", function(d) {
					return d.value;
				});
			g.append("svg:text")
				.attr("x", li.w / 2)
				.attr("y", li.h / 2)
				.attr("dy", "0.35em")
				.attr("text-anchor", "middle")
				.text(function(d) {
					return d.key;
				});
		}
		// Transform 2-column CSV into a hierarchical structure suitable for a partition layout. 
		// The first column is a sequence of step names, from root to leaf, separated by hyphens. The second column is a count of how often that sequence occurred.
		function buildHierarchy(csv, dimName, measureName) {
			legendItems = {};
			var root = {
				"name": "root",
				"children": []
			};
			for (var i = 0; i < csv.length; i++) {
				var row = csv[i];
				var sequence = row[dimName];
				var size = +row[measureName];
				var parts = sequence.split("-");
				var currentNode = root;
				for (var j = 0; j < parts.length; j++) {
					var children = currentNode["children"];
					var nodeName = parts[j];
					var childNode;
					if (j + 1 < parts.length) {
						//Moving down the tree
						var foundChild = false;
						for (var k = 0; k < children.length; k++) {
							if (children[k]["name"] == nodeName) {
								childNode = children[k];
								foundChild = true;
								break;
							}
						}
						// Create child node for current branch if it doesn't exist already
						if (!foundChild) {
							childNode = {
								"name": nodeName,
								"children": []
							};
							legendItems[nodeName] = nodeName;
							children.push(childNode);
						}
						currentNode = childNode;
					} else {
						// Create leaf node
						childNode = {
							"name": nodeName,
							"size": size
						};
						children.push(childNode);
						legendItems[nodeName] = nodeName;
					}
				}
			}
			return root;
		}
	};
	return render;
});