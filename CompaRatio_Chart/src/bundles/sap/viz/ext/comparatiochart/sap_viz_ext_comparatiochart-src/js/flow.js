define("sap_viz_ext_comparatiochart-src/js/flow", ["sap_viz_ext_comparatiochart-src/js/module"], function(moduleFunc) {
	var flowRegisterFunc = function() {
		var flow = sap.viz.extapi.Flow.createFlow({
			id: "sap.viz.ext.comparatiochart",
			name: "CompaRatioChart",
			dataModel: "sap.viz.api.data.CrosstableDataset",
			type: "DIV"
		});

		var titleElement = sap.viz.extapi.Flow.createElement({
			id: "sap.viz.chart.elements.Title",
			name: "Title"
		});
		flow.addElement({
			"element": titleElement,
			"propertyCategory": "title",
			"place": "top"
		});

		var element = sap.viz.extapi.Flow.createElement({
			id: "sap.viz.ext.comparatiochart.PlotModule",
			name: "CompaRatioChart Module"
		});
		element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

		/*Feeds Definition*/
		var ds1 = {
			"id": "sap.viz.ext.comparatiochart.PlotModule.DS1",
			"name": "Name",
			"type": "Dimension",
			"min": 1, //minimum number of data container
			"max": Infinity, //maximum number of data container
			"aaIndex": 1
		};
		element.addFeed(ds1);

		var ms1 = {
			"id": "sap.viz.ext.comparatiochart.PlotModule.MS1",
			"name": "CurrentSalary, Min, Max",
			"type": "Measure",
			"min": 3, //minimum number of measures
			"max": Infinity, //maximum number of measures
			"mgIndex": 1
		};
		element.addFeed(ms1);

		element.addProperty({
			name: "colorPalette",
			type: "StringArray",
			supportedValues: "",
			defaultValue: d3.scale.category20().range().concat(d3.scale.category20b().range()).concat(d3.scale.category20c().range())
		});

		flow.addElement({
			"element": element,
			"propertyCategory": "plotArea"
		});
		sap.viz.extapi.Flow.registerFlow(flow);
	};
	flowRegisterFunc.id = "sap.viz.ext.comparatiochart";
	return {
		id: flowRegisterFunc.id,
		init: flowRegisterFunc
	};
});