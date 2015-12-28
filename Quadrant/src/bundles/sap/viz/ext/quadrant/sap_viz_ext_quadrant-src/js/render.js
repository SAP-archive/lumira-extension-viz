define("sap_viz_ext_quadrant-src/js/render", [], function() {

	var persi = 1;
	var saveObject, retrievedObject;

	var render = function(data, container) {
		var margin = {
			top: 20,
			right: 20,
			bottom: 40,
			left: 40
		};
		//prepare canvas with width and height of container
		var width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom,
			colorPalette = this.colorPalette();
		var W = width;
		var H = height;
		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

		var dsets = data.meta.dimensions(),
			msets = data.meta.measures();

		var ms1 = data.meta.measures(0);
		var ms2 = data.meta.measures(1);
		var ds1 = data.meta.dimensions(0);

		var color = d3.scale.ordinal().range(colorPalette);
		var map = [];

		var fdata = data.map(function(d) {
			if (d[ds1[0]] != null && d[ms1[0]] != null && d[ms2[0]] != null) {
				map.push({
					x: d[ms1[0]],
					y: d[ms2[0]],
					color: d[ds1[0]]
				});
			}
		});

		var data = map;
		d3.selectAll("#sap_viz_ext_quadrant_t-tipb").remove();
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
				var tt = d3.select("body").append("div").attr("id", "sap_viz_ext_quadrant_t-tipb").style("display", disp);
				var tooltip = tt.append("div").attr("class", "sap_viz_ext_quadrant_qtt-innerplot").style("text-align", "left");
				tooltip.append("div").attr("id", "triangle").attr("class", classed);
				tooltip.append("div").attr("id", "tt-body");
				tooltip.visibility = function(value) {
					d3.selectAll("#sap_viz_ext_quadrant_t-tipb").style("display", value);
				};
				tooltip.orientation = function(value) {
					d3.selectAll("#sap_viz_ext_quadrant_t-tipb #triangle").attr("class", value);
				};
				tooltip.move = function(value) {
					d3.selectAll("#sap_viz_ext_quadrant_t-tipb").style("top", value[0]).style("left", value[1]);
				};
				tooltip.fillData = function(value) {
					d3.selectAll("#sap_viz_ext_quadrant_t-tipb #tt-body").html(value);
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

		function textFormatter(value) {
			if (value >= 1000) {
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
				return value / 1000 + "K";
			}
			if (value <= -1000) {
				if (value <= -10000) {
					if (value <= -1000000) {
						if (value <= -1000000000) {
							if (value <= -1000000000000) {
								if (value <= -1000000000000000) {
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
				return value / 1000 + "K";
			}
			return value;
		}
		width = W - margin.left - margin.right;
		height = H - margin.top - margin.bottom;
		var w = width;
		var parent = "";

		function changeText() {
			var obj = d3.selectAll("#sap_viz_ext_quadrant_txtf");
			if (obj[0].length) {
				var txt = obj[0];
				var value = txt[0];
				if (parent === "txt1") {
					var quad1obj = d3.selectAll("#sap_viz_ext_quadrant_t-tip1");
					if (quad1obj[0].length) {
						vis.selectAll("#txt1").text(value.value.trim());
					}
					if (value.value.trim() === "") {
						vis.selectAll("#txt1").text("...");
					} else {
						var object = vis.selectAll("#txt1");
						var text = object[0];
						vis.selectAll("#txt1")
							.attr("x", ((width / saveObject.xpercentage) / 2) - (text[0].clientWidth / 2));
						if ((width / saveObject.xpercentage) <= text[0].clientWidth) {
							vis.select("#txt1")
								.style("opacity", 0);
						}
					}
					saveObject.q1Name = value.value.trim();
				} else if (parent === "txt2") {
					quad1obj = d3.selectAll("#sap_viz_ext_quadrant_t-tip1");
					if (quad1obj[0].length) {
						vis.selectAll("#txt2").text(value.value.trim());
					}
					if (value.value.trim() === "") {
						vis.selectAll("#txt2").text("...");
					} else {
						object = vis.selectAll("#txt2");
						text = object[0];
						vis.selectAll("#txt2")
							.attr("x", ((width / saveObject.xpercentage) + (width - (width / saveObject.xpercentage)) / 2) - (text[0].clientWidth / 2));
						if ((width - (width / saveObject.xpercentage)) <= text[0].clientWidth) {
							vis.select("#txt2")
								.style("opacity", 0);
						}
					}
					saveObject.q2Name = value.value.trim();
				} else if (parent === "txt3") {
					quad1obj = d3.selectAll("#sap_viz_ext_quadrant_t-tip1");
					if (quad1obj[0].length) {
						vis.selectAll("#txt3").text(value.value.trim());
					}
					if (value.value.trim() === "") {
						vis.selectAll("#txt3").text("...");
					} else {
						object = vis.selectAll("#txt3");
						text = object[0];
						vis.selectAll("#txt3")
							.attr("x", ((width / saveObject.xpercentage) / 2) - (text[0].clientWidth / 2));
						if ((width / saveObject.xpercentage) <= text[0].clientWidth) {
							vis.select("#txt3")
								.style("opacity", 0);
						}
					}
					saveObject.q3Name = value.value.trim();
				} else if (parent === "txt4") {
					quad1obj = d3.selectAll("#sap_viz_ext_quadrant_t-tip1");
					if (quad1obj[0].length) {
						vis.selectAll("#txt4").text(value.value.trim());
					}
					if (value.value.trim() === "") {
						vis.selectAll("#txt4").text("...");
					} else {
						object = vis.selectAll("#txt4");
						text = object[0];
						vis.selectAll("#txt4")
							.attr("x", ((width / saveObject.xpercentage) + (width - (width / saveObject.xpercentage)) / 2) - (text[0].clientWidth / 2));
						if ((width - (width / saveObject.xpercentage)) <= text[0].clientWidth) {
							vis.select("#txt4")
								.style("opacity", 0);
						}
					}
					saveObject.q4Name = value.value.trim();
				} else {
					//nothing
				}
			}
			d3.selectAll("#sap_viz_ext_quadrant_t-tip1").remove();
			parent = "";
		}
		var x = d3.scale.linear()
			.range([0, width]);
		var y = d3.scale.linear()
			.range([height, 0]);
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickFormat(textFormatter);
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickFormat(textFormatter);
		var svg = vis.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", function(d) {
				return "translate(" + margin.left + "," + margin.top + ")";
			});
		d3.selectAll("#sap_viz_ext_quadrant_t-tip1").remove();
		svg.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr('width', W)
			.attr('height', H)
			.style("opacity", 0)
			.on('click', function(d) {
				changeText();
			});
		x.domain(d3.extent(data, function(d) {
			return d.x;
		})).nice();
		y.domain(d3.extent(data, function(d) {
			return d.y;
		})).nice();
		svg.append("g")
			.attr("class", "x sap_viz_ext_quadrant_axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", function(d) {
				return "rotate(-65)";
			});
		svg.append("g")
			.attr("class", "y sap_viz_ext_quadrant_axis")
			.call(yAxis);
		var drag = d3.behavior.drag()
			.origin(function(d) {
				return d;
			})
			.on("drag", dragmove);
		if (persi === 1) {
			saveObject = {
				'q1Name': "Quadrant1",
				'q2Name': "Quadrant2",
				'q3Name': "Quadrant3",
				'q4Name': "Quadrant4",
				'xpercentage': 2,
				'ypercentage': 2
			};
			localStorage.setItem('saveObject', JSON.stringify(saveObject));
			retrievedObject = localStorage.getItem('saveObject');
		}
		var strokewidth = 2;
		var l1x1 = width / JSON.parse(retrievedObject).xpercentage,
			l1y1 = 0,
			l1x2 = width / JSON.parse(retrievedObject).xpercentage,
			l1y2 = height;
		var l2x1 = 0,
			l2y1 = height / JSON.parse(retrievedObject).ypercentage,
			l2x2 = width,
			l2y2 = height / JSON.parse(retrievedObject).ypercentage;
		var lineData = [];
		lineData.push({
			x1: l1x1,
			y1: 0,
			x2: l1x2,
			y2: height
		});
		lineData.push({
			x1: 0,
			y1: l2y1,
			x2: width,
			y2: l2y2
		});
		svg.selectAll("lines")
			.data(lineData)
			.enter()
			.append("line")
			.attr("class", "sap_viz_ext_quadrant_lines")
			.attr("x1", function(d) {
				return d.x1;
			})
			.attr("y1", function(d) {
				return d.y1;
			})
			.attr("x2", function(d) {
				return d.x2;
			})
			.attr("y2", function(d) {
				return d.y2;
			})
			.attr("stroke-width", 2)
			.on("mouseover", function(d, i) {
				d3.select(this)
					.attr("stroke-width", 10)
					.attr("stroke-opacity", 0.4);
			})
			.on("mouseout", function(d, i) {
				var x = d3.select(this);
				x.attr("stroke-width", 2)
					.attr("stroke", "#BDBDBD")
					.attr("stroke-opacity", 1);
			})
			.call(drag);
		var t_tip = new d3.isv.tooltip();
		var ltooltip = t_tip();
		svg.selectAll(".sap_viz_ext_quadrant_qdot")
			.data(data)
			.enter()
			.append("circle")
			.attr("class", "sap_viz_ext_quadrant_qdot")
			.attr("r", 10)
			.attr("cx", function(d) {
				return x(d.x);
			})
			.attr("cy", function(d) {
				return y(d.y);
			})
			.style("fill", function(d) {
				return color(d.color);
			})
			.on("mouseover", function(d) {
				var obj = d;
				ltooltip.visibility("block");
				var ltt = ltooltip;
				var matrix = this.getScreenCTM()
					.translate(+this.getAttribute("x"), +this.getAttribute("y"));
				var leftPos = (window.pageXOffset + matrix.e);
				var classed = "";
				ltooltip.orientation(classed);
				var item_data = "<div class='sap_viz_ext_quadrant_qtt-item sap_viz_ext_quadrant_qtt-comboplot'>" + obj.color + "</div>";
				item_data += "<div class='sap_viz_ext_quadrant_qtt-item'>";
				item_data = item_data + "<span class='sap_viz_ext_quadrant_qtt-item-name'>" + ms1 + "</span>";
				item_data = item_data + "<span class='sap_viz_ext_quadrant_qtt-item-price'>" + obj.x + "</span></div>";
				item_data += "<div class='qtt-item'>";
				item_data = item_data + "<span class='sap_viz_ext_quadrant_qtt-item-name'>" + ms2 + "</span>";
				item_data = item_data + "<span class='sap_viz_ext_quadrant_qtt-item-price'>" + obj.y + "</span></div>";
				ltooltip.fillData(item_data);
				ltooltip.move([(window.pageYOffset + matrix.f - 10 + y(d.y)) + "px", (leftPos + 10 + x(d.x)) + "px"]);
			})
			.on("mouseout", function(d) {
				ltooltip.visibility("none");
			});

		var charLength = 37;
		svg.append("text")
			.attr("id", "txt1")
			.text(saveObject.q1Name)
			.attr("x", (l1x1 / 2) - charLength)
			.attr("y", (l2y1 / 2))
			.style("font-family", "HelveticaNeue")
			.style("font-size", 18)
			.style("opacity", function(d) {
				if (l1x1 <= 75) {
					return 0;
				} else {
					return 1;
				}
			})
			.attr("fill", "#666666")
			.on("click", function(d) {
				if (parent !== "") {
					changeText();
				}
				var obj = d3.select(this);
				var text = obj[0];
				text[0].innerHTML = "";
				parent = "txt1";
				var matrix = this.getScreenCTM()
					.translate(+this.getAttribute("x"), +this.getAttribute("y"));
				var tt = d3.select("body")
					.append("div")
					.attr("id", "sap_viz_ext_quadrant_t-tip1")
					.style("display", "block")
					.style("top", function(d) {
						return ((window.pageYOffset + matrix.f) - margin.top) + "px";
					})
					.style("left", (window.pageXOffset + matrix.e) - (margin.left / 2) + "px");
				var tooltip1 = tt.append("div").attr("id", "tt-body").attr("contenteditable", true).append("input").attr("id", "sap_viz_ext_quadrant_txtf").attr("value",
					saveObject.q1Name);
				$("#sap_viz_ext_quadrant_txtf").focus();
			});

		svg.append("text")
			.attr("id", "txt2")
			.text(saveObject.q2Name)
			.attr("x", (l1x1 + (width - l1x1) / 2) - charLength)
			.attr("y", (l2y1 / 2))
			.style("font-family", "HelveticaNeue")
			.style("font-size", 18)
			.style("opacity", function(d) {
				if (l1x1 >= width - 75) {
					return 0;
				} else {
					return 1;
				}
			})
			.attr("fill", "#666666")
			.on("click", function(d) {
				if (parent !== "") {
					changeText();
				}

				var obj = d3.select(this);
				var text = obj[0];
				text[0].innerHTML = "";
				parent = "txt2";
				var matrix = this.getScreenCTM()
					.translate(+this.getAttribute("x"), +this.getAttribute("y"));
				var tt = d3.select("body")
					.append("div")
					.attr("id", "sap_viz_ext_quadrant_t-tip1")
					.style("display", "block")
					.style("top", function(d) {
						return ((window.pageYOffset + matrix.f) - margin.top) + "px";
					})
					.style("left", (window.pageXOffset + matrix.e) - (margin.left / 2) + "px");
				var tooltip1 = tt.append("div").attr("id", "tt-body").attr("contenteditable", true).append("input").attr("id", "sap_viz_ext_quadrant_txtf").attr("value",
					saveObject.q2Name);
				$("#sap_viz_ext_quadrant_txtf").focus();
			});

		svg.append("text")
			.attr("id", "txt3")
			.text(saveObject.q3Name)
			.attr("x", (l1x1 / 2) - charLength)
			.attr("y", (l2y1 + (height - l2y1) / 2))
			.style("font-family", "HelveticaNeue")
			.style("font-size", 18)
			.style("opacity", function(d) {
				if (l1x1 <= 75) {
					return 0;
				} else {
					return 1;
				}
			})
			.attr("fill", "#666666")
			.on("click", function(d) {
				if (parent !== "") {
					changeText();
				}
				var obj = d3.select(this);
				var text = obj[0];
				text[0].innerHTML = "";
				parent = "txt3";
				var matrix = this.getScreenCTM()
					.translate(+this.getAttribute("x"), +this.getAttribute("y"));
				var tt = d3.select("body")
					.append("div")
					.attr("id", "sap_viz_ext_quadrant_t-tip1")
					.style("display", "block")
					.style("top", function(d) {
						return ((window.pageYOffset + matrix.f) - margin.top) + "px";
					})
					.style("left", (window.pageXOffset + matrix.e) - (margin.left / 2) + "px");

				var tooltip1 = tt.append("div").attr("id", "tt-body").attr("contenteditable", true).append("input").attr("id", "sap_viz_ext_quadrant_txtf").attr("value",
					saveObject.q3Name);
				$("#sap_viz_ext_quadrant_txtf").focus();
			});

		svg.append("text")
			.attr("id", "txt4")
			.text(saveObject.q4Name)
			.attr("x", (l1x1 + (width - l1x1) / 2) - charLength)
			.attr("y", (l2y1 + (height - l2y1) / 2))
			.style("font-family", "HelveticaNeue")
			.style("font-size", 18)
			.style("opacity", function(d) {

				if (l1x1 >= width - 75) {
					return 0;
				} else {
					return 1;
				}
			})
			.attr("fill", "#666666")
			.on("click", function(d) {
				if (parent !== "") {
					changeText();
				}
				var obj = d3.select(this);
				var text = obj[0];
				text[0].innerHTML = "";
				parent = "txt4";
				var matrix = this.getScreenCTM()
					.translate(+this.getAttribute("x"), +this.getAttribute("y"));
				var tt = d3.select("body")
					.append("div")
					.attr("id", "sap_viz_ext_quadrant_t-tip1")
					.style("display", "block")
					.style("top", function(d) {
						return ((window.pageYOffset + matrix.f) - margin.top) + "px";
					})
					.style("left", (window.pageXOffset + matrix.e) - (margin.left / 2) + "px");
				var tooltip1 = tt.append("div").attr("id", "tt-body").attr("contenteditable", true).append("input").attr("id", "sap_viz_ext_quadrant_txtf").attr("value",
					saveObject.q4Name);
				$("#sap_viz_ext_quadrant_txtf").focus();
			});

		d3.selectAll(".sap_viz_ext_quadrant_lines").on("DOMNodeRemovedFromDocument", function() {
			persi = 0;
			localStorage.setItem('saveObject', JSON.stringify(saveObject));
			retrievedObject = localStorage.getItem('saveObject');
			d3.selectAll("#sap_viz_ext_quadrant_t-tip1").remove();
		});
		var oxul = 1,
			oxur = 1,
			oxll = 1,
			oxlr = 1;
		var oyul = 1,
			oyur = 1,
			oyll = 1,
			oylr = 1;

		function dragmove(d) {
			if (parent !== "") {
				changeText();
			}
			var initialX1 = this.getAttribute("x1"),
				initialY1 = this.getAttribute("y1"),
				initialX2 = this.getAttribute("x2"),
				initialY2 = this.getAttribute("y2");
			if (initialX1 === initialX2) {
				d3.select(this)
					.attr("x1", Math.max(strokewidth, Math.min(width - strokewidth, (+initialX1 + d3.event.dx))))
					.attr("y1", 0)
					.attr("x2", Math.max(strokewidth, Math.min(width - strokewidth, (+initialX2 + d3.event.dx))))
					.attr("y2", height)
					.attr("stroke-width", 2)
					.attr("stroke", "#BDBDBD");
				saveObject.xpercentage = width / Math.max(strokewidth, Math.min(width - strokewidth, (+initialX1 + d3.event.dx)));
				var obj = svg.selectAll("#txt1");
				var text = obj[0];
				svg.selectAll("#txt1")
					.attr("x", ((width / saveObject.xpercentage) / 2) - (text[0].clientWidth / 2));
				if ((width / saveObject.xpercentage) <= text[0].clientWidth) {
					svg.select("#txt1")
						.style("opacity", 0);
					oxul = 0;
				} else {
					if (oyul === 1) {
						svg.select("#txt1")
							.style("opacity", 1);
					}
					oxul = 1;
				}
				obj = svg.selectAll("#txt3");
				text = obj[0];
				svg.selectAll("#txt3")
					.attr("x", ((width / saveObject.xpercentage) / 2) - (text[0].clientWidth / 2));
				if ((width / saveObject.xpercentage) <= text[0].clientWidth) {
					svg.select("#txt3")
						.style("opacity", 0);
					oxll = 0;
				} else {
					if (oyll === 1) {
						svg.select("#txt3")
							.style("opacity", 1);
					}
					oxll = 1;
				}
				obj = svg.selectAll("#txt2");
				text = obj[0];
				svg.selectAll("#txt2")
					.attr("x", ((width / saveObject.xpercentage) + (width - (width / saveObject.xpercentage)) / 2) - (text[0].clientWidth / 2));
				if ((width - (width / saveObject.xpercentage)) <= text[0].clientWidth) {
					svg.select("#txt2")
						.style("opacity", 0);
					oxur = 0;
				} else {
					if (oyur === 1) {
						svg.select("#txt2")
							.style("opacity", 1);
					}
					oxur = 1;
				}
				obj = svg.selectAll("#txt4");
				text = obj[0];
				svg.selectAll("#txt4")
					.attr("x", ((width / saveObject.xpercentage) + (width - (width / saveObject.xpercentage)) / 2) - (text[0].clientWidth / 2));
				if ((width - (width / saveObject.xpercentage)) <= text[0].clientWidth) {
					svg.select("#txt4")
						.style("opacity", 0);
					oxlr = 0;
				} else {
					if (oylr === 1) {
						svg.select("#txt4")
							.style("opacity", 1);
					}
					oxlr = 1;
				}
			} else {
				d3.select(this)
					.attr("x1", 0)
					.attr("y1", Math.max(strokewidth, Math.min(height - strokewidth, (+initialY1 + d3.event.dy))))
					.attr("x2", width)
					.attr("y2", Math.max(strokewidth, Math.min(height - strokewidth, (+initialY2 + d3.event.dy))))
					.attr("stroke-width", 2)
					.attr("stroke", "#BDBDBD");
				saveObject.ypercentage = height / Math.max(strokewidth, Math.min(height - strokewidth, (+initialY1 + d3.event.dy)));
				svg.selectAll("#txt1")
					.attr("y", ((height / saveObject.ypercentage) / 2));
				obj = svg.selectAll("#txt1");
				text = obj[0];
				if ((height / saveObject.ypercentage) <= text[0].clientHeight) {
					svg.select("#txt1")
						.style("opacity", 0);
					oyul = 0;
				} else {
					if (oxul === 1) {
						svg.select("#txt1")
							.style("opacity", 1);
					}
					oyul = 1;
				}
				svg.selectAll("#txt2")
					.attr("y", ((height / saveObject.ypercentage) / 2));
				obj = svg.selectAll("#txt2");
				text = obj[0];
				if ((height / saveObject.ypercentage) <= text[0].clientHeight) {
					svg.select("#txt2")
						.style("opacity", 0);
					oyur = 0;
				} else {
					if (oxur === 1) {
						svg.select("#txt2")
							.style("opacity", 1);
					}
					oyur = 1;
				}
				svg.selectAll("#txt3")
					.attr("y", (height / saveObject.ypercentage + (height - height / saveObject.ypercentage) / 2));
				obj = svg.selectAll("#txt3");
				text = obj[0];
				if ((height - (height / saveObject.ypercentage)) <= text[0].clientHeight) {
					svg.select("#txt3")
						.style("opacity", 0);
					oyll = 0;
				} else {
					if (oxll === 1) {
						svg.select("#txt3")
							.style("opacity", 1);
					}
					oyll = 1;
				}
				svg.select("#txt4")
					.attr("y", (height / saveObject.ypercentage + (height - height / saveObject.ypercentage) / 2));
				obj = svg.selectAll("#txt4");
				text = obj[0];
				if ((height - (height / saveObject.ypercentage)) <= text[0].clientHeight) {
					svg.select("#txt4")
						.style("opacity", 0);
					oylr = 0;
				} else {
					if (oxlr) {
						svg.select("#txt4")
							.style("opacity", 1);
					}
					oylr = 1;
				}
			}
			localStorage.setItem('saveObject', JSON.stringify(saveObject));
			retrievedObject = localStorage.getItem('saveObject');
		}

	};

	return render;
});