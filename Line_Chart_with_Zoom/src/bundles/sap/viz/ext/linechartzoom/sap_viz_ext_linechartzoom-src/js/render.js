define("sap_viz_ext_linechartzoom-src/js/render", [], function() {

	var render = function(data, container) {
		var margin = {
			top: 20,
			right: 20,
			bottom: 30,
			left: 40
		};
		//prepare canvas with width and height of container
		var width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom;
		var W = width,
			H = height;
		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

		var dsets = data.meta.dimensions(),
			msets = data.meta.measures();

		var ds1 = data.meta.dimensions(0);
		var ms1 = data.meta.measures(0);

		var dataSet = [];
		for (var i = 0; i < ms1.length; i++) {
			var tdata = [];
			var index = 0;
			var fdata = data.map(function(d) {
				if (d[ds1[0]] != null && d[ms1[i]] != null) {
					tdata.push({
						"yaxis": d[ms1[i]],
						"items": d[ds1[0]],
						"index": index
					});
					index++;
				}
			});
			dataSet.push(tdata);
		}
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
			// default height

			function tooltip() {
				// generate tooltip here, using `width` and `height`
				var tt = d3.select("body").append("div").attr("id", "sap_viz_ext_linechartzoom_t-tip").style("display", disp);
				var tooltip = tt.append("div").attr("class", "sap_viz_ext_linechartzoom_ltt-inner").style("text-align", "left");
				tooltip.append("div").attr("id", "sap_viz_ext_linechartzoom_triangle").attr("class", classed);
				tooltip.append("div").attr("id", "sap_viz_ext_linechartzoom_tt-body");
				tooltip.visibility = function(value) {
					d3.selectAll("#sap_viz_ext_linechartzoom_t-tip").style("display", value);
				};
				tooltip.orientation = function(value) {
					d3.selectAll("#sap_viz_ext_linechartzoom_t-tip #sap_viz_ext_linechartzoom_triangle").attr("class", value);
				};
				tooltip.move = function(value) {
					d3.selectAll("#sap_viz_ext_linechartzoom_t-tip").style("top", value[0]).style("left", value[1]);
				};
				tooltip.fillData = function(value) {
					d3.selectAll("#sap_viz_ext_linechartzoom_t-tip #sap_viz_ext_linechartzoom_tt-body").html(value);
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
		//Stand alone brush implementation
		//@param {LineGraph} - Graph on which brush to be applied
		//@param {_data} - data set for graph
		//@param {config} - configuratoin for brush
		function brush(lineGraph, _data, config) {
			var margin = {
				top: 20,
				right: 20,
				bottom: 30,
				left: 40
			};
			var chartConfig = {
				width: W,
				height: H * 0.3
			};
			var brushChart = new config.chartName('s', _data, chartConfig);
			var brushObj = this;
			var brushArea, brushxarea, brushyarea;

			this.createBrushArea = function() {
				if (config.xy === true) {
					config.x = false;
					config.y = false;
				} else if (config.x === true) {
					config.xy = false;
					config.y = false;
				} else if (config.y === true) {
					config.xy = false;
					config.x = false;
				}
				brushArea = brushChart.svg;
				brushyarea = brushChart.svg.selectAll(config.yAxisArea);
				brushxarea = brushChart.svg.selectAll(config.xAxisArea);
			};

			//Applying brush on both x and y axis
			var brushxy;
			this.createxybrush = function() {
				if (config.xy) {
					brushxy = d3.svg.brush()
						.x(brushChart.xLinear)
						.y(brushChart.y)
						.on("brushstart", brushStartXY)
						.on("brush", brushMoveXY)
						.on("brushend", brushEndXY);
					brushArea.append("g")
						.attr("class", "sap_viz_ext_linechartzoom_brush")
						.attr("id", "sap_viz_ext_linechartzoom_xyarea")
						.call(brushxy)
						.selectAll("rect");
				}
			};
			//Applying brush on y axis only
			var brushy;
			this.createybrush = function() {
				if (config.y) {
					brushy = d3.svg.brush()
						.y(brushChart.y)
						.on("brushstart", brushStartY)
						.on("brush", brushMoveY)
						.on("brushend", brushEndY);
					brushArea.append("g")
						.attr("class", "sap_viz_ext_linechartzoom_brush")
						.attr("id", "sap_viz_ext_linechartzoom_yarea")
						.call(brushy)
						.selectAll("rect")
						.attr("width", brushChart.W);
				}
				if (config.xy) {
					brushy = d3.svg.brush()
						.y(brushChart.y)
						.on("brushstart", brushStartY)
						.on("brush", brushMoveY)
						.on("brushend", brushEndY);
					brushyarea.append("g")
						.attr("class", "sap_viz_ext_linechartzoom_brush")
						.attr("id", "sap_viz_ext_linechartzoom_yarea")
						.call(brushy)
						.selectAll("rect")
						.attr("width", margin.left)
						.attr("transform", "translate(" + (margin.left * (-1)) + ",0)");
				}
			};

			//Applying brush on x axis only
			var brushx;
			this.createxbrush = function() {
				if (config.x) {
					brushx = d3.svg.brush()
						.x(brushChart.xLinear)
						.on("brushstart", brushStartX)
						.on("brush", brushMoveX)
						.on("brushend", brushEndX);
					brushArea.append("g")
						.attr("class", "sap_viz_ext_linechartzoom_brush")
						.attr("id", "sap_viz_ext_linechartzoom_xarea")
						.call(brushx)
						.selectAll("rect")
						.attr("height", brushChart.H);
				}
				if (config.xy) {
					brushx = d3.svg.brush()
						.x(brushChart.xLinear)
						.on("brushstart", brushStartX)
						.on("brush", brushMoveX)
						.on("brushend", brushEndX);
					brushxarea.append("g")
						.attr("class", "sap_viz_ext_linechartzoom_brush")
						.attr("id", "sap_viz_ext_linechartzoom_xarea")
						.call(brushx)
						.selectAll("rect")
						.attr("height", margin.bottom);
				}
			};
			this.createBrush = function() {
				this.createxbrush();
				this.createybrush();
				this.createxybrush();
			};
			var x1, x2, y1, y2;
			this.redraw = function(data) {
				if (data.length > 0) {
					var ticksControler = Math.max(1, Math.ceil(data[0].length / 16));

					function textFormatter(value) {
						if (value >= 10000) {
							if (value >= 1000000) {
								if (value >= 1000000000) {
									if (value >= 1000000000000) {
										if (value >= 1000000000000000) {
											return value / 1000000000000000 + "P";
										}
										return value / 1000000000000 + "T";
									}
									return value / 1000000000 + "B";
								}
								return value / 1000000 + "M";
							}
							return value / 1000 + "K";
						}
						return value;
					}
					lineGraph.svg.select(".x.sap_viz_ext_linechartzoom_axisl").call(d3.svg.axis().scale(lineGraph.x).orient("bottom")
						.tickValues(lineGraph.x.domain().filter(function(d, i) {
							return !(i % ticksControler);
						})));
					lineGraph.svg.select(".y.sap_viz_ext_linechartzoom_axisl").call(d3.svg.axis().scale(lineGraph.y).orient("left").tickFormat(textFormatter));
					lineGraph.draw(data, 'm');
				}
			};
			this.defaultRender = function() {
				lineGraph.x.domain(brushChart.x.domain());
				lineGraph.y.domain(brushChart.y.domain());
			};
			this.resize = function(brush, type, obj) {
				var s = d3.event.target.extent();
				var data = [];
				if (brush.empty()) {
					data = _data;
					brushObj.defaultRender();
				} else if (type === 'x') {
					x1 = Math.round(s[0]);
					x2 = Math.round(s[1]);
					data = config.getXpoints(x1, x2);
					var xdata;
					var xlen = -1;
					var ndata = [];
					if (data.length > 0) {
						for (var i = 0; i < data.length; i++) {
							if (data[i].length > xlen) {
								xdata = data[i];
							}
						}
						for (var i = 0; i < xdata.length; i++) {
							ndata.push({
								"items": xdata[i].items
							});
						}
					}
					lineGraph.x.domain(ndata.map(function(d) {
						return d.items;
					}));
					d3.select(obj).call(brush.extent([x1, x2]));
				} else if (type === 'y') {
					y1 = Math.round(s[0]);
					y2 = Math.round(s[1]);
					data = config.getYpoints(y1, y2);
					lineGraph.y.domain([y1, y2]);
					d3.select(obj).call(brush.extent([y1, y2]));
				} else if (type === "xy") {
					x1 = Math.round(s[0][0]);
					y1 = Math.round(s[0][1]);
					x2 = Math.round(s[1][0]);
					y2 = Math.round(s[1][1]);
					data = config.getXYpoints(x1, x2, y1, y2);
					xlen = -1;
					ndata = [];
					if (data.length > 0) {
						for (var i = 0; i < data.length; i++) {
							if (data[i].length > xlen) {
								xdata = data[i];
							}
						}
						for (var i = 0; i < xdata.length; i++) {
							ndata.push({
								"items": xdata[i].items
							});
						}
					}
					lineGraph.x.domain(ndata.map(function(d) {
						return d.items;
					}));
					lineGraph.y.domain([y1, y2]);
					d3.select(obj).call(brush.extent([
						[x1, y1],
						[x2, y2]
					]));
				}
				brushObj.redraw(data);
			};

			function brushStartXY() {
				d3.selectAll("#sap_viz_ext_linechartzoom_xarea").remove();
				d3.selectAll("#sap_viz_ext_linechartzoom_yarea").remove();
			}

			function brushMoveXY() {
				var s = d3.event.target.extent();
				x1 = (s[0][0]);
				y1 = (s[0][1]);
				x2 = (s[1][0]);
				y2 = (s[1][1]);
				data = [];
				if (brushxy.empty()) {
					data = _data;
					brushObj.defaultRender();
				} else {
					data = config.getXYpoints(x1, x2, y1, y2);
					var xdata;
					var xlen = -1;
					var ndata = [];
					if (data.length > 0) {
						for (var i = 0; i < data.length; i++) {
							if (data[i].length > xlen) {
								xdata = data[i];
							}
						}
						for (var i = 0; i < xdata.length; i++) {
							ndata.push({
								"items": xdata[i].items
							});
						}
					}
					lineGraph.x.domain(ndata.map(function(d) {
						return d.items;
					}));
					lineGraph.y.domain([y1, y2]);
				}
				brushObj.redraw(data);
			}

			function brushEndXY() {

				brushObj.createxbrush();
				brushObj.createybrush();
				if (config.autoresize === true) {
					brushObj.resize(brushxy, "xy", this);
				}
			}

			function brushStartY() {
				d3.selectAll("#sap_viz_ext_linechartzoom_xarea").remove();
				d3.selectAll("#sap_viz_ext_linechartzoom_xyarea").remove();
			}

			function brushMoveY() {
				var s = d3.event.target.extent();
				data = [];
				if (brushy.empty()) {
					data = _data;
					brushObj.defaultRender();
				} else {
					y1 = s[0];
					y2 = s[1];
					data = config.getYpoints(y1, y2);
					lineGraph.y.domain([y1, y2]);
				}
				brushObj.redraw(data);
			}

			function brushEndY() {
				brushObj.createxbrush();
				brushObj.createxybrush();
				if (config.autoresize === true) {
					brushObj.resize(brushy, "y", this);
				}
			}

			function brushStartX() {}

			function brushMoveX() {
				var s = d3.event.target.extent();
				data = [];
				var tickItems = [];
				if (brushx.empty()) {
					data = _data;
					brushObj.defaultRender();
				} else {
					x1 = (s[0]);
					x2 = (s[1]);
					data = config.getXpoints(x1, x2);
					var xdata;
					var xlen = -1;
					var ndata = [];
					if (data.length > 0) {
						for (var i = 0; i < data.length; i++) {
							if (data[i].length > xlen) {
								xdata = data[i];
							}
						}
						for (var i = 0; i < xdata.length; i++) {
							ndata.push({
								"items": xdata[i].items
							});
						}
					}
					lineGraph.x.domain(ndata.map(function(d) {
						return d.items;
					}));
				}
				brushObj.redraw(data);
			}

			function brushEndX() {
				if (config.autoresize === true) {
					brushObj.resize(brushx, "x", this);
				}
			}
		}
		//Line chart implementation
		function lineChart(type, _data, config) {
			var margin = {
				top: 20,
				right: 20,
				bottom: 20,
				left: 40
			};
			this.width = parseInt(config.width) || 960;
			this.height = parseInt(config.height) || 500;
			this.gap = 0;
			this.ease = "bounce";

			var svg;
			var element;
			var element_class;
			var dispatch = d3.dispatch("customHover");
			var colors = [
				'steelblue',
				'green',
				'red',
				'purple'
			];
			if (type === 'm') {
				margin.bottom = H * 0.3;
			} else {
				this.height = H;
				margin.bottom = 20;
				margin.top = H * 0.8;
			}
			this.margin = margin;
			var chartW = this.width - margin.left - margin.right,
				chartH = this.height - margin.top - margin.bottom;
			this.W = chartW;
			this.H = chartH;
			var x1 = d3.scale.ordinal()
				.rangePoints([10, chartW]);
			var y1 = d3.scale.linear()
				.range([chartH, 0]);
			var xdata;
			var xlen = -1;
			var ndata = [];
			for (var i = 0; i < _data.length; i++) {
				if (_data[i].length > xlen) {
					xdata = _data[i];
				}
			}
			for (var i = 0; i < xdata.length; i++) {
				ndata.push({
					"items": xdata[i].items
				});
			}
			var items = xdata.length - 1;
			var xLinear = d3.scale.linear()
				.range([0, chartW])
				.domain([0, items]);
			var maxSales = -1;
			for (var i = 0; i < _data.length; i++) {
				for (var j = 0; j < _data[i].length; j++) {
					if (_data[i][j].yaxis > maxSales) {
						maxSales = _data[i][j].yaxis;
					}
				}
			}
			x1.domain(ndata.map(function(d) {
				return d.items;
			}));
			y1.domain([0, maxSales + 2]);
			this.x = x1;
			this.y = y1;
			this.xLinear = xLinear;

			function textFormatter(value) {
				if (value >= 10000) {
					if (value >= 1000000) {
						if (value >= 1000000000) {
							if (value >= 1000000000000) {
								if (value >= 1000000000000000) {
									return value / 1000000000000000 + "P";
								}
								return value / 1000000000000 + "T";
							}
							return value / 1000000000 + "B";
						}
						return value / 1000000 + "M";
					}
					return value / 1000 + "K";
				}
				return value;
			}
			var xAxis = d3.svg.axis()
				.scale(x1)
				.orient("bottom");
			var ticksControler = Math.max(1, Math.ceil(_data[0].length / 16));
			var yAxis = d3.svg.axis()
				.scale(y1)
				.orient("left");
			if (type === 'm') {
				yAxis.tickFormat(textFormatter);
				xAxis.tickValues(x1.domain().filter(function(d, i) {
					return !(i % ticksControler);
				}));
			}
			this.xAxis = xAxis;
			this.yAxis = yAxis;
			if (!svg) {
				svg = vis
					.append("svg")
					.attr("width", chartW + margin.left + margin.right)
					.attr("height", chartH + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");
			}
			if (type === 's') {
				svg.append("g")
					.attr("class", "x sap_viz_ext_linechartzoom_axisl")
					.attr("id", "sap_viz_ext_linechartzoom_xlines")
					.attr("transform", "translate(0," + chartH + ")")
					.call(xAxis);
				svg.append("g")
					.attr("id", "sap_viz_ext_linechartzoom_ylines")
					.attr("class", "y sap_viz_ext_linechartzoom_axisl")
					.call(yAxis);
			} else {
				svg.append("g")
					.attr("class", "x sap_viz_ext_linechartzoom_axisl")
					.attr("id", "sap_viz_ext_linechartzoom_xline")
					.attr("transform", "translate(0," + chartH + ")")
					.call(xAxis);
				svg.append("g")
					.attr("id", "sap_viz_ext_linechartzoom_yline")
					.attr("class", "y sap_viz_ext_linechartzoom_axisl")
					.call(yAxis);
			}
			if (type === 's') {
				d3.selectAll("#sap_viz_ext_linechartzoom_xlines").remove();
				d3.selectAll("#sap_viz_ext_linechartzoom_ylines").remove();
				var borderPath = svg.append("rect")
					.attr("x", 0)
					.attr("y", -5)
					.attr("height", chartH + 10)
					.attr("width", chartW + 5)
					.attr("stroke", "black")
					.attr("fill", "none")
					.attr("stroke-width", 1);
			}
			var ga = [],
				gttItems = {},
				dlen = _data[0].length;
			for (var i = 0; i < _data.length; i++) {
				for (var j = 0; j < _data[i].length; j++) {
					var point = _data[i][j];
					ga.push({
						'index': j,
						'point': point
					});
					if (gttItems[point.items] === undefined) {
						var items = new Array(_data.length);
						for (var k = 0; k < _data.length; k++) {
							items[k] = 0;
						}
						gttItems[point.items] = items;
					}
					gttItems[point.items][i] = point.yaxis;
				}
			}
			var t_tip = new d3.isv.tooltip();
			var ltooltip = t_tip();
			this.draw = function(_data, type) {
				var line = d3.svg.line()
					.interpolate("linear")
					.x(function(d, i) {
						return x1(d.items);
					})
					.y(function(d) {
						return y1(d.yaxis);
					});
				svg.selectAll(".sap_viz_ext_linechartzoom_linechart").remove();
				svg.selectAll(".dots").remove();
				svg.selectAll(".rects").remove();
				var symbol1 = svg.selectAll(".sap_viz_ext_linechartzoom_linechart")
					.data(_data)
					.enter()
					.append("path")
					.attr("class", "sap_viz_ext_linechartzoom_linechart")
					.attr('stroke', function(d, i) {
						return colors[i % colors.length];
					})
					.attr("d", line);
				var ttItems = gttItems;
				var a = [];
				var inc = 0;
				var points = svg.selectAll('.dots')
					.data(_data)
					.enter()
					.append("g")
					.attr("class", "sap_viz_ext_linechartzoom_dots");
				points.selectAll('.dot')
					.data(function(d, index) {
						for (var i = 0; i < d.length; i++) {
							a.push(ga[inc + d[i].index]);
						}
						inc += dlen;
						return a;
					})
					.enter()
					.append('circle')
					.attr('class', 'sap_viz_ext_linechartzoom_dot')
					.attr("r", 4)
					.attr("fill", "none")
					.attr("transform", function(d) {
						return "translate(" + x1(d.point.items) + "," + y1(d.point.yaxis) + ")";
					});
				if (type === 'm') {
					var rectwidth = Math.max(0, (chartW / ((a.length) / _data.length) - 1));
					var rect = svg.selectAll('.rects')
						.data(_data)
						.enter()
						.append("g")
						.attr("class", "sap_viz_ext_linechartzoom_rects");
					rect.selectAll('.rect')
						.data(a)
						.enter()
						.append('rect')
						.attr('class', 'sap_viz_ext_linechartzoom_rect')
						.attr("width", function(d) {
							return rectwidth;
						})
						.attr("height", function(d) {
							return chartH;
						})
						.attr("transform", function(d) {
							return "translate(" + (x1(d.point.items) - 2 - (rectwidth / 2)) + "," + y1(maxSales + 2) + ")";
						})
						.attr("opacity", "0")
						.on("mouseover", function(d) {
							var obj = d;
							ltooltip.visibility("block");
							var ltt = ltooltip;
							var matrix = this.getScreenCTM()
								.translate(+this.getAttribute("x"), +this.getAttribute("y"));
							maxSales = -1;
							var leftPos = (window.pageXOffset + matrix.e) - 40 + (rectwidth / 2);
							var classed = "";
							var maxToolTipLen = -1;
							ltooltip.orientation(classed);
							var tt_data = "<div class='sap_viz_ext_linechartzoom_ltt-item sap_viz_ext_linechartzoom_ltt-combo'>" + obj.point.items + "</div>";
							for (var i = 0; i < ttItems[obj.point.items].length; i++) {
								var item_data = "";
								item_data = item_data + "<div class='sap_viz_ext_linechartzoom_ltt-item'>";
								item_data = item_data + "<span class='sap_viz_ext_linechartzoom_ltt-item-color' style='width:10px;height:10px;background:" + colors[i % colors.length] +
									";float:left'></span>";
								item_data = item_data + "<span class='sap_viz_ext_linechartzoom_ltt-item-name'>" + ms1[i] + "\u00a0\u00a0\u00a0\u00a0" + "</span>";
								item_data = item_data + "<span class='sap_viz_ext_linechartzoom_ltt-item-price'>" + ttItems[obj.point.items][i] + "</span></div>";
								maxToolTipLen = Math.max(maxToolTipLen, ttItems[obj.point.items][i].toString().length);
								tt_data += item_data;
								if (ttItems[obj.point.items][i] > maxSales) {
									maxSales = ttItems[obj.point.items][i];
								}
							}
							leftPos -= (maxToolTipLen * 4);
							ltooltip.fillData(tt_data);
							var padding = 150 - (25 * (ms1.length - 1));
							ltooltip.move([(y1(maxSales) + padding) + "px", leftPos + "px"]);
							svg.append("line")
								.attr("id", "sap_viz_ext_linechartzoom_dotline")
								.attr("x1", function(d) {
									return x1(obj.point.items);
								})
								.attr("x2", function(d) {
									return x1(obj.point.items);
								})
								.attr("y1", y1(maxSales))
								.attr("y2", chartH)
								.style("stroke-dasharray", ("6, 2"))
								.attr("stroke", "#BDBDBD");
						})
						.on("mouseout", function(d) {
							d3.selectAll("#sap_viz_ext_linechartzoom_dotline").remove();
							ltooltip.visibility("none");
						});
				}
				this.symbol1 = symbol1;
			};
			this.getXpoints = function(x1, y1) {
				var data = [];
				var ndata = [];
				x1 = Math.round(x1);
				y1 = Math.round(y1);
				if (x1 < y1) {
					for (var j = 0; j < _data.length; j++) {
						for (var i = x1; i <= y1; i++) {
							data.push(_data[j][i]);
						}
						ndata.push(data);
						data = [];
					}
				}
				return ndata;
			};
			this.getYpoints = function(x1, y1) {
				var data = [];
				var ndata = [];
				for (var j = 0; j < _data.length; j++) {
					for (var i = 0; i < _data[j].length; i++) {
						if (_data[j][i].yaxis >= x1 && _data[j][i].yaxis <= y1) {
							data.push(_data[j][i]);
						}
					}
					ndata.push(data);
					data = [];
				}
				return ndata;
			};
			this.getXYpoints = function(x1, x2, y1, y2) {
				var data = [];
				var ndata = [];
				x1 = Math.round(x1);
				x2 = Math.round(x2);
				if (x1 < x2) {
					for (var j = 0; j < _data.length; j++) {
						for (var i = x1; i <= x2; i++) {
							if (_data[j][i].yaxis >= y1 && _data[j][i].yaxis <= y2) {
								data.push(_data[j][i]);
							}
						}
						ndata.push(data);
						data = [];
					}
				}
				return ndata;
			};
			this.draw(_data, type);
			this.svg = svg;
		}
		var chartConfig = {
			width: W,
			height: H
		};
		var lineGraph = new lineChart('m', dataSet, chartConfig);
		var brushConfig = {
			xy: false,
			x: true,
			y: false,
			autoresize: true,
			getXYpoints: lineGraph.getXYpoints,
			getYpoints: lineGraph.getYpoints,
			getXpoints: lineGraph.getXpoints,
			xAxisArea: "#sap_viz_ext_linechartzoom_xline",
			yAxisArea: "#sap_viz_ext_linechartzoom_yline",
			chartName: lineChart
		};
		var brushGraph = new brush(lineGraph, dataSet, brushConfig);
		brushGraph.createBrushArea();
		brushGraph.createBrush();
	};
	return render;
});