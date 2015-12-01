define("siesta_saphackathon_viz_ext_bounceball-src/js/flow", ["siesta_saphackathon_viz_ext_bounceball-src/js/module"], function(moduleFunc) {
	var flowRegisterFunc = function() {
		var flow = sap.viz.extapi.Flow.createFlow({
			id: "siesta.saphackathon.viz.ext.bounceball",
			name: "Siesta SAP Hackathon Health",
			dataModel: "sap.viz.api.data.CrosstableDataset",
			type: "BorderSVGFlow"
		});

		var element = sap.viz.extapi.Flow.createElement({
			id: "siesta.saphackathon.viz.ext.bounceball.PlotModule",
			name: "Siesta SAP Hackathon Health Module"
		});
		element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

		/*Feeds Definition*/
		var ds1 = {
			"id": "siesta.saphackathon.viz.ext.bounceball.PlotModule.DS1",
			"name": "x_Axis",
			"type": "Dimension",
			"min": 0, //minimum number of data container
			"max": Infinity, //maximum number of data container
			"aaIndex": 1
		};
		element.addFeed(ds1);

		var ms1 = {
			"id": "siesta.saphackathon.viz.ext.bounceball.PlotModule.MS1",
			"name": "y_Axis",
			"type": "Measure",
			"min": 0, //minimum number of measures
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
	flowRegisterFunc.id = "siesta.saphackathon.viz.ext.bounceball";
	return {
		id: flowRegisterFunc.id,
		init: flowRegisterFunc
	};
});