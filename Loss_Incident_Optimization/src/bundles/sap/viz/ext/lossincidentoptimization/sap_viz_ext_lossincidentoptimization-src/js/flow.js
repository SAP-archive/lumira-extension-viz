define("sap_viz_ext_lossincidentoptimization-src/js/flow", ["sap_viz_ext_lossincidentoptimization-src/js/module"], function(moduleFunc) {
	var flowRegisterFunc = function() {
		var flow = sap.viz.extapi.Flow.createFlow({
			id: "sap.viz.ext.lossincidentoptimization",
			name: "Loss Incident Optimization",
			dataModel: "sap.viz.api.data.CrosstableDataset",
			type: "BorderSVGFlow"
		});

		var element = sap.viz.extapi.Flow.createElement({
			id: "sap.viz.ext.lossincidentoptimization.PlotModule",
			name: "Loss Incident Optimization Module"
		});
		element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

		/*Feeds Definition*/
		var ds1 = {
			"id": "sap.viz.ext.lossincidentoptimization.PlotModule.DS1",
			"name": "Date",
			"type": "Dimension",
			"min": 0, //minimum number of data container
			"max": 1, //maximum number of data container
			"aaIndex": 1
		};
		element.addFeed(ds1);
		
		var ds2 = {
			"id": "sap.viz.ext.lossincidentoptimization.PlotModule.DS2",
			"name": "Time",
			"type": "Dimension",
			"min": 0, //minimum number of data container
			"max": 1, //maximum number of data container
			"aaIndex": 2
		};
		element.addFeed(ds2);

		var ms1 = {
			"id": "sap.viz.ext.lossincidentoptimization.PlotModule.MS1",
			"name": "Claim",
			"type": "Measure",
			"min": 0, //minimum number of measures
			"max": 1, //maximum number of measures
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
	flowRegisterFunc.id = "sap.viz.ext.lossincidentoptimization";
	return {
		id: flowRegisterFunc.id,
		init: flowRegisterFunc
	};
});