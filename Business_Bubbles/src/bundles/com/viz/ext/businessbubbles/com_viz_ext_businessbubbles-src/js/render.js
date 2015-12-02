define("com_viz_ext_businessbubbles-src/js/render", [], function() {
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
	function radiate(n) {
		return (n.revenue / 10);
	}

	var pickaColor = d3.scale.linear()
		.domain([-400, 0, 200])
		.range(["red", "white", "green"]);

	function columnAssigner(n) {
		try {
			var m = n.order_date.getMonth();
			return m - 6;
		} catch (e) {
			return null;
		}
		//var col = (0.5 - Math.random()) * n;

		//return Math.floor(col);
	}

	var render = function(data, container) {
		var margin = {
			top: 30,
			right: 20,
			bottom: 30,
			left: 50
		};
		var width = this.width() - margin.left - margin.right;
		var height = this.height() - margin.top - margin.bottom;

		container.selectAll('svg').remove();

		// Adds the svg canvas
		var svg = container.append("svg")
			.attr("width", this.width() + margin.left + margin.right)
			.attr("height", this.height() + margin.top + margin.bottom)
			.append("g")
			.attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");

		//-------------------------------------------------------------------
		//--- Begin of Line Graph -------------------------------------------
		//-------------------------------------------------------------------

		// horizontal lines
		var amountHLines = 10;

		svg.selectAll(".hline").data(d3.range(amountHLines)).enter()
			.append("line")
			.attr("y1", function(d) {
				return d * ((height - margin.top) / (amountHLines));
			})
			.attr("y2", function(d) {
				return d * ((height - margin.top) / (amountHLines)); //d * 26 + 6;
			})
			.attr("x1", function(d) {
				return 0 - margin.left;
			})
			.attr("x2", function(d) {
				return width - margin.left;
			})
			.style("stroke", "#eee")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var amountVLines = 4;
		var width_2 = width + margin.left;
		//vertical lines
		svg.selectAll(".vline").data(d3.range(amountVLines + 1)).enter()
			.append("line")
			.attr("x1", function(d) {
				return d * (width / (amountVLines)) - margin.left;
			})
			.attr("x2", function(d) {
				return d * (width / (amountVLines)) - margin.left;
			})
			.attr("y1", function(d) {
				return 0 - margin.top;
			})
			.attr("y2", function(d) {
				return height - margin.bottom;
			})
			.style("stroke", "#eee")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var parseDate = d3.time.format("%d.%m.%Y").parse;
		data.forEach(function(d) {
			d.order_date = parseDate(d.order_date);
			d.revenue = parseInt(d.revenue);
			d.profit = parseInt(d.profit);
			d.expenditure = parseInt(d.expenditure);
			try {
				d.month = d.order_date.getMonth();
			} catch (e) {}
		});

		var ag_data = new Array();
		var month;
		ag_data[0] = new Object();
		ag_data[0].revenue = 0;
		ag_data[0].profit = 0;
		ag_data[0].expenditure = 0;
		ag_data[0].date = "1.1.";
		for (var i = 0; i < data.length - 1; i++) {
			try {
				month = data[i].order_date.getMonth() + 1;
				if (typeof ag_data[month] !== 'object') {
					ag_data[month] = new Object();
					ag_data[month].revenue = 0;
					ag_data[month].profit = 0;
					ag_data[month].expenditure = 0;
					ag_data[month].month = month;
					switch (month) {
						case 1:
							ag_data[month].date = "January";
							break;
						case 2:
							ag_data[month].date = "February";
							break;
						case 3:
							ag_data[month].date = "March";
							break;
						case 4:
							ag_data[month].date = "April";
							break;
						case 5:
							ag_data[month].date = "May";
							break;
						case 6:
							ag_data[month].date = "June";
							break;
						case 7:
							ag_data[month].date = "July";
							break;
						case 8:
							ag_data[month].date = "August";
							break;
						case 9:
							ag_data[month].date = "September";
							break;
						case 10:
							ag_data[month].date = "October";
							break;
						case 11:
							ag_data[month].date = "November";
							break;
						case 12:
							ag_data[month].date = "December";
							break;
					}
				}
				ag_data[month].revenue = ag_data[month].revenue + data[i].revenue;
				ag_data[month].profit = ag_data[month].profit + data[i].profit;
				ag_data[month].expenditure = ag_data[month].expenditure + data[i].expenditure;
			} catch (e) {}
		}

		for (var a = 1; a < ag_data.length; a++) {
			ag_data[0].revenue = ag_data[0].revenue + ag_data[a].revenue;
			ag_data[0].profit = ag_data[0].profit + ag_data[a].profit;
			ag_data[0].expenditure = ag_data[0].expenditure + ag_data[a].expenditure;
		}

		ag_data[0].revenue = ag_data[0].revenue / 12;
		ag_data[0].expenditure = ag_data[0].expenditure / 12;
		ag_data[0].profit = ag_data[0].profit / 12;

		var columnCount = 12;

		var bubbleHeight = height * 2;
		var recordCount = 2000;

		var width_old = width;
		var height_old = height;

		width = this.width();
		height = this.height();

		var nodes = d3.range(1000).map(function(i) {
			try {
				var columnValue = columnAssigner(data[i]);
				var colorizer = pickaColor(data[i].profit); //columnValue); i & 2 ? "white" : 
				return {
					index: i,
					column: columnValue,
					radius: (4 + radiate(data[i])) * 20 / (1.2 * Math.sqrt(recordCount)) * Math.sqrt(width / 1280),
					color: colorizer
				};
			} catch (e) {
				return {
					index: i,
					column: 12,
					radius: 0,
					color: "white"
				};
			}
		});

		var force = d3.layout.force()
			.nodes(nodes)
			.charge(chargeIt)
			.size([width, bubbleHeight])
			.on("tick", tick)
			.start();

		var node = svg.selectAll(".node")
			.data(nodes)
			.enter().append("circle")
			.attr("class", "com_viz_ext_businessbubbles_node")
			.attr("cx", function(d) {
				return d.x;
			})
			.attr("cy", function(d) {
				return d.y;
			})
			.attr("r", function(d) {
				return d.radius;
			})
			.style("fill", function(d) {
				return d.color;
			}) // return fill(d.column & 3);
			.style("stroke", function(d, g) {
				return g & 2 ? "white" : d3.rgb(d.color).darker(2);
			}) // return d3.rgb(fill(i & 3)).darker(2);
			.call(force.drag)
			.on("mousedown", function() {
				d3.event.stopPropagation();
			});

		svg.style("opacity", 1e-6)
			.transition()
			.duration(1000)
			.style("opacity", 1);

		function chargeIt(d) {
			return -Math.pow(d.radius, 2.0) / 9;
		}

		function tick(e) {

			// Push different nodes in different directions for clustering.
			var k = ((width / columnCount) / 14) * e.alpha;
			nodes.forEach(function(o, j) {

				o.y += -2.5 * k;
				//	o.y += o.column == ( -7 || 6 ) ? k : -k;

				o.x += k * (o.column);
			});

			node.attr("cx", function(d) {
				return d.x = Math.max(d.radius, Math.min(width - d.radius, d.x));
			})
				.attr("cy", function(d) {
					return d.y = Math.max(d.radius, Math.min(bubbleHeight - d.radius, d.y));
				});
		}

		width = width_old;
		height = height_old;

		// Set the ranges
		var x = d3.scale.ordinal()
			.domain(["1.1.", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November",
				"December"
			])
			.rangePoints([0, width]); //d3.time.scale().range([0, width]); 

		var y = d3.scale.linear().range([height, 0]);

		// Define the axes
		var xAxis = d3.svg.axis().scale(x)
			.orient("bottom").ticks(13);

		var yAxis = d3.svg.axis().scale(y)
			.orient("left").ticks(5);

		// Define the line
		var valueline = d3.svg.line()
			.x(function(d) {
				return x(d.date);
			})
			.y(function(d) {
				return y(d.revenue);
			});

		// Scale the range of the data
		// x.domain(d3.extent(data, function(d) { return d.date; }));
		x.domain(ag_data.map(function(d) {
			return d.date;
		}));
		y.domain([0, d3.max(ag_data, function(d) {
			return d.revenue;
		})]);

		// Add the valueline path.
		svg.append("path")
			.attr("class", "com_viz_ext_businessbubbles_line")
			.attr("d", valueline(ag_data));

		// Add the X Axis
		svg.append("g")
			.attr("class", "com_viz_ext_businessbubbles_X_Axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		// Add the Y Axis
		svg.append("g")
			.attr("class", "com_viz_ext_businessbubbles_Y_Axis")
			.call(yAxis);

		//-------------------------------------------------------------------
		//--- End of Line Graph ---------------------------------------------
		//-------------------------------------------------------------------

		//var fill = d3.scale.category20();

	};
	return render;
});