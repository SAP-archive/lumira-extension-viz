define("sap_viz_ext_interactivebullet-src/js/render", [], function() {

	var persistedFlag = false;
	var render = function(data, container) {
		//prepare canvas with width and height of container
		var margin = {
			top: 20,
			right: 20,
			bottom: 20,
			left: 40
		};
		var width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom,
			colorPalette = this.colorPalette();
		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

		var flag = false;
		var flagTotal = false;
		var flagDimension = false;

		if ((data.meta.measures().length) === 3) {
			flag = true;
		}
		if ((data.meta.dimensions().length) === 1) {
			flagDimension = true;
		}
		if (flagDimension) {
			if (flag) {
				var dset0 = data.meta.dimensions(0);
				var mset0 = data.meta.measures(0);
				var mset1 = data.meta.measures(1);
				var mset2 = data.meta.measures(2);

				var ds0 = dset0[0]; //metricTitle
				var ms0 = mset0[0]; //total
				var ms1 = mset1[0]; //actual
				var ms2 = mset2[0]; //target or planned
			} else if ((data.meta.measures().length) === 2) {
				dset0 = data.meta.dimensions(0);
				mset0 = data.meta.measures(0);
				mset1 = data.meta.measures(1);

				ds0 = dset0[0]; //metricTitle
				ms0 = mset0[0]; //total
				ms1 = mset1[0]; //actual
				if (ms0 !== "total") {
					flag = true;
					flagTotal = true;
				}
			}
		} else {
			if (flag) {
				mset0 = data.meta.measures(0);
				mset1 = data.meta.measures(1);
				mset2 = data.meta.measures(2);

				ms0 = mset0[0]; //total
				ms1 = mset1[0]; //actual
				ms2 = mset2[0]; //target or planned
			} else if ((data.meta.measures().length) === 2) {
				mset0 = data.meta.measures(0);
				mset1 = data.meta.measures(1);

				ms0 = mset0[0]; //total
				ms1 = mset1[0]; //actual
				if (ms0 !== ms0) {
					flag = true;
					flagTotal = true;
				}
			}
		}

		var persistedData = [];
		var numColor; // (take if from localStorage)||5;
		var t_tip = tooltipDefine();
		var tooltip = t_tip();

		// Retrieve the object from storage
		var retrievedObject = localStorage.getItem('gradientData');
		retrievedObject = JSON.parse(retrievedObject);
		update();

		d3.select('.vis').on("DOMNodeRemovedFromDocument", function() {
			if (data.meta.measures(1)[0] === "actual") {
				persistedFlag = true;
			}
			d3.selectAll("#sap_viz_ext_interactivebullet_t-tip").remove();

			var bulletCount = persistedData.length;
			var gradientData = [];

			var colorBoxes = persistedData[0].length;
			var totalWidth, widthRatio, color;
			totalWidth = parseInt(persistedData[0][0][0][0].childNodes[0].getAttribute("width"));
			for (var bullet = 0; bullet < bulletCount; bullet++) {
				var boxData = [];
				for (var box = 0; box < colorBoxes; box++) {
					widthRatio = (parseInt(persistedData[bullet][box][0][0].childNodes[0].getAttribute("width"))) / totalWidth;
					color = persistedData[bullet][box][0][0].childNodes[0].getAttribute("fill");
					var Obj = {
						"widthRatio": widthRatio,
						"color": color
					};
					boxData.push(Obj);
				}
				gradientData.push(boxData);
			}

			// Put the object into storage
			localStorage.setItem('gradientData', JSON.stringify(gradientData));
		});

		/**
		 * It is the drawing function; appends the bullet chart on a given _selection.
		 * @param {object} config - an object variable storing the specifications of the bullet chart to be drawn.
		 */
		function customBulletChart(config) {
			this.chartW = config.width || 1000;
			this.chartH = config.height || 800;
			this.objHeight = config.objHeight || 34;
			this.bulletCount = config.count || 1;
			this.flag = config.flag || 0;
			this.format = config.formatter;
			this.picker = config.picker;
			this.gradientData = config.persistedData || undefined;
			this.setColorPicker = function(customPicker) {
				this.picker = customPicker;
			};
			var that = this;
			var area = d3.select('.bulletArea').append('rect').attr('width', this.chartW).attr('height', this.chartH).attr("opacity", 0);
			area.on("click", function() {
				d3.select('.colorPicker').style("display", "none");
				that.picker.setDisplay(false);
			});
			this.draw = function(_data) {
				for (var i = 0; i < this.bulletCount; i++) {
					var bulletArea = d3.select(".bulletArea").append("g");
					this.drawBullet(_data[i], i, bulletArea);
				}
			};
			this.drawBullet = function(_dataBullet, counter, bulletArea) {
				var chartW = this.chartW;
				var chartH = this.chartH;
				var bulletCount = this.bulletCount;
				flag = this.flag;
				var format = this.format;
				var paletteFlag = false;
				this._dataBullet = _dataBullet.total;
				var objHeight = this.objHeight;
				var actualBarHeight = (.25 * objHeight);
				numColor = 5;
				var colorW = _dataBullet.total / numColor;
				var bullet, bulletLegend;
				var on_Mouse = this.onMouse;
				var out_Mouse = this.outMouse;
				var down_mouse = this.mousedown;
				var on_Click = this.onClick;
				var xScale = d3.scale.linear()
					.domain([0, _dataBullet.total])
					.range([0, (chartW - objHeight)]);
				var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom")
					.tickFormat(format);
				var yScale = d3.scale.linear()
					.domain([0, bulletCount])
					.range([0, chartH]);
				if (flagDimension) {
					d3.select(".legendArea").append("text")
						.attr("x", 0)
						.attr("y", yScale(counter) + objHeight / 2)
						.text(function() {
							return (_dataBullet.title);
						})
						.attr("width", 25)
						.attr("class", "sap_viz_ext_interactivebullet_titleLegend");
				}
				bullet = bulletArea.attr("class", "bullet")
					.attr("id", function() {
						return ("bullet" + counter);
					});
				var side = objHeight;
				if (objHeight > 50) {
					side = 50;
				}
				var plus = bullet.append('g')
					.attr('class', 'sap_viz_ext_interactivebullet_plusSymbol')
					.attr('transform', 'translate(' + (-side) + ',' + (yScale(counter) + (objHeight - side) / 2) + ')');
				plus = addSymbol(plus, side);
				bullet = bullet.attr('transform', 'translate(' + (side) + ',' + 0 + ')');
				var gradientBoxes = bullet.append('g').attr("class", "gradientBoxes");

				// totalBar            
				gradientBoxes.append("rect")
					.attr("x", 0)
					.attr("y", yScale(counter))
					.attr("width", xScale(_dataBullet.total))
					.attr("height", objHeight)
					.attr("class", "sap_viz_ext_interactivebullet_totalBar")
					.attr("id", function() {
						return ("sap_viz_ext_interactivebullet_totalBar" + counter);
					});
				if (persistedFlag === false) {
					var box = [];
					var boxCount = 0;
					for (; boxCount < numColor; boxCount++) {
						box[boxCount] = gradientBoxes.append("g").attr("class", "box" + boxCount);
					}
					boxCount = 0;
					box[boxCount].append("rect")
						.attr("x", 0)
						.attr("y", yScale(counter))
						.attr("width", xScale(colorW * 5))
						.attr("height", objHeight)
						.attr("fill", "#D6616B")
						.attr("class", "colorBar" + boxCount)
						.on("mouseover", function() {
							on_Mouse(_dataBullet, bullet, counter, this, 0);
						})
						.on("mouseout", out_Mouse)
						.on("click", function() {
							var temp = d3.selectAll("#sap_viz_ext_interactivebullet_t-tip").style("display", "none");
							d3.select('.colorPicker').style("display", "none");
							var rect = this;
							that.picker.setPosition(rect, xScale, yScale, objHeight, chartH, colorW);
						});
					box[boxCount].append("rect")
						.attr("x", xScale(colorW * 5) - 4)
						.attr("y", yScale(counter))
						.attr("width", 4)
						.attr("height", objHeight)
						.attr("id", "sap_viz_ext_interactivebullet_resizer")
						.attr("class", boxCount)
						.on("click", function() {
							d3.select('.colorPicker').style("display", "none");
						});
					boxCount++;
					box[boxCount].append("rect")
						.attr("x", 0)
						.attr("y", yScale(counter))
						.attr("width", xScale(colorW * 4))
						.attr("height", objHeight)
						.attr("fill", "#E7969C")
						.attr("class", "colorBar" + boxCount)
						.on("mouseover", function() {
							on_Mouse(_dataBullet, bullet, counter, this, 0);
						})
						.on("mouseout", out_Mouse)
						.on("click", function() {
							var temp = d3.selectAll("#sap_viz_ext_interactivebullet_t-tip").style("display", "none");
							d3.select('.colorPicker').style("display", "none");
							var rect = this;
							that.picker.setPosition(rect, xScale, yScale, objHeight, chartH, colorW);
						});
					box[boxCount].append("rect")
						.attr("x", xScale(colorW * 4) - 4)
						.attr("y", yScale(counter))
						.attr("width", 4)
						.attr("height", objHeight)
						.attr("id", "sap_viz_ext_interactivebullet_resizer")
						.attr("class", boxCount)
						.on("click", function() {
							d3.select('.colorPicker').style("display", "none");
						});
					boxCount++;
					box[boxCount].append("rect")
						.attr("x", 0)
						.attr("y", yScale(counter))
						.attr("width", xScale(colorW * 3))
						.attr("height", objHeight)
						.attr("fill", "#FDD0A2")
						.attr("class", "colorBar" + boxCount)
						.on("mouseover", function() {
							on_Mouse(_dataBullet, bullet, counter, this, 0);
						})
						.on("mouseout", out_Mouse)
						.on("click", function() {
							var temp = d3.selectAll("#sap_viz_ext_interactivebullet_t-tip").style("display", "none");
							d3.select('.colorPicker').style("display", "none");
							var rect = this;
							that.picker.setPosition(rect, xScale, yScale, objHeight, chartH, colorW);
						});
					box[boxCount].append("rect")
						.attr("x", xScale(colorW * 3) - 4)
						.attr("y", yScale(counter))
						.attr("width", 4)
						.attr("height", objHeight)
						.attr("id", "sap_viz_ext_interactivebullet_resizer")
						.attr("class", boxCount)
						.on("click", function() {
							d3.select('.colorPicker').style("display", "none");
						});
					boxCount++;
					box[boxCount].append("rect")
						.attr("x", 0)
						.attr("y", yScale(counter))
						.attr("width", xScale(colorW * 2))
						.attr("height", objHeight)
						.attr("fill", "#A1D99B")
						.attr("class", "colorBar" + boxCount)
						.on("mouseover", function() {
							on_Mouse(_dataBullet, bullet, counter, this, 0);
						})
						.on("mouseout", out_Mouse)
						.on("click", function() {
							var temp = d3.selectAll("#sap_viz_ext_interactivebullet_t-tip").style("display", "none");
							d3.select('.colorPicker').style("display", "none");
							var rect = this;
							that.picker.setPosition(rect, xScale, yScale, objHeight, chartH, colorW);
						});
					box[boxCount].append("rect")
						.attr("x", xScale(colorW * 2) - 4)
						.attr("y", yScale(counter))
						.attr("width", 4)
						.attr("height", objHeight)
						.attr("id", "sap_viz_ext_interactivebullet_resizer")
						.attr("class", boxCount)
						.on("click", function() {
							d3.select('.colorPicker').style("display", "none");
						});
					boxCount++;
					box[boxCount].append("rect")
						.attr("x", 0)
						.attr("y", yScale(counter))
						.attr("width", xScale(colorW * 1))
						.attr("height", objHeight)
						.attr("fill", "#74C476")
						.attr("class", "colorBar" + boxCount)
						.on("mouseover", function() {
							on_Mouse(_dataBullet, bullet, counter, this, 0);
						})
						.on("mouseout", out_Mouse)
						.on("click", function() {
							var temp = d3.selectAll("#sap_viz_ext_interactivebullet_t-tip").style("display", "none");
							d3.select('.colorPicker').style("display", "none");
							var rect = this;
							that.picker.setPosition(rect, xScale, yScale, objHeight, chartH, colorW);
						});
					box[boxCount].append("rect")
						.attr("x", xScale(colorW * 1) - 4)
						.attr("y", yScale(counter))
						.attr("width", 4)
						.attr("height", objHeight)
						.attr("id", "sap_viz_ext_interactivebullet_resizer")
						.attr("class", boxCount)
						.on("click", function() {
							d3.select('.colorPicker').style("display", "none");
						});
					plus.on("click", function() {
						numColor++;
						var selection = document.getElementsByClassName("bullet");
						var newBoxGroup, newBox;
						var newColorBoxes = d3.selectAll("#newColorBox");
						if (newColorBoxes[0][0] !== undefined) {
							var lastBoxCount = newColorBoxes[0].length / bulletCount - 1;
							var str = newColorBoxes[0][lastBoxCount].getAttribute("class");
							if (str.length === 9) {
								var lastElementId = parseInt(str.substring(8, 9));
							} else {
								lastElementId = parseInt(str.substring(8, 10));
							}
							if (lastElementId > 4) {
								for (var j = 0; j < newColorBoxes[0].length; j++) {
									var boxWidth = parseInt(newColorBoxes[0][j].getAttribute("width"));
									if (boxWidth <= xScale(_dataBullet.total - 4)) {
										newColorBoxes[0][j].setAttribute("width", boxWidth + 20);
										newColorBoxes[0][j].nextSibling.setAttribute("x", (boxWidth + 20 - 4));
									}
								}
							}
						}
						for (var i = 0; i < bulletCount; i++) {
							newBoxGroup = selection[i].getElementsByClassName("gradientBoxes");
							newBox = d3.select(newBoxGroup[0]).append("g").attr("class", "box" + (numColor - 1));
							newBox.append("rect")
								.attr("x", 0)
								.attr("y", yScale(i))
								.attr("width", 50)
								.attr("height", objHeight)
								.attr("fill", "rgb(" + 10 * numColor + "," + 10 * numColor + "," + 10 * numColor + ")")
								.attr("id", "newColorBox")
								.attr("class", "colorBar" + (numColor - 1))
								.on("mouseover", function() {
									on_Mouse(_dataBullet, bullet, counter, this, 0);
								})
								.on("mouseout", out_Mouse)
								.on("click", function() {
									var temp = d3.selectAll("#sap_viz_ext_interactivebullet_t-tip").style("display", "none");
									d3.select('.colorPicker').style("display", "none");
									var rect = this;
									that.picker.setPosition(rect, xScale, yScale, objHeight, chartH, colorW);
								});
							newBox.append("rect")
								.attr("x", 46)
								.attr("y", yScale(i))
								.attr("width", 4)
								.attr("height", objHeight)
								.attr("id", "sap_viz_ext_interactivebullet_resizer")
								.attr("class", (numColor - 1))
								.call(dragResize)
								.on("click", function() {
									d3.select('.colorPicker').style("display", "none");
								});
							persistedData[i][numColor - 1] = newBox;
						}
					});
				} else if (persistedFlag === true) {
					numColor = that.gradientData[0].length;
					box = [];
					var totalWidth;
					for (boxCount = 0; boxCount < numColor; boxCount++) {
						box[boxCount] = gradientBoxes.append("g").attr("class", "box" + boxCount);
						box[boxCount].append("rect")
							.attr("x", 0)
							.attr("y", yScale(counter))
							.attr("width", xScale(that.gradientData[0][boxCount].widthRatio * _dataBullet.total))
							.attr("height", objHeight)
							.attr("fill", that.gradientData[0][boxCount].color)
							.attr("class", "colorBar" + boxCount)
							.on("mouseover", function() {
								on_Mouse(_dataBullet, bullet, counter, this, 0);
							})
							.on("mouseout", out_Mouse)
							.on("click", function() {
								var temp = d3.selectAll("#sap_viz_ext_interactivebullet_t-tip").style("display", "none");
								d3.select('.colorPicker').style("display", "none");
								var rect = this;
								that.picker.setPosition(rect, xScale, yScale, objHeight, chartH, colorW);
							});
						box[boxCount].append("rect")
							.attr("x", xScale(that.gradientData[0][boxCount].widthRatio * _dataBullet.total) - 4)
							.attr("y", yScale(counter))
							.attr("width", 4)
							.attr("height", objHeight)
							.attr("id", "sap_viz_ext_interactivebullet_resizer")
							.attr("class", boxCount)
							.on("click", function() {
								d3.select('.colorPicker').style("display", "none");
							});
					}
					plus.on("click", function() {
						numColor++;
						var selection = document.getElementsByClassName("bullet");
						var newBoxGroup, newBox;

						var newColorBoxes = d3.selectAll("#newColorBox");

						if (newColorBoxes[0][0] !== undefined) {
							var lastBoxCount = newColorBoxes[0].length / bulletCount - 1;
							var str = newColorBoxes[0][lastBoxCount].getAttribute("class");
							if (str.length === 9) {
								var lastElementId = parseInt(str.substring(8, 9));
							} else {
								lastElementId = parseInt(str.substring(8, 10));
							}
							if (lastElementId > 4) {
								for (var j = 0; j < newColorBoxes[0].length; j++) {
									var boxWidth = parseInt(newColorBoxes[0][j].getAttribute("width"));
									if (boxWidth <= xScale(_dataBullet.total - 4)) {
										newColorBoxes[0][j].setAttribute("width", boxWidth + 20);
										newColorBoxes[0][j].nextSibling.setAttribute("x", (boxWidth + 20 - 4));
									}
								}
							}
						}
						for (var i = 0; i < bulletCount; i++) {
							newBoxGroup = selection[i].getElementsByClassName("gradientBoxes");
							newBox = d3.select(newBoxGroup[0]).append("g").attr("class", "box" + (numColor - 1));
							newBox.append("rect")
								.attr("x", 0)
								.attr("y", yScale(i))
								.attr("width", 50)
								.attr("height", objHeight)
								.attr("fill", "rgb(" + 10 * numColor + "," + 10 * numColor + "," + 10 * numColor + ")")
								.attr("id", "newColorBox")
								.attr("class", "colorBar" + (numColor - 1))
								.on("mouseover", function() {
									on_Mouse(_dataBullet, bullet, counter, this, 0);
								})
								.on("mouseout", out_Mouse)
								.on("click", function() {
									var temp = d3.selectAll("#sap_viz_ext_interactivebullet_t-tip").style("display", "none");
									d3.select('.colorPicker').style("display", "none");
									var rect = this;
									that.picker.setPosition(rect, xScale, yScale, objHeight, chartH, colorW);
								});
							newBox.append("rect")
								.attr("x", 46)
								.attr("y", yScale(i))
								.attr("width", 4)
								.attr("height", objHeight)
								.attr("id", "sap_viz_ext_interactivebullet_resizer")
								.attr("class", (numColor - 1))
								.call(dragResize)
								.on("click", function() {
									d3.select('.colorPicker').style("display", "none");
								});
							persistedData[i][numColor - 1] = newBox;
						}
					});
				}
				persistedData[counter] = box;

				// actualBar            
				bullet.append("rect")
					.attr("x", 0)
					.attr("y", (yScale(counter) + objHeight / 2 - actualBarHeight / 2))
					.attr("width", xScale(_dataBullet.actual))
					.attr("height", actualBarHeight)
					.attr("class", "sap_viz_ext_interactivebullet_actualBar")
					.on("mouseover", function() {
						var tooltipOffset = actualBarHeight / 2 - objHeight / 2;
						on_Mouse(_dataBullet, bullet, counter, this, tooltipOffset);
					})
					.on("mouseout", out_Mouse)
					.on("click", function() {
						d3.select('.colorPicker').style("display", "none");
					});

				// plannedBar            
				if (flag) {
					bullet.append("rect")
						.attr("x", xScale(_dataBullet.planned) - 2)
						.attr("y", yScale(counter))
						.attr("width", 4)
						.attr("height", objHeight)
						.attr("class", "sap_viz_ext_interactivebullet_plannedBar")
						.on("mouseover", function() {
							var tooltipOffset = actualBarHeight / 2 - objHeight / 2;
							on_Mouse(_dataBullet, bullet, counter, this, tooltipOffset);
						})
						.on("mouseout", out_Mouse)
						.on("click", function() {
							d3.select('.colorPicker').style("display", "none");
						});
				}
				bullet.append("g").attr("class", "sap_viz_ext_interactivebullet_xAxis")
					.attr("transform", "translate(" + 0 + "," + (yScale(counter) + objHeight) + ")")
					.call(xAxis);
				var resizer = d3.selectAll('#sap_viz_ext_interactivebullet_resizer');
				var dragResize = d3.behavior.drag()
					.on("drag", this.drag)
					.on("dragstart", function() {
						that.picker.setDisplay(true);
					})
					.on("dragend", function() {
						that.picker.setDisplay(false);
					});
				resizer.call(dragResize);
			};
			this.onMouse = function(_dataBullet, _selection, counter, this1, tooltipOffset) {
				var chartW = that.chartW;
				var chartH = that.chartH;
				var bulletCount = that.bulletCount;
				var objHeight = that.objHeight;
				var actualBarHeight = (.25 * objHeight);
				var xScale = d3.scale.linear()
					.domain([0, _dataBullet.total])
					.range([0, (chartW - objHeight)]);
				var yScale = d3.scale.linear()
					.domain([0, bulletCount])
					.range([0, chartH]);
				var abc = d3.select(function() {
					return ("#bullet" + counter);
				});
				if (this1.getAttribute("class") === "sap_viz_ext_interactivebullet_actualBar" || this1.getAttribute("class") === "sap_viz_ext_interactivebullet_plannedBar") {
					event.currentTarget.parentNode.childNodes[2].setAttribute("filter", "url(#dropshadow1)");
				} else {
					event.currentTarget.parentNode.parentNode.parentNode.childNodes[2].setAttribute("filter", "url(#dropshadow1)");
				}
				var classed = "bottom";
				if (!that.picker.getDisplay()) {
					tooltip.visibility("block");
				}
				var matrix = this1.getScreenCTM().translate(+this1.getAttribute("x"), +this1.getAttribute("y"));
				var tt_width = tooltipDimension()[0];
				var tt_height = tooltipDimension()[1];
				var leftPos, topPos;
				var arrowH = 3;
				topPos = (window.pageYOffset + matrix.f - tt_height + tooltipOffset);
				leftPos = event.clientX;
				if (event.clientX > xScale(_dataBullet.total)) {
					leftPos = leftPos - 160;
				}
				if (counter === 0) {
					classed = "top";
					topPos = topPos + objHeight + tt_height;
					if (flag) {
						topPos = topPos + 20;
					}
				}
				var tt_data;
				if (flagDimension) {
					tt_data = "<div class='sap_viz_ext_interactivebullet_tt-item sap_viz_ext_interactivebullet_tt-combo'>" + (_dataBullet.title) + "</div>";
				} else {
					tt_data = "<div class='sap_viz_ext_interactivebullet_tt-item sap_viz_ext_interactivebullet_tt-combo'>" + " " + "</div>";
				}
				tt_data = tt_data + "<div class='sap_viz_ext_interactivebullet_tt-item tt-bag-val'> "+ [ms1] +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
				tt_data = tt_data + "<span class='sap_viz_ext_interactivebullet_tt-item-price'>" + _dataBullet.actual + "</span></div>";
				if (flag) {
					tt_data = tt_data + "<div class='sap_viz_ext_interactivebullet_tt-item tt-bag-val'> "+ [ms2];
					tt_data = tt_data + "<span class='sap_viz_ext_interactivebullet_tt-item-price'>" + _dataBullet.planned + "</span></div>";
					topPos = topPos - 20;
				}
				if (!flagTotal) {
					tt_data = tt_data + "<div class='sap_viz_ext_interactivebullet_tt-item tt-bag-val'> " + [ms0] ;
					tt_data = tt_data + "<span class='sap_viz_ext_interactivebullet_tt-item-price'>" + _dataBullet.total + "</span></div>";
					topPos = topPos - 20;
				}
				tooltip.move([topPos + "px", leftPos + "px"]);
				tooltip.orientation(classed);
				tooltip.fillData(tt_data);
			};
			this.outMouse = function() {
				if (this.getAttribute("class") === "sap_viz_ext_interactivebullet_actualBar" || this.getAttribute("class") === "sap_viz_ext_interactivebullet_plannedBar") {
					event.currentTarget.parentNode.childNodes[2].setAttribute("filter", "");
				} else {
					event.currentTarget.parentNode.parentNode.parentNode.childNodes[2].setAttribute("filter", "");
				}
				d3.selectAll(".highlighted").remove();
				d3.selectAll("#sap_viz_ext_interactivebullet_t-tip").style("display", "none");
			};
			this.drag = function() {
				var x = d3.mouse(this.parentNode.childNodes[0])[0];
				if (this.getAttribute('x') !== 0) {
					var resizerId = parseInt(this.getAttribute("class"));
					var totalBar = this.parentNode.parentNode.childNodes[0];
					var max = totalBar.getAttribute("width");
					x = Math.min(max, x);
					x = Math.max(0, x);
					var elements = document.getElementsByClassName("box" + resizerId);
					var resizers = document.getElementsByClassName(resizerId);
					x = Math.max(0, x);
					for (var i = 0; i < elements.length; i++) {
						elements[i].childNodes[0].setAttribute('width', x + 'px');
						resizers[i].setAttribute('x', x + 'px');
					}
				}
			};
		}
		//It is the 'main' function which calls the 'customBulletChart' function.
		function update() {
			var dataset = [];
			if (flagDimension) {
				if (flag && !flagTotal) {
					var fdata = data.map(function(d) {
						dataset.push({
							"title": d[ds0],
							"total": d[ms0],
							"actual": d[ms1],
							"planned": d[ms2]
						});
					});
				} else {
					if (flagTotal) {
						var fdata = data.map(function(d) {
							var temp;
							if (d[ms0] > d[ms1]) {
								temp = d[ms0];
							} else {
								temp = d[ms1];
							}
							dataset.push({
								"title": d[ds0],
								"total": temp,
								"actual": d[ms0],
								"planned": d[ms1]
							});
						});
					} else {
						fdata = data.map(function(d) {
							dataset.push({
								"title": d[ds0],
								"total": d[ms0],
								"actual": d[ms1]
							});
						});
					}
				}
			} else {
				if (flag && !flagTotal) {
					var fdata = data.map(function(d) {
						dataset.push({
							"total": d[ms0],
							"actual": d[ms1],
							"planned": d[ms2]
						});
					});
				} else {
					if (flagTotal) {
						var fdata = data.map(function(d) {
							var temp;
							if (d[ms0] > d[ms1]) {
								temp = d[ms0];
							} else {
								temp = d[ms1];
							}
							dataset.push({
								"total": temp,
								"actual": d[ms0],
								"planned": d[ms1]
							});
						});
					} else {
						var fdata = data.map(function(d) {
							dataset.push({
								"total": d[ms0],
								"actual": d[ms1]
							});
						});
					}
				}
			}
			var MARGIN = {
				top: 50,
				left: 50,
				right: 60
			};
			var bulletCount = dataset.length;
			var padding = bulletCount * 1.5;
			var legendPad = 75;
			var chartW = (width - MARGIN.left - MARGIN.right - legendPad);
			var chartH = height - MARGIN.top;
			var objHeight = chartH / (bulletCount + padding);
			if (objHeight > 60) {
				objHeight = 60;
			}
			var legendArea = vis.append("svg").attr("width", legendPad).attr("height", chartH).append("g").attr("class", "legendArea").attr(
				"transform", "translate(" + 0 + "," + 0 + ")");
			var bulletArea = vis.append("svg").attr("width", chartW + MARGIN.left + MARGIN.right).attr("height", chartH).append("g").attr("class",
				"bulletArea").attr("transform", "translate(" + legendPad + "," + 0 + ")");
			var config = {
				"width": chartW,
				"height": chartH,
				"objHeight": objHeight,
				"count": bulletCount,
				"flag": flag,
				"formatter": textFormatter,
				"persistedData": retrievedObject
			};
			var chartInstance = new customBulletChart(config);
			var bulletGraph = chartInstance.draw(dataset);
			var picker = new ColorPicker(colorPalette);
			chartInstance.setColorPicker(picker);
			var defs = vis.append('defs');
			var filter = defs.append("filter").attr("id", "dropshadow1");
			filter.append("feGaussianBlur")
				.attr("in", "SourceAlpha")
				.attr("stdDeviation", .5)
				.attr("result", "blur");
			filter.append("feOffset")
				.attr("in", "blur")
				.attr("dx", 1)
				.attr("dy", 1)
				.attr("result", "offsetBlur");
			filter.append("feFlood")
				.attr("flood-color", "#FFFFFF")
				.attr("flood-opacity", 1)
				.attr("result", "offsetColor");
			filter.append("feComposite")
				.attr("in", "offsetColor")
				.attr("in2", "offsetBlur")
				.attr("operator", "in")
				.attr("result", "offsetBlur");
			var feMerge = filter.append("feMerge");
			feMerge.append("feMergeNode")
				.attr("in", "offsetBlur");
			feMerge.append("feMergeNode")
				.attr("in", "SourceGraphic");
			filter = defs.append("filter").attr("id", "dropshadow2");
			filter.append("feGaussianBlur")
				.attr("in", "SourceAlpha")
				.attr("stdDeviation", .1)
				.attr("result", "blur");
			filter.append("feOffset")
				.attr("in", "blur")
				.attr("dx", 2)
				.attr("dy", 2)
				.attr("result", "offsetBlur");
			filter.append("feFlood")
				.attr("flood-color", "#FFFFFF")
				.attr("flood-opacity", 3)
				.attr("result", "offsetColor");
			filter.append("feComposite")
				.attr("in", "offsetColor")
				.attr("in2", "offsetBlur")
				.attr("operator", "in")
				.attr("result", "offsetBlur");
			feMerge = filter.append("feMerge");
			feMerge.append("feMergeNode")
				.attr("in", "offsetBlur");
			feMerge.append("feMergeNode")
				.attr("in", "SourceGraphic");
		}

		//It defines tooltip which is to be rendered on 'mouseover' event.
		function tooltipDefine() {
			var tooltip_width = "auto", // default width
				tooltip_height = "auto",
				html = "tooltip",
				classed = "left",
				x = 10,
				y = 10,
				position = [x, y],
				disp = "none";

			function tooltip_interactive() {
				// generate tooltip here, using `width` and `height`
				var tt = d3.select("body").append("div").attr("id", "sap_viz_ext_interactivebullet_t-tip").style("display", disp);
				var tooltip_interactive = tt.append("div").attr("class", "sap_viz_ext_interactivebullet_tt-inner").style("text-align", "left");
				tooltip_interactive.append("div").attr("id", "sap_viz_ext_interactivebullet_triangle").attr("class", classed);
				tooltip_interactive.append("div").attr("id", "tt-body");
				tooltip_interactive.visibility = function(value) {
					d3.selectAll("#sap_viz_ext_interactivebullet_t-tip").style("display", value);
				};
				tooltip_interactive.orientation = function(value) {
					d3.selectAll("#sap_viz_ext_interactivebullet_t-tip #sap_viz_ext_interactivebullet_triangle").attr("class", value);
				};
				tooltip_interactive.move = function(value) {
					d3.selectAll("#sap_viz_ext_interactivebullet_t-tip").style("top", value[0]).style("left", value[1]);
				};
				tooltip_interactive.fillData = function(value) {
					d3.selectAll("#sap_viz_ext_interactivebullet_t-tip #tt-body").html(value);
				};
				return tooltip_interactive;
			}
			tooltipDefine.width = function(value) {
				if (!arguments.length) {
					return tooltip_width;
				}
				tooltip_width = value;
				return tooltip_interactive;
			};
			tooltipDefine.height = function(value) {
				if (!arguments.length) {
					return tooltip_height;
				}
				tooltip_height = value;
				return tooltip_interactive;
			};
			return tooltip_interactive;
		}

		//It returns dimensions of the tooltip which to be rendered on 'mouseover' event.
		function tooltipDimension() {
			var tt_width = 180;
			var tt_height = 20 * 3 + 10; //lineheight inside tooltip = 20px;
			var tt_dim = [tt_width, tt_height];
			return (tt_dim);
		}

		//It appends a +(plus) symbol at the _selection.
		//@param {object} _selection - a selection on which symbols needs to be added.
		//@param {int} height - an integer variable giving height .
		function addSymbol(_selection, height_interactive) {

			_selection.append('circle').attr('cx', 0.5 * height_interactive)
				.attr('cy', 0.5 * height_interactive)
				.attr('r', 0.20 * height_interactive)
				.attr("fill", "#434C4C")
				.on("mouseover", function() {
					this.setAttribute("fill", "#0066CC");
				})
				.on("mouseout", function() {
					this.setAttribute("fill", "#434C4C");
				});

			_selection.append('line')
				.attr('x1', 0.5 * height_interactive)
				.attr('y1', 0.38 * height_interactive)
				.attr('x2', 0.5 * height_interactive)
				.attr('y2', 0.62 * height_interactive);

			_selection.append('line')
				.attr('x1', 0.38 * height_interactive)
				.attr('y1', 0.5 * height_interactive)
				.attr('x2', 0.62 * height_interactive)
				.attr('y2', 0.5 * height_interactive);
			return (_selection);
		}
		/**
		 * It gives a color picker to change the color of bars.
		 * @param {object} colorScale - a color pallete can be given to the colorpicker.
		 */
		function ColorPicker(colorScale) {
			var self = this;
			var rainbow = ["#FFD300", "#FFFF00", "#A2F300", "#00DB00", "#00B7FF", "#1449C4", "#4117C7", "#820AC3", "#DB007C", "#FF0000", "#FF7400",
				"#FFAA00"
			];
			colorScale = colorScale || rainbow;
			self.rect = this;
			var color = function(i) {
				return colorScale[i];
			};
			var clicked = function() {
				self.picked(self.pickedColor);
			};
			self.display = false;
			self.getDisplay = function() {
				return (self.display);
			};
			self.setDisplay = function(value) {
				self.display = value;
			};
			var pie = d3.layout.pie().sort(null);
			var arc = d3.svg.arc().innerRadius(15).outerRadius(60);
			var svg = d3.select(".bulletArea")
				.append("g")
				.attr("class", "colorPicker")
				.style("display", "none");
			var plate = svg.append("circle")
				.attr("fill", "#FFD300")
				.attr("stroke", "#fff")
				.attr("stroke-width", 4)
				.attr("r", 15)
				.attr("cx", 0)
				.attr("cy", 0)
				.on("click", clicked);
			var colors = [];
			for (var i = 0; i < 61; i++) {
				colors[i] = 1;
			}
			svg.datum(colors)
				.selectAll("path")
				.data(pie)
				.enter()
				.append("path")
				.attr("fill", function(d, a) {
					return color(a);
				})
				.attr("stroke", "#fff")
				.attr("stroke-width", 0)
				.attr("d", arc)
				.on("mouseover", function() {
					var fill = d3.select(this).attr("fill");
					self.pickedColor = fill;
					plate.attr("fill", fill);
				})
				.on("click", clicked);
			self.setPosition = function(obj, xScale, yScale, objHeight, chartH, colorW) {
				var str = obj.getAttribute("class");
				if (str.length === 9) {
					self.colorBoxId = parseInt(str.substring(8, 9));
				} else {
					self.colorBoxId = parseInt(str.substring(8, 10));
				}
				var colorPicker = d3.select('.colorPicker').style("display", "block");
				self.setDisplay(true);
				var defaultColor = obj.getAttribute("fill");
				self.rect = obj;
				var object = obj.parentNode.childNodes[1];
				var offset = objHeight;
				if (objHeight > 50) {
					offset = 50;
				}
				var xPos = (parseInt(object.getAttribute("x")) - xScale(colorW) / 2 + offset);
				var yPos = (parseInt(object.getAttribute("y")) + objHeight + 60);
				if ((yPos + 55) > chartH) {
					yPos = yPos - objHeight - 112;
				}
				colorPicker.attr("transform", "translate(" + xPos + "," + (yPos) + ")");
			};
			self.picked = function(fill) {
				var elements = document.getElementsByClassName("colorBar" + self.colorBoxId);
				for (i = 0; i < elements.length; i++) {
					elements[i].setAttribute("fill", fill);
				}
				d3.select('.colorPicker').style("display", "none");
				self.setDisplay(false);
			};
		}

		function placeTextWithEllipsis(textObj, textString, width) {
			textObj.textContent = textString;
			//ellipsis is needed
			if (textObj.getSubStringLength(0, textString.length) >= width) {
				for (var x = textString.length - 3; x > 0; x -= 3) {
					if (textObj.getSubStringLength(0, x) <= width) {
						textObj.textContent = textString.substring(0, x) + "...";
						return;
					}
				}
				textObj.textContent = "..."; //can't place at all
			}
			return (textObj);
		}
		/**
		 * It is the formatter function; formats the center values of the rectObjects in column chart if the values are too large to print.
		 * @param {Object} d - data set is passed in
		 */
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
	};

	return render;
});