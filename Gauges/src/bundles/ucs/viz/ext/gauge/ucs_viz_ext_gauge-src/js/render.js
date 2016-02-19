define("ucs_viz_ext_gauge-src/js/render", [], function() {
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
			height = this.height();
		//			colorPalette = this.colorPalette(),
		//			properties = this.properties(),
		//			dispatch = this.dispatch();

		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

		var dsets = data.meta.dimensions(),
			//            msets = data.meta.measures(),
			instance,
			mems = [];

		var mset0 = data.meta.measures(0);
		//            mset1 = data.meta.measures(1);
		var ms0 = mset0[0],
			ms1 = mset0[1],
			ms2 = mset0[2],
			ms3 = mset0[3];
		// converts the json object array data into simple key-value array.
		var fdata = data.map(function(d) {
			var val = parseFloat(d[ms0]);
			var min = parseFloat(d[ms1]);
			var max = parseFloat(d[ms2]);
			var lih = parseFloat(d[ms3]);
			mems = [];
			$.each(dsets, function(idx, dim) {
				mems.push(d[dim]);
			});
			return [mems.join(" / "), val, min, max, lih];
		});

		function Gauge(placeholderName, configuration) {
			this.placeholderName = placeholderName;

			var self = this; // for internal d3 functions

			this.configure = function(configuration) {
				this.config = configuration;

				this.config.size = this.config.size * 0.9;

				this.config.raduis = this.config.size * 0.97 / 2;
				this.config.cx = (this.config.size / 2) + (150 * instance);
				this.config.cy = this.config.size / 2;

				this.config.min = undefined !== configuration.min ? configuration.min : 0;
				this.config.max = undefined !== configuration.max ? configuration.max : 100;
				this.config.range = this.config.max - this.config.min;

				this.config.majorTicks = configuration.majorTicks || 5;
				this.config.minorTicks = configuration.minorTicks || 2;

				this.config.greenColor = configuration.greenColor || "#109618";
				this.config.yellowColor = configuration.yellowColor || "#FF8A00";
				this.config.redColor = configuration.redColor || "#DC3912";

				this.config.transitionDuration = configuration.transitionDuration || 500;
			};

			this.render = function() {
				//this.body = d3.select("#" + this.placeholderName)
				this.body = d3.select(this.placeholderName)
					.append("svg:svg")
					.attr("class", "ucs_viz_ext_gauge_gauge")
					.attr("width", (this.config.size) + (150 * instance))
					.attr("height", this.config.size);

				this.body.append("svg:circle")
					.attr("cx", this.config.cx)
					.attr("cy", this.config.cy)
					.attr("r", this.config.raduis)
					.style("fill", "#1f1f1f")
					.style("stroke", "#353535")
					.style("stroke-width", "0.5px");

				this.body.append("svg:circle")
					.attr("cx", this.config.cx)
					.attr("cy", this.config.cy)
					.attr("r", 0.9 * this.config.raduis)
					.style("fill", "#1f1f1f")
					.style("stroke", "#e0e0e0")
					.style("stroke-width", "2px");

				for (var index in this.config.greenZones) {
					this.drawBand(this.config.greenZones[index].from, this.config.greenZones[index].to, self.config.greenColor);
				}

				for (var index in this.config.yellowZones) {
					this.drawBand(this.config.yellowZones[index].from, this.config.yellowZones[index].to, self.config.yellowColor);
				}

				for (var index in this.config.redZones) {
					this.drawBand(this.config.redZones[index].from, this.config.redZones[index].to, self.config.redColor);
				}

				if (undefined !== this.config.label) {
					var fontSize = Math.round(this.config.size / 10.5);
					this.body.append("svg:text")
						.attr("x", this.config.cx)
						.attr("y", this.config.cy / 2 + fontSize / 2)
						.attr("dy", fontSize / 2)
						.attr("text-anchor", "middle")
						.text(this.config.label)
						.style("font-size", fontSize + "px")
						.style("fill", "#e5e5e5")
						.style("font-family", "Helvetica");
				}

				var fontSize = Math.round(this.config.size / 16);
				var majorDelta = this.config.range / (this.config.majorTicks - 1);
				for (var major = this.config.min; major <= this.config.max; major += majorDelta) {
					var minorDelta = majorDelta / this.config.minorTicks;
					for (var minor = major + minorDelta; minor < Math.min(major + majorDelta, this.config.max); minor += minorDelta) {
						var point1 = this.valueToPoint(minor, 0.75);
						var point2 = this.valueToPoint(minor, 0.85);

						this.body.append("svg:line")
							.attr("x1", point1.x)
							.attr("y1", point1.y)
							.attr("x2", point2.x)
							.attr("y2", point2.y)
							.style("stroke", "#e5e5e5")
							.style("stroke-width", "1px");
					}

					var point1 = this.valueToPoint(major, 0.7);
					var point2 = this.valueToPoint(major, 0.85);

					this.body.append("svg:line")
						.attr("x1", point1.x)
						.attr("y1", point1.y)
						.attr("x2", point2.x)
						.attr("y2", point2.y)
						.style("stroke", "#e5e5e5")
						.style("stroke-width", "2px");

					if (major === this.config.min || major === this.config.max) {
						var point = this.valueToPoint(major, 0.63);

						this.body.append("svg:text")
							.attr("x", point.x)
							.attr("y", point.y)
							.attr("dy", fontSize / 3)
							.attr("text-anchor", major === this.config.min ? "start" : "end")
							.text(major)
							.style("font-size", fontSize + "px")
							.style("fill", "#e5e5e5")
							.style("stroke-width", "0px");
					}
				}

				var pointerContainer = this.body.append("svg:g").attr("class", "ucs_viz_ext_gauge_pointerContainer");

				var midValue = (this.config.min + this.config.max) / 2;

				var pointerPath = this.buildPointerPath(midValue);

				var pointerLine = d3.svg.line()
					.x(function(d) {
						return d.x;
					})
					.y(function(d) {
						return d.y;
					})
					.interpolate("basis");

				pointerContainer.selectAll("path")
					.data([pointerPath])
					.enter()
					.append("svg:path")
					.attr("d", pointerLine)
					.style("fill", "#FFFF00")
					.style("stroke", "#FFD700")
					.style("fill-opacity", 1);

				pointerContainer.append("svg:circle")
					.attr("cx", this.config.cx)
					.attr("cy", this.config.cy)
					.attr("r", 0.12 * this.config.raduis)
					.style("fill", "#FFD700")
					.style("stroke", "#fff")
					.style("opacity", 0.8);

				var fontSize = Math.round(this.config.size / 10);
				pointerContainer.selectAll("text")
					.data([midValue])
					.enter()
					.append("svg:text")
					.attr("x", this.config.cx)
					.attr("y", this.config.size - this.config.cy / 4 - fontSize)
					.attr("dy", fontSize / 2)
					.attr("text-anchor", "middle")
					.style("font-size", fontSize + "px")
					.style("fill", "#e5e5e5")
					.style("stroke-width", "0px");

				this.redraw(this.config.min, 0);
			};

			this.buildPointerPath = function(value) {
				var delta = this.config.range / 13;

				var head = valueToPoint(value, 0.85);
				var head1 = valueToPoint(value - delta, 0.12);
				var head2 = valueToPoint(value + delta, 0.12);

				var tailValue = value - (this.config.range * (1 / (270 / 360)) / 2);
				var tail = valueToPoint(tailValue, 0.28);
				var tail1 = valueToPoint(tailValue - delta, 0.12);
				var tail2 = valueToPoint(tailValue + delta, 0.12);

				return [head, head1, tail2, tail, tail1, head2, head];

				function valueToPoint(value, factor) {
					var point = self.valueToPoint(value, factor);
					point.x -= self.config.cx;
					point.y -= self.config.cy;
					return point;
				}
			};

			this.drawBand = function(start, end, color) {
				if (0 >= end - start) {
					return;
				}

				this.body.append("svg:path")
					.style("fill", color)
					.attr("d", d3.svg.arc()
						.startAngle(this.valueToRadians(start))
						.endAngle(this.valueToRadians(end))
						.innerRadius(0.65 * this.config.raduis)
						.outerRadius(0.85 * this.config.raduis))
					.attr("transform", function() {
						return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(270)";
					});
			};

			this.redraw = function(value, transitionDuration) {
				var pointerContainer = this.body.select(".ucs_viz_ext_gauge_pointerContainer");

				pointerContainer.selectAll("text").text(Math.round(value));

				var pointer = pointerContainer.selectAll("path");
				pointer.transition()
					.duration(undefined !== transitionDuration ? transitionDuration : this.config.transitionDuration)
				//.delay(0)
				//.ease("linear")
				//.attr("transform", function(d) 
				.attrTween("transform", function() {
					var pointerValue = value;
					if (value > self.config.max) {
						pointerValue = self.config.max + 0.02 * self.config.range;
					} else if (value < self.config.min) {
						pointerValue = self.config.min - 0.02 * self.config.range;
					}
					var targetRotation = (self.valueToDegrees(pointerValue) - 90);
					var currentRotation = self._currentRotation || targetRotation;
					self._currentRotation = targetRotation;

					return function(step) {
						var rotation = currentRotation + (targetRotation - currentRotation) * step;
						return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(" + rotation + ")";
					};
				});
			};

			this.valueToDegrees = function(value) {
				// thanks @closealert
				//return value / this.config.range * 270 - 45;
				return value / this.config.range * 270 - (this.config.min / this.config.range * 270 + 45);
			};

			this.valueToRadians = function(value) {
				return this.valueToDegrees(value) * Math.PI / 180;
			};

			this.valueToPoint = function(value, factor) {
				return {
					x: this.config.cx - this.config.raduis * factor * Math.cos(this.valueToRadians(value)),
					y: this.config.cy - this.config.raduis * factor * Math.sin(this.valueToRadians(value))
				};
			};

			// initialization
			this.configure(configuration);
		}
		var gauges = [];

		function createGauge(name, label, min, max, lih) {
			var config = {
				size: 150,
				label: label,
				min: undefined !== min ? min : 0,
				max: undefined !== max ? max : 100,
				minorTicks: 5
			};

			var range = config.max - config.min;
			config.yellowZones = [{
				from: config.min + range * 0.5,
				to: config.min + range * 0.8
			}];
			if (lih === 0) {
				config.redZones = [{
					from: config.min + range * 0.8,
					to: config.max
				}];
			} else {
				config.greenZones = [{
					from: config.min + range * 0.8,
					to: config.max
				}];
			}

			gauges[name] = new Gauge(".vis", config);
			gauges[name].render();
		}

		function createGauges() {
			//  createGauge("margin", fdata[0][0]);
			// loop through the dataset and create a gauges for each key and set the value
			for (instance = 0; instance < fdata.length; instance++) {
				createGauge(instance, fdata[instance][0], fdata[instance][2], fdata[instance][3], fdata[instance][4]);
			}
		}

		function updateGauges() {
			for (var key in gauges) {
				var value = parseFloat(fdata[key][1]);
				gauges[key].redraw(value);
			}
		}

		createGauges();
		setInterval(updateGauges, 1000);

	};

	return render;
});