define("sap_viz_ext_lossofsales-src/js/flow", ["sap_viz_ext_lossofsales-src/js/module"], function(moduleFunc) {
	var flowRegisterFunc = function() {
		var flow = sap.viz.extapi.Flow.createFlow({
			id: "sap.viz.ext.lossofsales",
			name: "Loss of Sales Chart",
			dataModel: "sap.viz.api.data.CrosstableDataset",
			type: "BorderSVGFlow"
		});

		var element = sap.viz.extapi.Flow.createElement({
			id: "sap.viz.ext.lossofsales.PlotModule",
			name: "Loss of Sales Chart Module"
		});
		element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

		/*Feeds Definition*/
		var ds1 = {
			"id": "sap.viz.ext.lossofsales.PlotModule.DS1",
			"name": "Product Name",
			"type": "Dimension",
			"min": 1, //minimum number of data container
			"max": 2, //maximum number of data container
			"aaIndex": 1
		};
		element.addFeed(ds1);

		var ms1 = {
		    "id": "sap.viz.ext.module.LossofSalesModule.MS1",
		    "name": "Actual Stock",
		    "type": "Measure",
		    "min": 1,
		    "max": 1,
		    "mgIndex": 1
		};
		var ms2 = {
		    "id": "sap.viz.ext.module.LossofSalesModule.MS2",
		    "name": "Forecasted Stock",
		    "type": "Measure",
		    "min": 1,
		    "max": 1,
		    "mgIndex": 2
		};
		var ms3 = {
		    "id": "sap.viz.ext.module.LossofSalesModule.MS3",
		    "name": "Actual Sale",
		    "type": "Measure",
		    "min": 1,
		    "max": 1,
		    "mgIndex": 3
		};
		var ms4 = {
		    "id": "sap.viz.ext.module.LossofSalesModule.MS4",
		    "name": "Forecasted Sale",
		    "type": "Measure",
		    "min": 1,
		    "max": 1,
		    "mgIndex": 4
		};
		element.addFeed(ms1);
		element.addFeed(ms2);
		element.addFeed(ms3);
		element.addFeed(ms4);

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
	flowRegisterFunc.id = "sap.viz.ext.lossofsales";
	return {
		id: flowRegisterFunc.id,
		init: flowRegisterFunc
	};
});