define("sap_viz_ext_forecastsingleconfidence-src/js/render", [], function() {
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

		console.log(dsets);
		console.log(msets);
		console.log(data);

		var fdata = [];
		for (var i = 0; i < data.length; i++) {
			var row = {};
			row.YearMonthString = data[i][dsets[0]];
			row.ForecastBy = data[i][dsets[1]];
			row.Type = data[i][dsets[2]];
			row.Model = data[i][dsets[3]];
			row.Measure = data[i][msets[0]];
			row.CILo = data[i][msets[1]];
			row.CIHi = data[i][msets[2]];
			fdata.push(row);
		}
		console.log(fdata);

		var margin = {
			top: 20,
			right: 20,
			bottom: 50,
			left: 40
		};
		var plotWidth = width - margin.left - margin.right,
			plotHeight = height - margin.top - margin.bottom;
		//transform plot area
		vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		//create x and y scales, domains, and axes
		var x = d3.scale.ordinal().rangeRoundBands([0, plotWidth], 0);
		x.domain(fdata.map(function(d) {
			return d.YearMonthString;
		}));

		var xAxis = d3.svg.axis().scale(x).orient("bottom");

		var y = d3.scale.linear().range([plotHeight, 0]);
		y.domain([0, d3.max(fdata, function(d) {
			var maxMeasure = 0,
				maxConf = 0;
			if (d.Measure != "") maxMeasure = +d.Measure;
			if (d.CIHi != "") maxConf = +d.CIHi;
			return Math.max(maxMeasure, maxConf) + 1;
		})]);
		var yAxis = d3.svg.axis().scale(y).orient("left").ticks(6);

		// begin actuals
		var pendown = false;
		var dpath = "";
		for (i = 0; i < fdata.length - 1; i++) {
			if (fdata[i].Type == "Actuals") {
				if (!pendown) {
					dpath += "M";
					pendown = true;
				} else {
					dpath += "L";
				}
				dpath += x(fdata[i].YearMonthString);
				dpath = dpath + "," + y(+fdata[i].Measure);
			}
		}

		vis.append("g")
			.append("path")
			.attr("class", "sap_viz_ext_forecastsingleconfidence actuals")
			.attr("d", dpath);

		//end actuals

		//start conf
		pendown = false;
		dpath = "";
		for (i = 0; i < fdata.length; i++) {
			if (+fdata[i].CILo != 0) {
				if (!pendown) {
					dpath += "M";
					pendown = true;
				} else {
					dpath += "L";
				}
				dpath += x(fdata[i].YearMonthString);
				dpath = dpath + "," + y(+fdata[i].CILo);
			}
		}
		for (i = fdata.length - 1; i >= 0; i--) {
			if (+fdata[i].CIHi != 0) {
				dpath += "L";
				dpath += x(fdata[i].YearMonthString);
				dpath = dpath + "," + y(+fdata[i].CIHi);
			}
		}
		dpath += "Z";

		vis.append("g")
			.append("path")
			.attr("class", "sap_viz_ext_forecastsingleconfidence conf")
			.attr("d", dpath);

		//end conf  

		//begin forecast    
		pendown = false;
		dpath = "";
		for (i = 0; i < fdata.length; i++) {
			if (fdata[i].Type == "Forecast") {
				if (!pendown) {
					dpath += "M";
					pendown = true;
				} else {
					dpath += "L";
				}
				dpath += x(fdata[i].YearMonthString);
				dpath = dpath + "," + y(+fdata[i].Measure);
			}
		}
		//console.log(dpath); 
		vis.append("g")
			.append("path")
			.attr("class", "sap_viz_ext_forecastsingleconfidence forecast")
			.attr("d", dpath);
		//end forecast

		//draw x axis
		vis.append("g").attr("class", "sap_viz_ext_forecastsingleconfidence x axis").attr("transform", "translate(0," + plotHeight + ")").call(xAxis)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", function(d) {
				return "rotate(-55)"
			});

		//draw y axis
		vis.append("g").attr("class", "sap_viz_ext_forecastsingleconfidence y axis").call(yAxis);

		//title: combination of dimension[1] and dimension[3] (once we have a value)

		var ttitle = fdata[0].ForecastBy;
		var model = "";
		for (i = 0; i < fdata.length; i++) {
			if (fdata[i].Type == "Forecast") {
				model = fdata[i].Model;
				break;
			}
		}

		vis.append("g").attr("class", "sap_viz_ext_forecastsingleconfidence mytitle").append("text")
			.attr("transform", "translate(" + plotWidth / 2 + ", 0)").text(ttitle + " - " + model).style("text-anchor", "middle");

		//set style of axis and its ticks and text
		// $(".axis path, .axis line").css({
		// 	fill: 'none',
		// 	stroke: '#B0B0B0',
		// 	'shape-rendering': 'crispEdges'
		// });
		// $(".axis text").css({
		// 	'font-size': '10px',
		// 	'font-family': 'sans-serif'
		// });
		// $(".axis > text").css({
		// 	"font-size": "16px",
		// 	"font-weight": "bold"
		// });

		// $(".actuals").css({
		// 	fill: 'none',
		// 	stroke: '#4040A0',
		// 	'stroke-width': 2
		// });

		// $(".forecast").css({
		// 	fill: 'none',
		// 	stroke: '#0000FF',
		// 	'stroke-width': 2
		// });

		// $(".conf").css({
		// 	fill: '#C0C0C0',
		// 	stroke: '#C0C0C0',
		// 	'stroke-width': 0
		// });

		// $(".mytitle").css({
		// 	'font-size': '14px',
		// 	'font-weight': 'bold',
		// 	'font-family': 'sans-serif'
		// });

	};

	return render;
});