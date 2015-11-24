define("sap_viz_ext_holtwinters-src/js/render", [], function() {
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

		//prepare canvas with width and height of container
		var width = this.width(),
			height = this.height(),
			colorPalette = this.colorPalette(),
			properties = this.properties(),
			dispatch = this.dispatch();
		container.selectAll('svg').remove();
		var vis = container.append('svg').attr('width', width).attr('height', height)
			.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

		/*********************/
		var dsets = data.meta.dimensions();

		var msets = data.meta.measures();

		// converts the json object array data into simple key-value array.
		var fdata = [];
		for (var i = 0; i < data.length; i++) {
			var row = {};
			row.TimeDimension = data[i][dsets[0]];
			row.Actuals = data[i][msets[0]];
			row.SeasonallyAdjusted = data[i][msets[1]];
			row.Fitted = data[i][msets[2]];
			//	row.Fittedlevel = data[i][msets[3]];

			fdata.push(row);
		}

		var margin = {
				top: 40,
				right: 20,
				bottom: 20,
				left: 40
			},
			plotWidth = width - margin.left - margin.right,
			plotHeight = height - margin.top - margin.bottom;
		//transform plot area
		vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		//create x and y scales, domains and axes
		var x = d3.scale.ordinal().rangeRoundBands([0, plotWidth], 0);
		x.domain(fdata.map(function(d) {
			return d.TimeDimension;
		}));
		var xAxis = d3.svg.axis().scale(x).orient("bottom");

		var y = d3.scale.linear().range([plotHeight, 0]);
		y.domain([0, d3.max(fdata, function(d) {
			return d.SeasonallyAdjusted;
		})]);
		var yAxis = d3.svg.axis().scale(y).orient("left");

		//draw x axis
		vis.append("g")
			.attr("class", "sap_viz_ext_holtwinters_x_axis")
			.attr("transform", "translate(0," + plotHeight + ")")
			.call(xAxis)
			.append("text")
			.attr("x", plotWidth)
			.attr("dy", "1.5em")
			.style("text-anchor", "end")
			.text(dsets.join(" / "));

		//draw y axis
		vis.append("g")
			.attr("class", "sap_viz_ext_holtwinters_y_axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Weight");

		var canvas = vis.append("g");
		// //draw Seasonal Adjusted
		// //console.log(JSON.stringify(fdata));
		// var actuals = d3.svg.line()
		// 	.x(function(d) {
		// 		return +d.TimeDimension;
		// 	})
		// 	.y(function(d) {
		// 		return d.SeasonallyAdjusted;
		// 	});

		// canvas.append("path")
		// 	  .attr("class", "actuals")
		// 	  .attr("d", actuals(fdata));

		// begin actuals
		
		var pendown1 = false;
		var dapath = "";
		for (i = 0; i < fdata.length - 1; i++) {
			if (fdata[i].Actuals != "") {
				if (!pendown1) {
					dapath += "M";
					pendown1 = true;
				} else {
					dapath += "L";
				}
				dapath += x(fdata[i].TimeDimension);
				//console.log(dates[i] + "\t" + x(dates[i]));
				dapath = dapath + "," + y(fdata[i].Actuals);
			}
		}

		canvas.append("g")
			.append("path")
			.attr("class", "sap_viz_ext_holtwinters_actuals")
			.attr("d", dapath);

		//end actuals

		// begin fitted
		var pendown = false;
		var dpath = "";
		for (i = 0; i < fdata.length - 1; i++) {
			if (fdata[i].Fitted != "") {
				if (!pendown) {
					dpath += "M";
					pendown = true;
				} else {
					dpath += "L";
				}
				dpath += x(fdata[i].TimeDimension);
				//console.log(dates[i] + "\t" + x(dates[i]));
				dpath = dpath + "," + y(fdata[i].Fitted);
			}
		}

		canvas.append("g")
			.append("path")
			.attr("class", "sap_viz_ext_holtwinters_fitted")
			.attr("d", dpath);

		//end fitted
	};

	return render;
});