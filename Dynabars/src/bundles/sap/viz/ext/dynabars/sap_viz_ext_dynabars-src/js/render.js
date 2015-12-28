define("sap_viz_ext_dynabars-src/js/render", [], function() {

	var render = function(data, container) {
		var margin = {
			top: 60,
			right: 20,
			bottom: 40,
			left: 5
		};

		//prepare canvas with width and height of container
		var width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom;
		container.selectAll('svg').remove();
		var vis = container.append('svg').attr("width", width + margin.right)
			.attr("height", (height + margin.top + margin.bottom + 10))
			.append("g")
			.attr("transform", "translate(" + (margin.left + margin.right) + "," + (margin.right + margin.top) + ")");

		var defs = container.append('defs');
		defs.append('linearGradient')
			.attr('x1', "0%").attr('y1', "0%").attr('x2', "0%").attr('y2', "100%")
			.attr('id', 'gradient').call(function(gradient) {
				gradient.append('stop').attr('offset', '0%').attr('style', 'stop-color:#e4e4e4;stop-opacity:1');
				gradient.append('stop').attr('offset', '15%').attr('style', 'stop-color: #f6f6f6;stop-opacity:1');
			});

		var dsets = data.meta.dimensions(),
			msets = data.meta.measures();

		var mset1 = data.meta.measures(0);
		var dset1 = data.meta.dimensions(0);
		var dset2 = data.meta.dimensions(1);

		var sliderValue = 1;
		var ms1 = mset1[0];
		var ds1 = dset1[0];
		var ds2 = dset2[0];
		var Tooltip;
		var datelist = [];
		var numberOfCities = 0;
		var dataset1 = [];
		var Cities = [];
		var fdata = data.map(function(d) {
			var val = parseFloat(d[ms1]);
			var obj = {};
			if (d[ms1] == null) {
				val = 0;
			}
			obj.Cases = val;
			obj.City = d[ds2];
			obj.Year = d[ds1];
			if (datelist.indexOf(d[ds1]) === -1) {
				datelist.push(d[ds1]);
			}
			if (Cities.indexOf(d[ds2]) === -1) {
				Cities.push(d[ds2]);
			}
			return (obj);
		});

		var myVar;
		var paused;
		var datesLength;
		var firstStateData1 = [];

		var printDatesIndex = [];
		var controlContainer = container.append('svg').attr("height", height).attr("width", width)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + (margin.top - margin.bottom) + ")");

		var sliderControl = container.append('svg').attr("width", width)
			.attr("height", height).attr("class", "sap_viz_ext_dynabars_slider")
			.append("g");
		var dateText = container.append('svg').attr("width", width)
			.attr("height", height).attr("class", "dateText")
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + (margin.top - margin.bottom) + ")");
		var svg = vis;
		var sliderset1 = sliderset();
		var DateGranularitySliderConfig = {
			measure: "claim",
			dimension: "label",
			filterset: sliderset1,
			filterVal: "Transition",
			width: 0.439 * width,
			height: 0.1210 * height,
			sliderwidth: 0.185 * width,
			sliderAxisheight: 26,
			sliderheight: 46,
			sliderYcoordinate: 16,
			thumbRadius: 7,
			initialOpacity: 1,
			transitionOpacity: 0.6,
			SliderLeftposition: 170,
			strokeColor: "#f39200"
		};
		var DateGranularitySlider = new Slider(DateGranularitySliderConfig);
		DateGranularitySlider.makeslider(null, null);

		function Slider(config) {
			/* Set default properties of slider */
			var sliderProperties = {
				dataset: [],
				sliderwidth: 336,
				filterset: [],
				itemwidth: 46,
				chart: null
			};
			this.config = config;

			var measure = config.measure,
				dimension = config.dimension;

			/* Filters dataset based on current position of slider, and passes filtered dataset to update function.
			 * @param {number} val
			 */
			sliderValue = 1;
			var filterrun = function(val) {
				sliderValue = sliderProperties.filterset[val];
			};

			// Function to remove Null values from Filterset
			// @return {Array} arr
			function removeNull() {
				var arr = [],
					j = 0;
				for (var i = 0; i < sliderProperties.filterset.length; i++) {
					if (sliderProperties.filterset[i] !== "null") {
						arr[j] = sliderProperties.filterset[i];
						j++;
					}
				}
				return arr;
			}
			// Function called when the onDrag event is triggered.
			// 	 * @param {Element} d
			this.dragMove = function(d) {
				d.x = Math.max(0, Math.min(sliderProperties.sliderwidth, d3.event.x));
				var sel = d3.select(this)
					.attr("transform", "translate(" + d.x + "," + 13 + ")");
				var flr = (Math.round(d.x / sliderProperties.itemwidth));
				if ((config.filterset[flr]) < 100) {
					container.selectAll(".thumbtext_duration").text(config.filterset[flr]).attr("x", function() {
						if (config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99) {
							return 10;
						}
						if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999) {
							return 12;
						} else {
							return 14;
						}
					});
				} else {
					container.selectAll(".thumbtext_duration").text(config.filterset[flr]).attr("x", function() {
						if (config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99) {
							return 6;
						}
						if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999) {
							return 8;
						} else {
							return 10;
						}
					});
				}
				filterrun(flr);
			};

			//  Called when the drag event stops.
			// Sets opacity of the slider thumb back to 1
			this.dragEnd = function(d) {
				var x1 = d.x;
				d.y = 13;
				var y1 = d.y;
				x1 = (Math.round(x1 / sliderProperties.itemwidth)) * sliderProperties.itemwidth;
				d3.select(this)
					.attr("opacity", sliderProperties.initialOpacity)
					.attr("transform", "translate(" + (x1 - 16) + "," + y1 + ")");
				d.x = x1 - 16;
			};

			//Set various slider properties and render the slider
			//@param {Object} dataset
			//@param {Object} chart
			this.makeslider = function(dataset, chart) {
				sliderProperties.sliderwidth = this.config.sliderwidth || 280;
				sliderProperties.sliderheight = this.config.sliderheight || 50;
				sliderProperties.sliderAxisheight = this.config.sliderAxisheight || 5;
				sliderProperties.sliderYcoordinate = this.config.sliderYcoordinate || 30;
				sliderProperties.thumbRadius = this.config.thumbRadius || 12;
				sliderProperties.dataset = dataset;
				sliderProperties.chart = chart;
				sliderProperties.filterset = this.config.filterset;
				sliderProperties.filterset = removeNull();
				sliderProperties.filterVal = this.config.filterVal;
				sliderProperties.itemwidth = (sliderProperties.sliderwidth) / (sliderProperties.filterset.length - 1);
				sliderProperties.initialOpacity = this.config.initialOpacity || 1;
				sliderProperties.transitionOpacity = this.config.transitionOpacity || 0.6;

				var slidergroup = sliderControl.append('g').attr("class", "sap_viz_ext_dynabars_slider").attr("transform", "translate(" + (this.config.SliderLeftposition) +
					",0)");

				var drag = d3.behavior.drag()
					.origin(Object)
					.on("drag", this.dragMove)
					.on('dragend', this.dragEnd);

				var g = slidergroup.selectAll('g .slider')
					.data([{
						x: -16,
						y: 20
					}])
					.enter()
					.append('g')
					.attr("height", sliderProperties.sliderheight)
					.attr("width", sliderProperties.sliderwidth)
					.attr("class", "sap_viz_ext_dynabars_slider");
				setElements(g, drag);
			};

			//Set elements of the Slider like thumb and slider axis
			// @param {element} g
			// @param {function} drag
			function setElements(g, drag) {
				var multiplier = 1;
				var defs = g.append('defs');
				defs.append('linearGradient')
					.attr('x1', "0%").attr('y1', "0%").attr('x2', "0%").attr('y2', "100%")
					.attr('id', 'gradient').call(function(gradient) {
						gradient.append('stop').attr('offset', '0%').attr('style', 'stop-color:#e4e4e4;stop-opacity:1');
						gradient.append('stop').attr('offset', '15%').attr('style', 'stop-color: #f6f6f6;stop-opacity:1');
					});
				var slideraxis = g.append('rect').attr('y', sliderProperties.sliderYcoordinate)
					.attr("class", "sliderAxis_lio")
					.attr("height", sliderProperties.sliderAxisheight)
					.attr("width", sliderProperties.sliderwidth + 100).attr("x", -50).attr("fill", "url(#gradient)");

				var filter = defs.append("filter")
					.attr("id", "dropshadow");
				filter.append("feGaussianBlur")
					.attr("in", "SourceAlpha")
					.attr("stdDeviation", 1.5)
					.attr("result", "blur");
				filter.append("feOffset")
					.attr("in", "blur")
					.attr("dx", 1)
					.attr("dy", 1)
					.attr("result", "offsetBlur");

				var feMerge = filter.append("feMerge");
				feMerge.append("feMergeNode")
					.attr("in", "offsetBlur");
				feMerge.append("feMergeNode")
					.attr("in", "SourceGraphic");
				g.append("text").attr("x", -50).attr("y", 10).attr("fill", "#666666").attr("font-size", 14).text(sliderProperties.filterVal +
					" (in Days)");
				g.selectAll(".ticktext")
					.data(sliderProperties.filterset)
					.enter()
					.append("text")
					.attr("class", "ticktext")
					.attr("x", function(d, i) {
						return (sliderProperties.itemwidth * i - 1);
					})
					.attr("y", "35").attr("fill", "#bfbfbf").attr("font-size", 12)
					.text(function(d, i) {
						if (sliderProperties.filterset.length > 9) {
							if (i === 0 || i === sliderProperties.filterset.length - 1) {
								return (d);
							} else {
								return "";
							}
						} else {
							return d;
						}
					})
					.attr("text-anchor", "middle");

				var thumb = g.append("g").attr("transform", "translate(-16,13)").attr("filter", "url(#dropshadow)").attr("class", "Duration");
				thumb.append("rect")
					.attr("rx", 2)
					.attr("width", function() {
						if (config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99) {
							return 30;
						}
						if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999) {
							return 38;
						} else {
							return 46;
						}
					})
					.attr("height", 46)
					.attr("fill", "#fafafa")
					.attr("stroke", config.strokeColor)
					.attr("stroke-width", 1);
				thumb.append("text").attr("class", "thumbtext_duration").attr("x", function() {
					if (config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99) {
						return 13;
					}
					if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999) {
						return 15;
					} else {
						return 17;
					}
				}).attr("y", 26).attr("font-size", 14).attr("fill", "#444444").text(config.filterset[0]);
				thumb.append("rect")
					.attr("width", function() {
						if (config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99) {
							return 30;
						}
						if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999) {
							return 38;
						} else {
							return 46;
						}
					})
					.attr("height", 4)
					.attr("fill", config.strokeColor)
					.attr("stroke", config.strokeColor)
					.attr("stroke-width", 1);
				thumb.append("line")
					.attr("x1", function() {
						if (config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99) {
							return 14;
						}
						if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999) {
							return 16;
						} else {
							return 18;
						}
					})
					.attr("x2", function() {
						if (config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99) {
							return 14;
						}
						if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999) {
							return 16;
						} else {
							return 18;
						}
					})
					.attr("y1", 40)
					.attr("y2", 36)
					.attr("stroke", "grey")
					.attr("stroke-width", 1);
				thumb.append("line")
					.attr("x1", function() {
						if (config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99) {
							return 17;
						}
						if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999) {
							return 19;
						} else {
							return 21;
						}
					})
					.attr("x2", function() {
						if (config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99) {
							return 17;
						}
						if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999) {
							return 19;
						} else {
							return 21;
						}
					})
					.attr("y1", 40)
					.attr("y2", 36)
					.attr("stroke", "grey")
					.attr("stroke-width", 1);
				thumb.call(drag);
			}
		}
		var x = d3.scale.ordinal()
			.rangeRoundBands([0, width], .1);
		var y = d3.scale.linear()
			.range([height, 0]);
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(10);
		var numberOfCities = 0;

		fdata.sort(function(a, b) {
			var date1 = new Date(a.Year);
			var date2 = new Date(b.Year);

			if ((date1 - date2) > 0) {
				return 1;
			} else if ((date1 - date2) < 0) {
				return -1;
			} else {
				var nameA = a.City;
				var nameB = b.City;
				if (nameA < nameB) {
					return -1;
				} else if (nameA > nameB) {
					return 1;
				}
				return 0;
			}
		});

		function datalogic(fdata, sliderValue) {
			var printDatesIndex = [];
			var diffDates = dateDifference(datelist[0], datelist[datelist.length - 1]);
			var loopcount = Math.ceil(diffDates / sliderValue) + 1;
			diffDates++;
			var i;
			var limit = (diffDates % sliderValue) ? (diffDates + (diffDates % sliderValue)) : diffDates;
			var prevdate = null;
			for (i = 0; i < loopcount; i++) {
				var date = getNthDate(datelist[0], i * sliderValue);
				var date_index = binaryIndexOf.call(datelist, date);
				if (date_index < 0) {
					date_index = (date_index * -1) - 1;
					date = datelist[date_index];
				}
				if (prevdate !== date) {
					printDatesIndex.push(date_index);
					prevdate = date;
				}
			}
			firstStateData1 = [];

			for (var i = 0; i < printDatesIndex.length; i++) {
				var k = printDatesIndex[i];
				for (var j = k * numberOfCities; j < (k * numberOfCities) + numberOfCities; j++) {
					var temp = {};
					var dataset2;
					temp.City = dataset2[j].City;
					temp.Cases = dataset2[j].Cases;
					temp.Year = dataset2[j].Year;
					firstStateData1.push(temp);
				}
			}
			return (printDatesIndex);
		}
		//starting
		function getNthDate(currentdate, sliderValue) {
			var dateParts = currentdate.split("\/");
			var y = parseInt(dateParts[2]);
			var m = parseInt(dateParts[0]);
			var d = parseInt(dateParts[1]);
			var dayAfter = new Date(y, m - 1, d + sliderValue);
			var mon = dayAfter.getMonth() + 1;
			var day = dayAfter.getDate();
			if ((dayAfter.getMonth() + 1).toString().length === 1) {
				mon = "0" + (dayAfter.getMonth() + 1).toString();
			}
			if ((dayAfter.getDate()).toString().length === 1) {
				day = "0" + (dayAfter.getDate()).toString();
			}
			return (mon + "/" + day + "/" + dayAfter.getFullYear());
		}

		//Find number of days between two dates
		// @param{String} date1,date2
		// return {number} no. of days in between two given dates
		function dateDifference(date1, date2) {
			var _date1 = new Date(date1);
			var _date2 = new Date(date2);
			var timeDiff = Math.abs(_date2.getTime() - _date1.getTime());
			var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
			return diffDays;
		}

		//Performs a binary search on the host array. This method can either be
		//called with a specified scope like this:
		//binaryIndexOf.call(someArray, searchElement);
		//@param {*} searchElement The item to search for within the array.
		//@return {Number} The index of the element which defaults to -1 when not found.
		function binaryIndexOf(searchElement) {
			'use strict';
			searchElement = new Date(searchElement);
			var minIndex = 0;
			var maxIndex = this.length - 1;
			var currentIndex;
			var currentElement;
			var resultIndex;
			while (minIndex <= maxIndex) {
				resultIndex = currentIndex = (minIndex + maxIndex) / 2 | 0;
				currentElement = new Date(this[currentIndex]);
				if (currentElement < searchElement) {
					minIndex = currentIndex + 1;
				} else if (currentElement > searchElement) {
					maxIndex = currentIndex - 1;
				} else {
					return currentIndex;
				}
			}
			return~ maxIndex;
		}

		function sliderset() {
			var numDates = dateDifference(datelist[0], datelist[datelist.length - 1]);
			var datediffArray = [];
			for (var i = 0; i < numDates; i++) {
				datediffArray[i] = i + 1;
			}
			return datediffArray;
		}
		var dataset = [];
		dataset[0] = {};
		dataset[0].City = fdata[0].City;
		dataset[0].Cases = fdata[0].Cases;
		dataset[0].Year = fdata[0].Year;
		var count1 = 1;
		var test = false;
		//Compute the final Bars
		for (var i = 1; i < fdata.length; i++) {
			for (var j = 0; j < count1; j++) {
				if (dataset[j].City === fdata[i].City) {
					dataset[j].Cases += fdata[i].Cases;
					test = true;
				}
			}
			if (!test) {
				var temp = {};
				temp.City = fdata[i].City;
				temp.Cases = fdata[i].Cases;
				temp.Year = fdata[i].Year;
				dataset.push(temp);
				test = false;
				count1++;
			}
		}
		numberOfCities = dataset.length;

		// START: sample render code for a column chx.domain(data.map(function(d) { return d.letter; }));
		y.domain([0, d3.max(dataset, function(d) {
			return d.Cases;
		})]);
		x.domain(fdata.map(function(d) {
			return d.City;
		}));

		svg.append("g")
			.attr("class", "x sap_viz_ext_dynabars_axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.append("text")
			.attr("dy", "1.5em")
			.attr("x", 6)
			.style("text-anchor", "end")
			.text(ds2);

		svg.append("g")
			.attr("class", "y sap_viz_ext_dynabars_axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text(ms1);

		svg.selectAll(".bar")
			.data(dataset)
			.enter().append("rect")
			.attr("class", "sap_viz_ext_dynabars_bar")
			.attr("x", function(d) {
				return x(d.City);
			})
			.attr("width", x.rangeBand())
			.attr("y", function(d) {
				return y(d.Cases);
			})
			.attr("height", function(d) {
				return height - y(d.Cases);
			});

		//Calculate ranges.
		for (i = 0; i < numberOfCities; i++) {
			var temp = {};
			temp.City = fdata[i].City;
			temp.Cases = fdata[i].Cases;
			temp.Year = fdata[i].Year;
			temp.diff = 0;
			dataset1.push(temp);
		}
		for (i = numberOfCities; i < fdata.length; i++) {
			var k = 0;
			k = i;
			var temp = {};
			temp.City = fdata[i].City;
			temp.Cases = dataset1[k - numberOfCities].Cases + (fdata[i].Cases);
			temp.Year = fdata[i].Year;
			temp.diff = fdata[i].Cases - fdata[k - numberOfCities].Cases;
			dataset1.push(temp);
		}
		var dataset2 = [];

		for (i = 0; i < numberOfCities; i++) {
			var temp = {};
			temp.City = fdata[i].City;
			temp.Cases = fdata[i].Cases;
			temp.Year = fdata[i].Year;
			temp.diff = 0;
			dataset2.push(temp);
		}

		for (i = numberOfCities; i < fdata.length; i++) {
			var k = 0;
			k = i;
			var temp = {};
			temp.City = fdata[i].City;
			temp.Cases = dataset2[k - numberOfCities].Cases + (fdata[i].Cases);
			temp.Year = fdata[i].Year;
			temp.diff = fdata[i].Cases - fdata[k - numberOfCities].Cases;
			dataset2.push(temp);
		}

		var firstStateData = [];
		for (var i = 0; i < numberOfCities; i++) {
			var temp = {};
			temp.City = dataset1[i].City;
			temp.Cases = dataset1[i].Cases;
			temp.Year = dataset1[i].Year;
			temp.diff = 0;
			firstStateData.push(temp);
		}

		var iterator = numberOfCities;
		var playAnimation = false;
		var once = true;
		var restart = false;
		var endOdataSet = 0;
		var mediaControllers = controlContainer.append("g");
		var containter = mediaControllers.append("rect")
			.attr("width", "35")
			.attr("height", "20")
			.attr("x", -5)
			.attr("y", -5)
			.attr("fill", "none")
			.attr("stroke", "black")
			.attr("stroke-opacity", "1.0");

		var play = mediaControllers.append("polygon")
			.attr("points", "0,0 0,10 10,5")
			.attr("x", 20)
			.attr("y", 5)
			.attr("fill", "grey");
		play.on('click', playClick);

		var stop = mediaControllers.append("rect")
			.attr("width", "8")
			.attr("height", "8")
			.attr("x", 15)
			.attr("y", 1)
			.attr("fill", "grey");
		stop.on('click', restartBarChart);

		var pause = mediaControllers.append("path")
			.attr("d", "M0,0 L0,20 L5,20 L5,0 L0,0 M10,0 L10,20 L15,20 L15,0, L10,0")
			.attr("transform", "scale(.5)")
			.attr("fill", "grey")
			.attr("opacity", "0");

		mediaControllers.attr("transform", "translate(100,0)", "scale(5)");
		mediaControllers.attr("transform", "scale(1.5)");

		function restartBarChart() {
			clearInterval(myVar);
			iterator = numberOfCities;
			once = true;
			if (playAnimation) {
				playAnimation = false;
				pause.attr("opacity", "0");
				play.attr("opacity", "1");
			}

			svg.selectAll("circle").remove();
			svg.selectAll(".sap_viz_ext_dynabars_bar1").remove();
			svg.selectAll(".DiffrenceText").remove();
			svg.selectAll(".DisplayDateText").remove();

			endOdataSet = 0;
		}

		function playClick() {
			playAnimation = !playAnimation;
			if (playAnimation) {
				myVar = setInterval(function() {
					myTimer();
				}, 1000);
				paused = 0;
				pause.attr("opacity", "1");
				play.attr("opacity", "0");
				var DatesToBeShown;
				DatesToBeShown = datalogic(fdata, sliderValue);
				datesLength = DatesToBeShown.length;
			} else {
				paused = 1;
				play.attr("opacity", "1");
				pause.attr("opacity", "0");
			}
		}
		//On timer, update with new data
		function myTimer() {
			if (paused === 1) {
				clearInterval(myVar);
			}
			if (endOdataSet >= datelist.length) {
				clearInterval(myVar);
				play.attr("opacity", "1");
				pause.attr("opacity", "0");
				paused = 1;
			}
			if (playAnimation && endOdataSet < datelist.length) {
				endOdataSet++;
				var barchartToolTip = new Tooltip();
				var circleToolTip = new Tooltip();
				var circleToolTip2 = new Tooltip();
				if (once) {
					var diff_arr = [];
					for (i = 0; i < firstStateData.length; i++) {
						diff_arr[i] = firstStateData[i].Cases;
					}
					var max_arr = Math.max.apply(Math, diff_arr);
					var min_arr = Math.min.apply(Math, diff_arr);
					svg.selectAll(".bar1")
						.data(firstStateData)
						.enter().append("rect")
						.attr("class", "sap_viz_ext_dynabars_bar1")
						.attr("x", function(d) {
							return x(d.City);
						})
						.attr("width", x.rangeBand())
						.attr("y", function(d) {
							return y(d.Cases);
						})
						.attr("height", function(d) {
							return height - y(d.Cases);
						})
						.attr("fill", function(d, i) {
							if (d.Cases === max_arr) {
								return "green";
							}
							if (d.Cases === min_arr) {
								return "#823990";
							} else {
								return "orange";
							}
						})
						.on("mouseover", function(d, i) {
							var opt = {};
							opt.data = [{
								name: ds1,
								value: d.City,
								type: "measure"
							}, {
								name: "Total Count",
								value: d.Cases,
								type: "measure"
							}, {
								name: "Current Count",
								value: d.diff,
								type: "measure"
							}, {
								name: "Growth Rate",
								value: Math.round(((d.Cases - (d.Cases - d.diff)) / (d.Cases - d.diff)) * 100) + "%",
								type: "measure"
							}];
							opt.position = {
								x: event.clientX,
								y: event.clientY
							};
							opt.container = document.body;
							barchartToolTip.show(opt);
						})
						.on("mouseout", function() {
							barchartToolTip.hide();
						})
						.on("mousemove", function(d, i) {
							var opt = {};
							opt.data = [{
								name: ds2,
								value: d.City,
								type: "measure"
							}, {
								name: "Total Count",
								value: d.Cases,
								type: "measure"
							}, {
								name: "Current Count",
								value: d.diff,
								type: "measure"
							}, {
								name: "Growth Rate",
								value: Math.round(((d.Cases - (d.Cases - d.diff)) / (d.Cases - d.diff)) * 100) + "%",
								type: "measure"
							}];
							opt.position = {
								x: event.clientX + 10,
								y: event.clientY + 10
							};
							opt.container = document.body;
							barchartToolTip.show(opt);
						});

					var circle = svg.selectAll(".circle1")
						.data(firstStateData)
						.enter().append("circle")
						.attr("class", ".circle1")
						.attr("r", 5)
						.attr("fill", function(d, i) {

							if (d.Cases === max_arr) {
								return "green";
							}
							if (d.Cases === min_arr) {
								return "#823990";
							} else {
								return "orange";
							}
						}).attr("cx", function(d) {
							return x(d.City) + 5 + (x.rangeBand() / 2);
						})
						.attr("cy", function(d) {
							return y(d.Cases) - 30;
						});
					svg.selectAll(".DiffrenceText").data(firstStateData).enter().append("text").attr("class", "DiffrenceText").attr("id", "xyz").text(
						function(d) {
							return (d.diff);
						}).attr("x", function(d) {
						return x(d.City) + (x.rangeBand() / 2);
					}).attr("y", function(d) {
						return y(d.Cases) - 10;
					});
					dateText.selectAll(".DisplayDateText").data(firstStateData).enter().append("text").attr("class", "DisplayDateText").text(function(d) {
						return (d.Year);
					})
						.style("background-color", "Black")
						.style("font-size", "25px")
						.style("font-weight", "950")
						.style("font-family", 'Arial').attr("x", function(d) {
							return ((width / 2) - 50);
						}).attr("y", function(d) {
							return 10;
						});
					once = false;
				} else {
					svg.selectAll("circle").remove();
					var repeat = 0,
						dataset3;
					//compute difference in consecutive cases
					if (sliderValue >= 2) {
						dataset3 = firstStateData1;
						if (endOdataSet >= datesLength) {
							endOdataSet = 100000;
						}
						repeat = 1;
					} else {
						dataset3 = dataset1;
					}
					var print_data = [];
					var iter2 = iterator + numberOfCities;
					for (i = iterator; i < iter2; i++) {
						var n = 0;
						n = iterator;
						var temp = {};
						temp.City = dataset3[i].City;
						temp.Cases = dataset3[i].Cases;
						temp.Year = dataset3[i].Year;
						temp.diff = fdata[i].Cases - fdata[k - numberOfCities].Cases;
						print_data.push(temp);
					}
					var diff_arr = [];
					for (i = 0; i < print_data.length; i++) {
						diff_arr[i] = print_data[i].diff;
					}
					var max_of_array = Math.max.apply(Math, diff_arr);
					var min_arr = Math.min.apply(Math, diff_arr);
					svg.selectAll(".sap_viz_ext_dynabars_bar1")
						.data(print_data)
						.transition()
						.delay(function(d, i) {
							return i / print_data.length * 10;
						})
						.duration(500)
						.attr("class", "sap_viz_ext_dynabars_bar1")
						.attr("x", function(d) {
							return x(d.City);
						})
						.attr("width", x.rangeBand())
						.attr("y", function(d) {
							return y(d.Cases);
						})
						.attr("height", function(d) {
							return height - y(d.Cases);
						})
						.attr("fill", function(d, i) {
							if (d.diff === max_of_array) {
								return "green";
							}
							if (d.diff === min_arr) {
								return "#823990";
							} else {
								return "orange";
							}
						});
					svg.selectAll(".circle2")
						.data(print_data)
						.enter().append("circle")
						.attr("class", ".circle2")
						.attr("r", 5)
						.attr("fill", function(d, i) {
							if (d.diff === max_of_array) {
								return "green";
							}
							if (d.diff === min_arr) {
								return "#823990";
							} else {
								return "orange";
							}
						}).attr("cx", function(d) {
							return x(d.City) + 5 + (x.rangeBand() / 2);
						}).attr("cy", function(d) {
							return y(d.Cases) - 30;
						});
					svg.selectAll(".DiffrenceText").data(print_data).transition().delay(function(d, i) {
						return i / print_data.length * 10;
					}).duration(500).attr("class", "DiffrenceText").text(function(d, i) {
						return (d.diff);
					}).attr("x", function(d) {
						return x(d.City) + (x.rangeBand() / 2);
					}).attr("y", function(d) {
						return y(d.Cases) - 10;
					});
					dateText.selectAll(".DisplayDateText").data(print_data).transition().delay(function(d, i) {
						return i / print_data.length * 10;
					}).duration(500).attr("class", "DisplayDateText").text(function(d, i) {
						return (d.Year);
					})
						.style("background-color", "Black")
						.style("font-size", "25px")
						.style("font-weight", "950")
						.style("font-family", 'Arial').attr("x", function(d) {
							return ((width / 2) - 50);
						}).attr("y", function(d) {
							return 10;
						});
					iterator = iterator + numberOfCities;
				}
			}
		}
		//A class for gnerating tooltip for the plot
		//   @param {object}  An object containing data for tooltip , position of tooltip, container where to append the tooltip
		//        also info mode of tooltip and count of number of marks selected
		//   @constructor generation of structure for the tooltip
		//   @extends the Tooltip class with method for positioning, visibility of tooltip
		Tooltip = function(options) {
			// local variable creting base div for tooltip
			this.tooltip = document.createElement("div");
			this.options = options;
			this.tooltip.className = "sap_viz_ext_dynabars_v-m-tooltip";
			this.tooltip.setAttribute("id", "sap_viz_ext_dynabars_v-m-tooltip");
			this.tooltip.style.position = "fixed";
			// local variable to create background div for tooltip
			this.background = document.createElement("div");
			this.background.className = "sap_viz_ext_dynabars_v-background";
			if (options && options.tooltip && options.tooltip.background) {
				if (options.tooltip.background.color) {
					this.background.style.background = options.tooltip.background.color;
				}
				if (options.tooltip.background.borderColor) {
					this.background.style.border = options.tooltip.background.borderColor;
				}
			} else {
				this.background.style.background = "rgb(255, 255, 255)";
				this.background.style.border = "1px solid rgb(204, 204, 204)";
			}

			this.mainDiv = document.createElement("div");
			// local variable to create main div for tooltip
			this.mainDiv.className = "sap_viz_ext_dynabars_v-tooltip-mainDiv";
			this.table = document.createElement("table");
			//local variable creating table to show data
			this.table.className = "sap_viz_ext_dynabars_v-tooltip-dimension-measure";
			this.separationLine = document.createElement("div");
			// local varible creating seperation line for tooltip
			this.separationLine.className = "sap_viz_ext_dynabars_v-separationline";
			this.separationLine.style.display = "none";
			// local variable creating footer div for tooltip
			this.footer = document.createElement("div");
			this.footer.className = "sap_viz_ext_dynabars_v-footer-label";
			this.footer.style.display = "none";
			this.preRenderElem = document.createElement("div");
			this.preRenderElem.style.display = "none";
			this.preRender = null;
			this.postRender = null;
			this.tooltip.appendChild(this.background).appendChild(this.mainDiv).appendChild(this.table);
			this.mainDiv.appendChild(this.separationLine);
			this.mainDiv.appendChild(this.footer);
		};

		Tooltip.prototype.show = function(obj) {
			this.fillData(obj.data);
			this.setPosition(obj.position);
			this.count(obj.selectedNumber, obj.data);
			obj.container.appendChild(this.tooltip);
		};
		//function to move tooltip
		Tooltip.prototype.setPosition = function(value) {
			this.tooltip.style.top = value.y + "px";
			this.tooltip.style.right = (document.body.clientWidth - value.x) + "px";
		};
		Tooltip.prototype.hide = function() {
			x = document.getElementById("sap_viz_ext_dynabars_v-m-tooltip");
			if (x) {
				x.parentNode.removeChild(x);
			}
		};
		//function to fill data into tooltip
		Tooltip.prototype.fillData = function(value) {
			if (this.preRender) {
				this.preRender(this.preRenderElem);
			}
			while (this.table.firstChild) {
				this.table.removeChild(this.table.firstChild);
			}
			if (value != null) {
				this.table.style.display = "block";
				var dimension = value.dimension;
				var measure = value.measure;
				for (i = 0; i < value.length; i++) {
					var tr = document.createElement("tr");
					var td1 = document.createElement("td");
					td1.innerHTML = value[i].name + ':';
					var td2 = document.createElement("td");
					td2.innerHTML = value[i].value;
					if (value[i].type === "dimension") {
						td1.className = "sap_viz_ext_dynabars_v-body-dimension-label";
						td2.className = "sap_viz_ext_dynabars_v-body-dimension-value";
					} else {
						td1.className = "sap_viz_ext_dynabars_v-body-measure-label";
						td2.className = "sap_viz_ext_dynabars_v-body-measure-value";
					}
					tr.appendChild(td1);
					tr.appendChild(td2);
					if (i === value.length - 1) {
						td1.style.paddingBottom = '0px';
						td2.style.paddingBottom = '0px';
					}
					this.table.appendChild(tr);
				}

				//TODO: Assuming tooltrip drawing is finished here, review required
				if (this.postRender) {
					this.postRender(this.tooltip);
				}
			} else {
				this.table.style.display = "none";
			}
		};
		Tooltip.prototype.count = function(value, check) {
			if (value > 1) {
				if (check.length) {
					this.separationLine.style.display = "block";
					this.footer.style.marginTop = "8px";
				} else {
					this.separationLine.style.display = "none";
					this.footer.style.marginTop = "0px";
				}
				this.footer.style.display = "block";
				this.footer.innerHTML = value + "values selected";
			} else {
				this.separationLine.style.display = "none";
				this.footer.style.display = "none";
			}
		};
		Tooltip.prototype.preRender = function(cb) {
			this.preRender = cb;
		};
		Tooltip.prototype.postRender = function(cb) {
			this.postRender = cb;
		};
		// END: sample render code
	};

	return render;
});