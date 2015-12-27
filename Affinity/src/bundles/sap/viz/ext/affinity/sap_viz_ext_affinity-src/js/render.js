define("sap_viz_ext_affinity-src/js/render", [], function() {
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
			right: 20,
			bottom: 50,
			left: 60
		};
		//prepare canvas with width and height of container
		var width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom,
			colorPalette = this.colorPalette();
		var chartHeight = height;
		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

		var dsets = data.meta.dimensions(),
			msets = data.meta.measures();

		var mset1 = data.meta.measures(0);
		var mset2 = 10;
		if (msets.length === 2) {
			mset2 = data.meta.measures(1);
		}
		var ms1 = mset1[0];
		var ds1 = data.meta.dimensions(0);
		var ds2 = data.meta.dimensions(1);

		var maps = [];
		var fdata = data.map(function(d) {
			if (msets.length == 2) {
				maps.push({
					bag_id: d[ds1[0]],
					item: d[ds2[0]],
					price: d[mset2[0]],
					lift: d[mset1[0]]
				});
			} else if (d[mset1[0]] != null) {
				maps.push({
					bag_id: d[ds1[0]],
					item: d[ds2[0]],
					price: mset2,
					lift: d[mset1[0]]
				});
			}
		});

		var data_set = data;
		var visible = 1;
		d3.isv = {};
		//Stand Alone Tooltip implementation
		d3.isv.tooltip = function() {
			var html = "tooltip",
				classed = "left",
				x = 10,
				y = 10,
				position = [x, y],
				disp = "none";

			function tooltip() {
				// generate tooltip here, using `width` and `height`
				var tt = d3.select("body").append("div").attr("id", "sap_viz_ext_affinity_t-tip").style("display", disp);
				var tooltip = tt.append("div").attr("class", "sap_viz_ext_affinity_att-inner").style("text-align", "left");
				tooltip.append("div").attr("id", "sap_viz_ext_affinity_triangle").attr("class", classed);
				tooltip.append("div").attr("id", "tt-body");
				tooltip.visibility = function(value) {
					//if (!arguments.length) return html;
					d3.selectAll("#sap_viz_ext_affinity_t-tip").style("display", value);
				};
				tooltip.orientation = function(value) {
					//if (!arguments.length) return html;
					d3.selectAll("#sap_viz_ext_affinity_t-tip #sap_viz_ext_affinity_triangle").attr("class", value);
				};
				tooltip.move = function(value) {
					d3.selectAll("#sap_viz_ext_affinity_t-tip").style("top", value[0]).style("left", value[1]);
				};
				tooltip.fillData = function(value) {
					d3.selectAll("#sap_viz_ext_affinity_t-tip #tt-body").html(value);
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
		//Adding data to tooltip
		//@param {d} : data item
		function toolTipData(d) {
			var currency = "",
				ditems = d.items;

			var bagVal = d3.sum(ditems, function(d) {
				return d.price;
			});
			var tt_data = "<div class='sap_viz_ext_affinity_att-item sap_viz_ext_affinity_att-combo'>" + d.combo_name + "</div>";
			tt_data = tt_data + "<div class='sap_viz_ext_affinity_att-item tt-lift'>" + mset1 + ": " + d.lift + "</div>";
			if (msets.length === 2) {
				tt_data = tt_data + "<div class='sap_viz_ext_affinity_att-item tt-bag-val'> Total " + mset2 + " : " + currency + " " + bagVal + "</div>";
			}
			var item_data = "";
			for (var x in d.items) {
				if (d.items[x].price !== undefined && d.items[x].price !== 0) {
					item_data = item_data + "<div class='sap_viz_ext_affinity_att-item'>";
					item_data = item_data + "<span class='sap_viz_ext_affinity_att-item-color' style='width:10px;height:10px;background:" + d.items[x].color +
						";float:left'></span>";
					item_data = item_data + "<span class='sap_viz_ext_affinity_att-item-name'>" + d.items[x].name + "</span>";
					if (msets.length === 2) {
						item_data = item_data + "<span class='sap_viz_ext_affinity_att-item-price'>" + currency + " " + d.items[x].price + "</span></div>";
					} else {
						item_data = item_data + "</div>";
					}
				}
			}
			tt_data = tt_data + item_data;
			return tt_data;
		}

		//Adding zoomable bag
		//@param {d}: data item
		function zoomBag(d) {
			var ditems = d;
			d3.selectAll("#bags").style("opacity", 0);
			d3.selectAll("#XAxis").style("opacity", 0);
			d3.selectAll("#YAxis").style("opacity", 0);
			d3.selectAll("#xaxisL").style("opacity", 0);
			d3.selectAll("#yaxisL").style("opacity", 0);

			var zoomHeight, zoomWidth;
			zoomHeight = minaxis * 0.6;
			zoomWidth = minaxis * 0.6;

			var zoomTreeMap = d3.layout.treemap()
				.size([zoomWidth, zoomHeight])
				.nodes(ditems);

			var zt_tip = new d3.isv.tooltip();
			var ztooltip = zt_tip();
			var sum = ditems.items;
			var total = d3.sum(sum, function(d) {
				return d.price;
			});
			var w, h;
			var zoom = vis.append("g")
				.attr("id", "zoom");
			zoom.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", w)
				.attr("height", h)
				.style("opacity", 0);

			var tpad = 12;
			zoom.append("rect")
				.attr("x", w / 2 - zoomWidth / 2 - tpad)
				.attr("y", (h * 0.3) - tpad)
				.attr("width", zoomWidth + (tpad * 2))
				.attr("height", zoomHeight + (tpad * 2))
				.attr("fill", "#dadada");
			var cells = zoom.selectAll(".cell")
				.data(zoomTreeMap)
				.enter()
				.append("g")
				.attr("class", "cell")
				.attr("transform", function(d) {
					return "translate(" + (w / 2 - zoomWidth / 2) + "," + (h * 0.3) + ")";
				})
				.on("click", function(d) {
					d3.selectAll("#zoom").remove();
					ztooltip.visibility("none");
					d3.selectAll("#bags").style("opacity", 1);
					d3.selectAll("#XAxis").style("opacity", 1);
					d3.selectAll("#YAxis").style("opacity", 1);
					d3.selectAll("#xaxisL").style("opacity", 1);
					d3.selectAll("#yaxisL").style("opacity", 1);

				})
				.on("mouseover", function(d) {
					ztooltip.visibility("block")
					var ztt = ztooltip;
					var matrix = this.getScreenCTM()
						.translate(+this.getAttribute("x"), +this.getAttribute("y"));
					var tt_w = "160px",
						tt_wi = 160;
					var leftPos = (window.pageXOffset + matrix.e);
					var rect_width = zoomWidth;
					var classed = "";
					leftPos += rect_width;
					classed = "left";
					ztooltip.orientation(classed);
					ztooltip.fillData(toolTipData(ditems));
					ztooltip.move([(window.pageYOffset + matrix.f) + "px", leftPos + "px"]);

				})
				.on("mouseout", function() {
					return ztooltip.visibility("none");
				});

			cells.append("rect")
				.attr("x", function(d) {
					return d.x;
				})
				.attr("y", function(d) {
					return d.y;
				})
				.attr("width", function(d) {
					return d.dx;
				})
				.attr("height", function(d) {
					return d.dy;
				})
				.attr("stroke", "#dadada")
				.attr("stroke-width", 8)
				.attr("fill", function(d) {
					return d.color;
				});

			var innerRadius = 0.19,
				outerRadius = 0.25;
			var d = (zoomWidth * (0.4));
			var r = d / 2;
			var p = Math.PI;
			var zarc = d3.svg.arc()
				.innerRadius(zoomWidth * innerRadius)
				.outerRadius((zoomWidth * outerRadius))
				.startAngle((p / 2))
				.endAngle(-p + (p / 2));

			var zplot_for_line = [w / 2],
				zplot_for_arc = [],
				zplot_for_x = [w / 2 - zoomWidth / 2],
				zplot_for_y = [h * 0.3];
			var zplot_for_width = [zoomWidth],
				zplot_for_height = [zoomHeight],
				zplot_for_semiarc = [zarc()];

			hideRingArc(zoom, zplot_for_semiarc, zplot_for_line, zplot_for_y);

			zarc.endAngle(p - 2.2);

			zplot_for_arc.push(zarc());
			zplot_for_y[0] = h * 0.3 - 12;
			createBagPacking(zoom, zplot_for_x, zplot_for_y, zplot_for_width);

			zplot_for_y[0] = h * 0.3;

			if (msets.length === 2) {
				createBagTags(zoom, zplot_for_x, zplot_for_y, zplot_for_width, zplot_for_height, zplot_for_line, zplot_for_arc, total);
			}
			zoom.append("text")
				.text(function(d) {
					return (ditems.combo_name);
				})
				.attr("x", w / 2 - 8)
				.attr("y", minaxis * 0.4 + zoomHeight)
				.style("font-family", "HelveticaNeue")
				.style("font-size", 18)
				.attr("fill", "#666666");

			var text = cells.append('foreignObject')
				.attr('x', function(d) {
					return (d.x);
				})
				.attr('y', function(d) {
					return (d.y + 10);
				})
				.attr('width', function(d) {
					return d.dx - 10;
				})
				.attr('height', function(d) {
					return d.dy - 10;
				})
				.append("xhtml:body")
				.html(function(d, i) {

					if (d.name !== undefined) {
						var text = '';
						var len = Math.ceil((d.dx - 10) / 10);

						for (i = 0; i < len && i < d.name.length; i++) {
							text += d.name[i];
						}
						if (text.length != d.name.length) {
							text += "...";
						}
					}
					if (msets.length !== 2) {
						return	'<div fill="#000000" style="font-family: Helvetica;color:#FFFFFF ;text-shadow: 1px 1px 1px rgb(150,150,150);font-size: 12px;width: ' +
							(d.dx - 10) + 'px;">' + text + '</div>';
					}

					return '<div fill="#000000" style="font-family: Helvetica; color:#FFFFFF ;text-shadow: 1px 1px 1px rgb(150,150,150) ;font-size: 12px;width: ' +
						(d.dx - 10) + 'px;">' + text + "<br>" + "" + d.price + '</div>';
				});
		}

		//setting the width for canvas
		function setW(width) {
			return (width - margin.left - margin.right);
		}

		//setting the height for canvas
		function setH(height) {
			return (height - margin.top - margin.bottom);
		}

		//Creating SVG, setting width and height for svg
		function createSvg() {
			var svg = d3.select("body").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			return svg;
		}

		//Creating Scale (parameters are domainStart domainEnd and rangeStart rangeEnd)
		//@param {domianx}- Domain starting point
		//@param {domiany}- Domain end point
		//@param {rangex}- Range starting point
		//@param {rangey}- Range end point 
		function createScale(domainx, domainy, rangex, rangey) {
			var scale = d3.scale.linear()
				.domain([domainx, domainy])
				.range([rangex, rangey]);
			return scale;
		}

		//Calculating the sum of all rectangle's width
		//@param {data_set}- data set for the viz
		function max_x(data_set) {
			var a = d3.sum(data_set, function(d) {
				return Math.sqrt(d3.sum(d.items, function(x) {
					return x.price;
				}));
			});
			return (a * 1.5);
		}

		//Sanity Check for Y axis, to make sure bag does not go out of SVG
		//@param {rec_xScale}- Scale for Bags
		//@param {data_set}- data set for viz
		//@param {height}- Height of SVG
		var H, maxLift, maxHeight;

		function ySanityCheck(rec_xScale) {
			maxLift = d3.max(data_set, function(d) {
				return d.lift;
			});
			maxLift = Math.ceil(maxLift);
			if (maxLift > 5) {
				for (var i = 0; i <= 5; i++) {
					if ((maxLift + (1 * i)) % 5 === 0) {
						maxLift += (1 * i);
						break;
					}
				}
			}

			var ySanity = createScale(0, maxLift, 0, height);
			maxHeight = d3.max(data_set, function(d) {
				var size = Math.sqrt(d3.sum(d.items, function(x) {
					return x.price;
				}));
				size = rec_xScale(size);
				var lift = ySanity(d.lift);
				d = (size * (0.8));
				var r = (d / 2);
				return (size + lift + r);
			});

			if (maxHeight > height) {
				H = (height - (maxHeight - height));
			}
			else {
				H = height;
			}
			var incLift = Math.ceil(((maxHeight) * maxLift) / H);
			maxLift = (incLift);
			var scale = createScale(0, maxLift, height, 0);
			return scale;
		}

		var lineFunction = d3.svg.line()
			.x(function(d) {
				return d.x;
			})
			.y(function(d) {
				return d.y;
			})
			.interpolate("linear");

		//Create path for lift value
		//@param {yScale}- Scale for Y axis
		//@param {plot_for_line}- stores the values for xaxis
		function createPathForLift(agroup, yScale, plot_for_line) {
			var arrowSize = 10;

			//Straight line
			agroup.append("line")
				.attr("class", "liftPath")
				.attr("id", "lift")
				.attr("x1", function(d, i) {
					return plot_for_line[i];
				})
				.attr("y1", function(d) {
					return yScale(0 + 10);
				})
				.attr("x2", function(d, i) {
					return plot_for_line[i];
				})
				.attr("y2", function(d) {
					return yScale(d.lift);
				})
				.style("stroke-dasharray", ("6, 3"))
				.attr("stroke", "#2C8028");

			//Left arrow
			agroup.append("line")
				.attr("class", "liftPath")
				.attr("id", "leftArrow")
				.attr("x1", function(d, i) {
					return plot_for_line[i];
				})
				.attr("y1", function(d) {
					return yScale(d.lift);
				})
				.attr("x2", function(d, i) {
					return plot_for_line[i] - arrowSize;
				})
				.attr("y2", function(d) {
					return yScale(d.lift) + arrowSize;
				})
				.style("stroke-dasharray", ("6, 2"))
				.attr("stroke-width", 1.5)
				.attr("stroke", "#2C8028");

			//Right arrow
			agroup.append("line")
				.attr("class", "liftPath")
				.attr("id", "rightArrow")
				.attr("x1", function(d, i) {
					return plot_for_line[i];
				})
				.attr("y1", function(d) {
					return yScale(d.lift);
				})
				.attr("x2", function(d, i) {
					return plot_for_line[i] + arrowSize;
				})
				.attr("y2", function(d) {
					return yScale(d.lift) + arrowSize;
				})
				.style("stroke-dasharray", ("6, 2"))
				.attr("stroke-width", 1.5)
				.attr("stroke", "#2C8028");
		}

		//Creates the zig zag packing for bags
		//@param {plot_for_x}- stores the values for x axis
		//@param {plot_for_y}- stores the values for y axis
		//@param {plot_for_width}- stores the width length for bags
		function createBagPacking(agroup, plot_for_x, plot_for_y, plot_for_width) {
			var W = 0.04,
				H = 0.03,
				P = 0.02;
			agroup.append("path")
				.attr("class", "sap_viz_ext_affinity_bagPacking")
				.attr("d", function(d, i) {

					var xval = plot_for_x[i] + (plot_for_width[i] * P),
						yval = plot_for_y[i];

					var dataSet = [{
						x: xval,
						y: yval
					}];
					var inc = 1;
					for (var j = xval; j < xval + plot_for_width[i] && (xval + ((plot_for_width[i] * W) * (inc + 1)) < xval + plot_for_width[i]); j = j +
						(plot_for_width[i] * (W * 2))) {
						dataSet.push({
							x: xval + ((plot_for_width[i] * W) * inc),
							y: yval - (H * plot_for_width[i])
						});
						inc = inc + 1;
						dataSet.push({
							x: xval + ((plot_for_width[i] * W) * inc),
							y: yval
						});
						inc = inc + 1;
					}
					pathPoints = lineFunction(dataSet);
					return pathPoints;
				});
		}

		//creates the semicircle handle of bag on the top
		//@param {plot_for_arc}- Store the path for handle
		function createBagHandles(agroup, plot_for_arc, plot_for_line, plot_for_y) {
			agroup.append("path")
				.attr("class", "sap_viz_ext_affinity_bagHandle")
				.attr("d", function(d, i) {
					return plot_for_arc[i];
				})
				.attr("transform", function(d, i) {
					return "translate(" + plot_for_line[i] + "," + plot_for_y[i] + ")";
				});
		}

		//To overwrite the path of ring on bag handle
		function hideRingArc(agroup, plot_for_arc, plot_for_line, plot_for_y) {
			agroup.append("path")
				.attr("class", "sap_viz_ext_affinity_bagHandle")
				.attr("d", function(d, i) {
					return plot_for_arc[i];
				})
				.attr("transform", function(d, i) {
					return "translate(" + plot_for_line[i] + "," + plot_for_y[i] + ")";
				});
		}

		//creating the tags for bags
		//@param {plot_for_x}- stores the values for x axis
		//@param {plot_for_y}- stores the values for y axis
		//@param {plot_for_width}- stores the width length for bags
		//@param {plot_for_line}- stores the value of x axis
		function createBagTags(agroup, plot_for_x, plot_for_y, plot_for_width, plot_for_height, plot_for_line, plot_for_semiarc, tprice) {
			var H = 0.16,
				W = 0.06,
				R = 0.25,
				PL = 0.23,
				PR = 0.5,
				CP = 0.02;

			//creates the arrow of tag
			agroup.append("path")
				.attr("class", "sap_viz_ext_affinity_tag")
				.attr("id", "tagArrow")
				.attr("d", function(d, i) {
					var xval = plot_for_x[i] + plot_for_width[i] - (plot_for_width[i] * PL) + PR;
					var yval = plot_for_y[i] - ((plot_for_width[i] * R));
					var height = ((plot_for_width[i] * H));
					var width = (plot_for_width[i] * W);
					var pathPoints = lineFunction([{
						x: xval,
						y: yval
					}, {
						x: xval - (width),
						y: yval + (height) / 2
					}, {
						x: xval,
						y: yval + height
					}]);
					return pathPoints;
				})
				.attr("fill", "#ffbb10");

			//to create circle on tag
			agroup.append("circle")
				.attr("class", "sap_viz_ext_affinity_tagcircle")
				.attr("cx", function(d, i) {
					var xval = plot_for_x[i] + plot_for_width[i] - (plot_for_width[i] * PL) + PR;
					var width = (plot_for_width[i] * W);
					var cxval = (xval - width) + (plot_for_width[i] * 0.035);
					return cxval;
				})
				.attr("cy", function(d, i) {
					var yval = plot_for_y[i] - ((plot_for_width[i] * R));
					var height = ((plot_for_width[i] * H));
					var cyval = yval + (height) / 2;
					return cyval;
				})
				.attr("r", function(d, i) {
					var radius = plot_for_width[i] * CP;
					return radius;
				})
				.attr("fill", "white");

			//creates the ring for tag
			var EP = 0.06,
				EY = 0.03;
			agroup.append("ellipse")
				.attr("class", "tagRing")
				.attr("cx", function(d, i) {
					var xval = plot_for_x[i] + plot_for_width[i] - (plot_for_width[i] * PL) + PR;
					var width = (plot_for_width[i] * (H - EP));
					return (xval - width);
				})
				.attr("cy", function(d, i) {
					var yval = plot_for_y[i] - ((plot_for_width[i] * R));
					var height = ((plot_for_width[i] * (R - 0.02)));
					return (yval + (height) / 2);
				})
				.attr("rx", function(d, i) {
					return (plot_for_width[i] * (H - EP));
				})
				.attr("ry", function(d, i) {
					return (plot_for_width[i] * (EY));
				})
				.attr("fill", "none")
				.attr("stroke", "black")
				.attr("transform", function(d, i) {
					var xval = plot_for_x[i] + plot_for_width[i] - (plot_for_width[i] * PL) + PR;
					var width = (plot_for_width[i] * W);
					var yval = plot_for_y[i] - ((plot_for_width[i] * (R - 0.01)));
					var height = ((plot_for_width[i] * H));
					return "rotate(-26," + (xval - width) + "," + (yval + (height) / 2) + ")";
				})
				.attr("stroke-width", function(d, i) {
					return (plot_for_width[i] * 0.005);
				});

			//Hides the arc of ring on tag
			agroup.append("line")
				.attr("x1", function(d, i) {
					var xval = plot_for_x[i] + plot_for_width[i] - (plot_for_width[i] * PL) + PR;
					var width = (plot_for_width[i] * W);
					return (xval - width) + (plot_for_width[i] * 0.035);
				})
				.attr("y1", function(d, i) {
					var yval = plot_for_y[i] - ((plot_for_width[i] * R));
					var height = ((plot_for_width[i] * H));
					return (yval + (height / 2)) + (plot_for_width[i] * CP * 2);
				})
				.attr("x2", function(d, i) {
					var xval = plot_for_x[i] + plot_for_width[i] - (plot_for_width[i] * PL) + PR;
					return xval;
				})
				.attr("y2", function(d, i) {
					var yval = plot_for_y[i] - ((plot_for_width[i] * R));
					var height = ((plot_for_width[i] * H));
					return (yval + (height - (height / 3)));
				})
				.attr("stroke-width", function(d, i) {
					return plot_for_width[i] * CP;
				})
				.attr("stroke", "#ffbb10");

			agroup.append("line")
				.attr("x1", function(d, i) {
					var xval = plot_for_x[i] + plot_for_width[i] - (plot_for_width[i] * PL) + PR;
					return xval;
				})
				.attr("y1", function(d, i) {
					var yval = plot_for_y[i] - ((plot_for_width[i] * R));
					return yval;
				})
				.attr("x2", function(d, i) {
					var xval = plot_for_x[i] + plot_for_width[i] - (plot_for_width[i] * PL) + PR;
					return xval;
				})
				.attr("y2", function(d, i) {
					var yval = plot_for_y[i] - ((plot_for_width[i] * R));
					var height = ((plot_for_width[i] * H));
					return yval + height;
				})
				.attr("stroke-width", function(d, i) {
					var xval = plot_for_x[i] + plot_for_width[i] - (plot_for_width[i] * PL) + PR;
					var width = (plot_for_width[i] * W);
					var cxval = (xval - width) + (plot_for_width[i] * 0.035) + (plot_for_width[i] * CP);
					return xval - cxval;
				})
				.attr("stroke", "#ffbb10");
			hideRingArc(agroup, plot_for_semiarc, plot_for_line, plot_for_y);

			//creates the tag
			agroup.append("rect")
				.attr("class", "sap_viz_ext_affinity_tag")
				.attr("id", "tagRect")
				.attr("x", function(d, i) {
					var val = plot_for_x[i] + plot_for_width[i] - (plot_for_width[i] * PL);
					return val;
				})
				.attr("y", function(d, i) {
					var val = plot_for_y[i] - ((plot_for_width[i] * R));
					return val;
				})
				.attr("width", function(d, i) {
					var val = (plot_for_width[i] * R);
					return val;
				})
				.attr("height", function(d, i) {
					var val = ((plot_for_width[i] * H));
					return val;
				})
				.attr("fill", "#ffbb10");

			//adding text to bag tags
			agroup.append("text")
				.text(function(d, i) {
					var total;
					if (tprice === -1) {
						total = (d3.sum(d.items, function(x) {
							return x.price;
						}));
					} else {
						total = tprice;
					}
					if (msets.length !== 2) {
						return "...";
					}
					var val = "" + total;
					return val;
				})
				.attr("x", function(d, i) {
					var val = plot_for_x[i] + plot_for_width[i] - (plot_for_width[i] * PL);

					return val;
				})
				.attr("y", function(d, i) {
					var total;
					if (tprice === -1) {
						total = (d3.sum(d.items, function(x) {
							return x.price;
						}));
					} else {
						total = tprice;
					}
					var price = total.toString();
					var val1 = ((plot_for_width[i] * H));
					var priceLen = price.length;
					if (priceLen === 1) {
						priceLen += 1;
					}
					val1 = (plot_for_width[i] * R) / priceLen;
					var val = plot_for_y[i] - ((plot_for_width[i] * R));
					var height = ((plot_for_width[i] * H));
					return val + height - (height - val1) / 2;
				})
				.style("font-size", function(d, i) {
					var total;
					if (tprice === -1) {
						total = (d3.sum(d.items, function(x) {
							return x.price;
						}));
					} else {
						total = tprice;
					}
					var price = total.toString();
					var val = ((plot_for_width[i] * H));
					var priceLen = price.length;
					if (price.indexOf('.') !== -1) {
						priceLen--;
					}
					if (priceLen === 1) {
						priceLen += 1;
					}
					if (msets.length !== 2) {
						priceLen = 2;
					}
					val = (plot_for_width[i] * R) / priceLen;
					return val;
				})
				.attr("fill", "white")
				.on("click", function(d) {
					var total;
					if (tprice === -1) {
						total = (d3.sum(d.items, function(x) {
							return x.price;
						}));
					} else {
						total = tprice;
					}
					var val = "$" + total;
					var a = "Total Price ..." + val;
					var utterance = new SpeechSynthesisUtterance(a);
					window.speechSynthesis.speak(utterance);
				});
		}

		//Creates tree map
		function createTreeMap(minaxis) {

			var tm = {};
			var tPad = 3;

			var tm_g = agroup.append("g").attr("class", "sap_viz_ext_affinity_tmapEle").attr("transform", function() {
					var x = d3.select(this.parentNode.childNodes[0]).attr("x");
					var y = d3.select(this.parentNode.childNodes[0]).attr("y");
					return "translate(" + x + "," + y + ")";
				})
				.attr("height", function(d, i) {
					data_set[i].height = d3.select(this.parentNode.childNodes[0]).attr("height") - tPad;
					return data_set[i].height;
				})
				.attr("width", function(d, i) {
					data_set[i].width = d3.select(this.parentNode.childNodes[0]).attr("width") - tPad;
					return data_set[i].width;
				});
			tm_g.each(function(d, i) {
				var a = d3.select(this);
				var x = i;
				var root = data_set[x];
				var treemap = d3.layout.treemap()
					.round(false)
					.sticky(false).sort( /*function(a, b) { return a.value - b.value; }*/ d3.ascending)
					.size([root.height, root.width]).children(function(d) {
						return d.items
					})
					.value(function(d) {
						return d.price;
					})
				a.datum(root).selectAll("g").data(treemap.nodes(root)).enter().append("rect")
					.attr("class", "node")
					.call(position)
					.attr("fill", function(d) {
						return d.color
					});
			})
			.on("mouseover", function(d) {
				tooltip.visibility("block");
				var currency = "";
				var tt = tooltip;
				var matrix = this.getScreenCTM()
					.translate(+this.getAttribute("x"), +this.getAttribute("y"));
				var tt_w = "160px",
					tt_wi = 160;
				var leftPos = (window.pageXOffset + matrix.e);
				var rect_width = (parseFloat(d3.select(this.parentNode.children[0]).attr("width")));
				var classed = "";
				leftPos += rect_width;
				classed = "left";
				tooltip.orientation(classed);
				tooltip.fillData(toolTipData(d));
				tooltip.move([(window.pageYOffset + matrix.f) + "px", leftPos + "px"]);
			})
				.on("mouseout", function() {
					return tooltip.visibility("none");
				})
				.on("click", function(d) {
					zoomBag(d);
				});

			function position() {
				this.attr("x", function(d) {
					return d.x + tPad;
				})
					.attr("y", function(d) {
						return d.y + tPad;
					})
					.attr("width", function(d) {
						return Math.max(0, d.dx - tPad);
					})
					.attr("height", function(d) {
						return Math.max(0, d.dy - tPad);
					});
			}
		}

		//Customizing ticks on both axis
		function addingTicks(plot_for_line, yScale, h) {
			d3.selectAll("g.v-m-main g.v-m-plot g.vis g.x.sap_viz_ext_affinity_aaxis g")
				.attr("transform", function(d, i) {
					if (i < plot_for_line.length) {
						var val = plot_for_line[i];
						return "translate(" + val + ",0)";
					} else {
						this.remove();
					}
				});
			d3.selectAll("g.v-m-main g.v-m-plot g.vis g.x.sap_viz_ext_affinity_aaxis g text")
				.text(function(d, i) {
					return (data_set[i].combo_name);
				});
			d3.select("g.v-m-main g.v-m-plot g.vis g.y.sap_viz_ext_affinity_aaxis path.domain")
				.remove();
			d3.selectAll("g.v-m-main g.v-m-plot g.vis g.y.sap_viz_ext_affinity_aaxis g").remove();
			var yticks = d3.selectAll("g.v-m-main g.v-m-plot g.vis g.y.sap_viz_ext_affinity_aaxis");
			var div = (maxLift / (10.0));
			var incfac = 1;
			if (h < 30) {
				incfac = 10;
			}
			else if (h < 100) {
				incfac = 5;
			}
			else if (h < 250) {
				incfac = 2;
			}

			for (var i = 0; i <= 10; i += incfac) {
				var position = div * i;
				var tick = yticks.append("g")
					.attr("transform", function(d) {
						return "translate(0," + yScale(position) + ")";
					});
				tick.append("line")
					.attr("x2", -6)
					.attr("y2", 0);
				tick.append("text")
					.text(position.toFixed(1))
					.attr("x", -15)
					.attr("y", 0)
					.style("text-anchor", "end");
			}
		}

		//Adding labels on both axis
		function createAxisLabel(svg, h, w) {
			svg.append("text")
				.text(function(d) {
					return mset1;
				})
				.attr("id", "yaxisL")
				.attr("x", -40)
				.attr("y", h / 2)
				.style("font-size", 15)
				.style("font-weight", "bold")
				.attr("fill", "#000000")
				.attr("transform", "rotate(-90,-40," + h / 2 + ")");

			svg.append("text")
				.text(function(d) {
					return ds1;
				})
				.attr("id", "xaxisL")
				.attr("x", w / 2)
				.attr("y", h + 40)
				.style("font-size", 15)
				.style("font-weight", "bold")
				.attr("fill", "#000000");
		}

		//Building data set
		var visitedId = [];
			data_set = [];
			var visitedItem = [];
		var colorIndex = 0,
			color = "";
		var tdata_set = data.map(function(d) {
			if (visitedId.indexOf(d[ds1[0]]) === -1) {
				var lift = -1;
				var mems = [];
				visitedId.push(d[ds1[0]]);
				var item;
				for (var i = 0; i < maps.length; i++) {
					if (d[ds1[0]] === maps[i].bag_id) {
						if (visitedItem.indexOf(maps[i].item) === -1) {
							color = colorPalette[colorIndex % (colorPalette.length)];
							colorIndex++;
							visitedItem.push(maps[i].item);
						} else {
							color = colorPalette[visitedItem.indexOf(maps[i].item)];
						}
						if (maps[i].lift > lift) {
							lift = maps[i].lift;
						}
						if (maps[i].price > 0) {
							mems.push({
								name: maps[i].item,
								price: maps[i].price,
								color: color
							});
						}
					}
				}
				if (msets.length !== 2) {
					var cost = Math.floor(100 / mems.length);
					for (i = 0; i < mems.length; i++) {
						mems[i].price = cost;
					}
				}
				if (lift > 0) {
					data_set.push({
						"combo_name": d[ds1[0]],
						"lift": lift,
						"items": mems
					});
				}
			}
		});

		//Defining heigth and width for SVG
		var w = width - margin.left; // - margin.right,
		var h = height - margin.top - margin.bottom;
		var svg = vis.append("svg")
			.attr("width", w)
			.attr("height", chartHeight)
			.append("g")
			.attr("transform", "translate(" + (margin.left * 2) + "," + margin.top + ")");
		var saveData = data_set;
		var minaxis, maxaxis;
		if (h < w) {
			minaxis = h;
			maxaxis = w;
		} else {
			minaxis = w;
			maxaxis = h;
		}
		var xScale;
		var t_tip;
		var tooltip;
		var agroup;
		var pad_x;
		var retrieveBagEndPosition = [];

		function redraw(data) {
			retrieveBagEndPosition = [];
			data_set = data;
			pad_x = 0;

			var rec_xScale = createScale(0, max_x(data_set), 0, minaxis - (data_set.length) * pad_x);
			var yScale = ySanityCheck(rec_xScale, data_set, h);
			rec_xScale = createScale(0, max_x(data_set), 0, minaxis - (data_set.length) * pad_x);
			xScale = createScale(0, data_set.length, 0, w);
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.ticks(data_set.length)
				.orient("bottom");
			var yAxis = d3.svg.axis()
				.scale(yScale)
				.orient("left");
			svg.selectAll("#bags").remove();
			svg.selectAll("g").remove();
			d3.selectAll("#sap_viz_ext_affinity_t-tip").remove();
			var chart = svg.selectAll("g")
				.data(data_set)
				.enter();

			agroup = chart.append("g").attr("class", "chart-tmap")
				.attr("id", "bags")
				.attr("transform", "translate(10," + (0) + ")");

			var linegroup = chart.append("g").attr("class", "chart-tmap")
				.attr("id", "bags")
				.attr("transform", "translate(0," + (0) + ")");

			var plot_for_line = [],
				plot_for_arc = [],
				plot_for_x = [],
				plot_for_y = [],
				plot_for_width = [],
				plot_for_height = [],
				plot_for_semiarc = [];

			pad_x = ((w - (minaxis)) / data_set.length + 1);
			var k = pad_x / 2;

			//Creates rectangle for bags and maintian padding between them
			function calc_tmap_position() {
				this.attr("x", function(d, i) {
					var c = k;
					var s = rec_xScale(Math.sqrt(d3.sum(d.items, function(x) {
						return x.price;
					})));
					k += s + pad_x;
					retrieveBagEndPosition.push(k - pad_x / 2);
					plot_for_line[i] = c + s / 2;
					if (cont === "tm_sq") {
						plot_for_x.push(c);
						return (c);
					} else {
						plot_for_x.push(c + 5);
						return (c + 5);
					}
				})
					.attr("y", function(d, i) {
						var ret_val = (yScale(d.lift) - rec_xScale(Math.sqrt(d3.sum(d.items, function(x) {
							return x.price;
						}))));
						if (cont === "tm_sq") {
							plot_for_y.push(ret_val);
							return ret_val;
						} else {
							plot_for_y.push(ret_val + 5);
							return ret_val + 5;
						}
					})
					.attr("width", function(d) {
						var w = rec_xScale(Math.sqrt(d3.sum(d.items, function(x) {
							return x.price;
						})));
						if (cont === "tm_sq") {} else {
							w = w - 10;
						}
						if (w < 0) {
							w = 0;
						}
						plot_for_width.push(w);
						var d = (w * (0.4));
						var r = d / 2;
						var p = Math.PI;
						var arc = d3.svg.arc()
							.innerRadius(w * 0.19)
							.outerRadius((w * 0.25))
							.startAngle((p / 2))
							.endAngle(-p + (p / 2));

						plot_for_arc.push(arc());
						arc.endAngle(p - 2.2);
						plot_for_semiarc.push(arc());
						return w;
					})
					.attr("height", function(d) {
						var h = rec_xScale(Math.sqrt(d3.sum(d.items, function(x) {
							return x.price;
						})));
						if (cont === "tm_sq") {
							if (h < 0) {
								h = 0;
							}
							plot_for_height.push(h);
							return h;
						} else {
							if (h < 0) {
								h = 0;
							}
							plot_for_height.push(h);
							return h - 10;
						}
					});
			}

			t_tip = new d3.isv.tooltip();
			tooltip = t_tip();

			var cont = "tm_sq";
			var rect_cont = agroup.append("rect")
				.attr("class", "tm_rect")
				.attr("fill", "#dadada")
				.call(calc_tmap_position)
				.on("mouseover", function(d) {
					tooltip.visibility("block");
					var currency = "";
					var tt = tooltip;
					var matrix = this.getScreenCTM()
						.translate(+this.getAttribute("x"), +this.getAttribute("y"));
					var tt_w = "160px",
						tt_wi = 160;
					var leftPos = (window.pageXOffset + matrix.e);
					var rect_width = (parseFloat(d.width)) + 3;
					var classed = "";
					leftPos += rect_width;
					classed = "left";
					tooltip.orientation(classed);
					tooltip.fillData(toolTipData(d));
					tooltip.move([(window.pageYOffset + matrix.f) + "px", leftPos + "px"]);
					return tooltip.visibility("block");
				})
				.on("mouseout", function() {
					return tooltip.visibility("none");
				})
				.on("click", function(d) {
					zoomBag(d);
				});

			createTreeMap(minaxis);
			createPathForLift(agroup, yScale, plot_for_line);
			createBagPacking(agroup, plot_for_x, plot_for_y, plot_for_width);
			createBagHandles(agroup, plot_for_arc, plot_for_line, plot_for_y);

			if (msets.length === 2) {
				createBagTags(agroup, plot_for_x, plot_for_y, plot_for_width, plot_for_height, plot_for_line, plot_for_semiarc, -1);
			}
			createAxisLabel(svg, h, w);

			svg.append("g")
				.attr("id", "XAxis")
				.attr("class", "x sap_viz_ext_affinity_aaxis")
				.attr("transform", "translate(10," + (h) + ")")
				.call(xAxis);

			svg.append("g")
				.attr("id", "YAxis")
				.attr("class", "y sap_viz_ext_affinity_aaxis")
				.attr("transform", "translate(10," + (0) + ")")
				.call(yAxis);

			addingTicks(plot_for_line, yScale, h);
		}
		redraw(data_set);

		var zoom = d3.behavior.zoom()
			.x(xScale)
			.on("zoom", draw);

		var drag = d3.behavior.drag()
			.on("drag", dragmove)
			.on("dragstart", dragStart)
			.on("dragend", dragEnd);

		svg.append("rect")
			.attr("class", "sap_viz_ext_affinity_pane")
			.attr("width", width)
			.attr("height", height)
			.on("mousewheel.zoom", draw)
			.call(drag);

		var size = data_set.length;
		var data = [];

		for (var i = 0; i < saveData.length; i++) {
			data.push(saveData[i]);
		}
		var prevScale = 0,
			changeValue = 0,
			flag = 0;
		var lvalues = [],
			rvalues = [];
		var counter = 0;
		var dragX = 0;
		function dragStart(d) {
			dragX = 0;
		}
		function dragEnd() {
			var dragx = 1;
		}
		function dragmove(d) {
			if (dragX == 0) {
				var initialX = d3.event.x;
				dragX = 1;
			}
			var takeNextElement = Math.abs(initialX - d3.event.x);
			if (initialX > d3.event.x) {
				if (takeNextElement > pad_x) {
					if (rvalues.length > 0) {
						lvalues.push(data[0]);
						data.shift();
						data.push(rvalues[rvalues.length - 1]);
						rvalues.pop();
						if (data.length > 0) {
							size = data.length;
							initialX = d3.event.x;
							redraw(data);
						}
					}
				}
			} else {
				if (takeNextElement > pad_x) {
					if (lvalues.length > 0) {
						data.unshift(lvalues[lvalues.length - 1]);
						lvalues.pop();
						rvalues.push(data[data.length - 1]);
						data.pop();
						if (data.length > 0) {
							size = data.length;
							initialX = d3.event.x;
							redraw(data);
						}
					}
				}
			}
		}

		function draw() {
			var e = window.event || e;
			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			var currentScale = Math.round(d3.event.scale);
			var coordinates = [0, 0];
			coordinates = d3.mouse(this);
			var x = coordinates[0];
			var y = coordinates[1];

			//var focus = Math.max(0,Math.round((x/pad_x)));
			for (var i = 0; i < retrieveBagEndPosition.length; i++) {
				if (retrieveBagEndPosition[i] > x) {
					var focus = i;
					// console.log(retrieveBagEndPosition[i]);
					break;
				}
			}

			var left = focus;
			var right = size - focus - 1;
			var datalen = data.length / 2;
			// console.log("Delta " + delta);
			// console.log("X :: " + x);
			// console.log("W :: " + w);
			// console.log("Size :: " + size);
			// console.log("PadX :: " + pad_x);
			// console.log("Focus:: " + focus + " " + left + " " + right);
			// console.log("===========");
			if (delta == 1) {
				var leftRemovalCounter = Math.round(datalen * (left) / (left + right));
				var rightRemovalCounter = Math.round(datalen * (right) / (left + right));
				// console.log("LRC " + leftRemovalCounter + " RRC " + rightRemovalCounter);
				for (var i = 0; i < leftRemovalCounter; i++) {
					if (data.length > 1) {
						lvalues.push(data[0]);
						data.shift();
						left--;
					}
				}
				for (var i = 0; i < rightRemovalCounter; i++) {
					if (data.length > 1) {
						rvalues.push(data[data.length - 1]);
						data.pop();
						right--;
					}
				}
				if (data.length > 0) {
					redraw(data);
					size = data.length;
				}
			} else {
				datalen *= 4;
				left += (lvalues.length);
				right += (rvalues.length);
				var leftRemovalCounter = Math.round(datalen * (left) / (left + right));
				var rightRemovalCounter = Math.round(datalen * (right) / (left + right));
				for (var i = 0; i < leftRemovalCounter; i++) {
					var llen = lvalues.length;
					if (llen > 0) {
						data.unshift(lvalues[llen - 1]);
						lvalues.pop();
						left--;
					}
				}
				for (var i = 0; i < rightRemovalCounter; i++) {
					var rlen = rvalues.length;
					if (rlen > 0) {
						data.push(rvalues[rlen - 1]);
						rvalues.pop();
						right--;
					}
				}
				if (data.length > 0) {
					redraw(data);
					size = data.length;
				}
			}
		}
	};

	return render;
});