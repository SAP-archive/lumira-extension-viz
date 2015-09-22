define("sap_viz_ext_forecast2confidence-src/js/render", [], function() {
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

		var dsets = data.meta.dimensions(),
			msets = data.meta.measures();

		var fdata = [];
		for (var i = 0; i < data.length; i++) {
			var row = {};
			row.TimePeriod = data[i][dsets[0]];
			row.Actuals = data[i][msets[0]];
			row.Forecast = data[i][msets[1]];
			row.Lo80 = data[i][msets[2]];
			row.Hi80 = data[i][msets[3]];
			row.Lo95 = data[i][msets[4]];
			row.Hi95 = data[i][msets[5]];

			fdata.push(row);
		}

		var margin = {
			top: 20,
			right: 20,
			bottom: 60,
			left: 40
		};
		var plotWidth = width - margin.left - margin.right,
			plotHeight = height - margin.top - margin.bottom;
		//transform plot area
		vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		//create x and y scales, domains and axes
		//create x and y scales, domains, and axes
		var x = d3.scale.linear().range([0, plotWidth], 0);
		x.domain([d3.min(fdata, function(d) {
				return +d.TimePeriod;
			}),
			d3.max(fdata, function(d) {
				return +d.TimePeriod;
			})
		]);

		var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5).tickFormat(d3.format("0000"));

		var y = d3.scale.linear().range([plotHeight, 0]);
		y.domain([0, d3.max(fdata, function(d) {
			var maxActuals = 0,
				maxForecast = 0,
				maxConf = 0;
			if (d.Actuals != "") maxActuals = +d.Actuals;
			if (d.Forecast != "") maxForecast = +d.Forecast;
			if (d.Hi95 != "") maxConf = +d.Hi95;
			return Math.max(maxActuals, maxForecast, maxConf) + 1;
		})]);
		var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);

		// begin actuals
		var pendown = false;
		var dpath = "";
		for (i = 0; i < fdata.length - 1; i++) {
			if (fdata[i].Actuals != "") {
				if (!pendown) {
					dpath += "M";
					pendown = true;
				} else {
					dpath += "L";
				}
				dpath += x(+fdata[i].TimePeriod);
				dpath = dpath + "," + y(+fdata[i].Actuals);
			}
		}

		vis.append("g")
			.append("path")
			.attr("class", "sap_viz_ext_forecast2confidence actuals")
			.attr("d", dpath);

		//end actuals

		//start conf95p
		pendown = false;
		dpath = "";
		for (i = 0; i < fdata.length; i++) {
			if (+fdata[i].Lo95 != 0) {
				if (!pendown) {
					dpath += "M";
					pendown = true;
				} else {
					dpath += "L";
				}
				dpath += x(+fdata[i].TimePeriod);
				dpath = dpath + "," + y(+fdata[i].Lo95);
			}
		}
		for (i = fdata.length - 1; i >= 0; i--) {
			if (+fdata[i].Hi95 != 0) {
				dpath += "L";
				dpath += x(+fdata[i].TimePeriod);
				dpath = dpath + "," + y(+fdata[i].Hi95);
			}
		}
		dpath += "Z";

		//console.log(dpath);
		vis.append("g")
			.append("path")
			.attr("class", "sap_viz_ext_forecast2confidence conf95p")
			.attr("d", dpath);

		//end conf95p 
		//start conf80p
		pendown = false;
		dpath = "";
		for (i = 0; i < fdata.length; i++) {
			if (+fdata[i].Lo80 != 0) {
				if (!pendown) {
					dpath += "M";
					pendown = true;
				} else {
					dpath += "L";
				}
				dpath += x(+fdata[i].TimePeriod);
				dpath = dpath + "," + y(+fdata[i].Lo80);
			}
		}
		for (i = fdata.length - 1; i >= 0; i--) {
			if (+fdata[i].Hi80 != 0) {
				dpath += "L";
				dpath += x(+fdata[i].TimePeriod);
				dpath = dpath + "," + y(+fdata[i].Hi80);
			}
		}
		dpath += "Z";

		//console.log(dpath);
		vis.append("g")
			.append("path")
			.attr("class", "sap_viz_ext_forecast2confidence conf80p")
			.attr("d", dpath);

		//end conf80p 

		//begin forecast    
		pendown = false;
		dpath = "";
		for (i = 0; i < fdata.length; i++) {
			if (fdata[i].Forecast != "") {
				if (!pendown) {
					dpath += "M";
					pendown = true;
				} else {
					dpath += "L";
				}
				dpath += x(+fdata[i].TimePeriod);
				dpath = dpath + "," + y(+fdata[i].Forecast);
			}
		}
		//console.log(dpath); 
		vis.append("g")
			.append("path")
			.attr("class", "sap_viz_ext_forecast2confidence forecast")
			.attr("d", dpath);
		//end forecast

		//draw x axis
		vis.append("g").attr("class", "sap_viz_ext_forecast2confidence x axis").attr("transform", "translate(0," + plotHeight + ")").call(xAxis);

		//draw y axis
		vis.append("g").attr("class", "sap_viz_ext_forecast2confidence y axis").call(yAxis);

	};

	return render;
});