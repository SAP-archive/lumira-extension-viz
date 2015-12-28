define("sap_viz_ext_bitcoins-src/js/flow", ["sap_viz_ext_bitcoins-src/js/module"], function(moduleFunc) {
	var flowRegisterFunc = function() {
		var flow = sap.viz.extapi.Flow.createFlow({
			id: "sap.viz.ext.bitcoins",
			name: "Bitcoins",
			dataModel: "sap.viz.api.data.CrosstableDataset",
			type: "BorderSVGFlow"
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
			id: "sap.viz.ext.bitcoins.PlotModule",
			name: "Bitcoins Module"
		});
		element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

		/*Feeds Definition*/
		var ds1 = {
			"id": "sap.viz.ext.bitcoins.PlotModule.DS1",
			"name": "ParentNode",
			"type": "Dimension",
			"min": 0, //minimum number of data container
			"max": 2, //maximum number of data container
			"aaIndex": 1
		};
		element.addFeed(ds1);

		var ds2 = {
			"id": "sap.viz.ext.bitcoins.PlotModule.DS2",
			"name": "ChildNode",
			"type": "Dimension",
			"min": 0, //minimum number of data container
			"max": 2, //maximum number of data container
			"aaIndex": 2
		};
		element.addFeed(ds2);

		var ms1 = {
			"id": "sap.viz.ext.bitcoins.PlotModule.MS1",
			"name": "ParentValue",
			"type": "Measure",
			"min": 0, //minimum number of measures
			"max": Infinity, //maximum number of measures
			"mgIndex": 1
		};
		element.addFeed(ms1);

		var ms2 = {
			"id": "sap.viz.ext.bitcoins.PlotModule.MS2",
			"name": "ChildValue",
			"type": "Measure",
			"min": 0, //minimum number of measures
			"max": Infinity, //maximum number of measures
			"mgIndex": 2
		};
		element.addFeed(ms2);

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
	flowRegisterFunc.id = "sap.viz.ext.bitcoins";
	return {
		id: flowRegisterFunc.id,
		init: flowRegisterFunc
	};
});