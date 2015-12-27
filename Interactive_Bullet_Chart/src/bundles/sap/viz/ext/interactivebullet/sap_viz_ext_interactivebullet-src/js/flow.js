define("sap_viz_ext_interactivebullet-src/js/flow", ["sap_viz_ext_interactivebullet-src/js/module"], function(moduleFunc) {
	var flowRegisterFunc = function() {
		var flow = sap.viz.extapi.Flow.createFlow({
			id: "sap.viz.ext.interactivebullet",
			name: "Interactive Bullet Chart",
			dataModel: "sap.viz.api.data.CrosstableDataset",
			type: "BorderSVGFlow"
		});

		var element = sap.viz.extapi.Flow.createElement({
			id: "sap.viz.ext.interactivebullet.PlotModule",
			name: "Interactive Bullet Chart Module"
		});
		element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

		/*Feeds Definition*/
		var ds1 = {
			"id": "sap.viz.ext.interactivebullet.PlotModule.DS1",
			"name": "X Axis",
			"type": "Dimension",
			"min": 0, //minimum number of data container
			"max": 2, //maximum number of data container
			"aaIndex": 1
		};
		element.addFeed(ds1);

		var ms1 = {
			"id": "sap.viz.ext.interactivebullet.PlotModule.MS1",
			"name": "Y Axis",
			"type": "Measure",
			"min": 0, //minimum number of measures
			"max": Infinity, //maximum number of measures
			"mgIndex": 1
		};
		element.addFeed(ms1);

		var ms2 = {
			"id": "sap.viz.ext.interactivebullet.PlotModule.MS2",
			"name": "Set 2",
			"type": "Measure",
			"min": 0, //minimum number of measures
			"max": Infinity, //maximum number of measures
			"mgIndex": 2
		};
		element.addFeed(ms2);

		var ms3 = {
			"id": "sap.viz.ext.interactivebullet.PlotModule.MS3",
			"name": "Set 3",
			"type": "Measure",
			"min": 0, //minimum number of measures
			"max": Infinity, //maximum number of measures
			"mgIndex": 3
		};
		element.addFeed(ms3);

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
	flowRegisterFunc.id = "sap.viz.ext.interactivebullet";
	return {
		id: flowRegisterFunc.id,
		init: flowRegisterFunc
	};
});