define("sap_viz_ext_sunbrustclockswitch-src/js/flow", ["sap_viz_ext_sunbrustclockswitch-src/js/module"], function(moduleFunc) {
	var flowRegisterFunc = function() {
		var flow = sap.viz.extapi.Flow.createFlow({
			id: "sap.viz.ext.sunbrustclockswitch",
			name: "SunbrustClock_switch",
			dataModel: "sap.viz.api.data.CrosstableDataset",
			type: "BorderSVGFlow"
		});

		var element = sap.viz.extapi.Flow.createElement({
			id: "sap.viz.ext.sunbrustclockswitch.PlotModule",
			name: "SunbrustClock_switch Module"
		});
		element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

		/*Feeds Definition*/
		var ds1 = {
			"id": "sap.viz.ext.sunbrustclockswitch.PlotModule.DS1",
			"name": "Status, DoorID, Date and Time",
			"type": "Dimension",
			"min": 0, //minimum number of data container
			"max": 2, //maximum number of data container
			"aaIndex": 1
		};
		element.addFeed(ds1);

		var ms1 = {
			"id": "sap.viz.ext.sunbrustclockswitch.PlotModule.MS1",
			"name": "Door Status Duration",
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
	flowRegisterFunc.id = "sap.viz.ext.sunbrustclockswitch";
	return {
		id: flowRegisterFunc.id,
		init: flowRegisterFunc
	};
});