define("limitless_viz_ext_chartwithtooltipandimage-src/js/flow", ["limitless_viz_ext_chartwithtooltipandimage-src/js/module"], function(
	moduleFunc) {
	var flowRegisterFunc = function() {
		var flow = sap.viz.extapi.Flow.createFlow({
			id: "limitless.viz.ext.chartwithtooltipandimage",
			name: "Chart with Tooltip and Image",
			dataModel: "sap.viz.api.data.CrosstableDataset",
			type: "BorderSVGFlow"
		});

		var element = sap.viz.extapi.Flow.createElement({
			id: "limitless.viz.ext.chartwithtooltipandimage.PlotModule",
			name: "Chart with Tooltip and Image Module"
		});
		element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

		/*Feeds Definition*/
		var ds1 = {
			"id": "limitless.viz.ext.chartwithtooltipandimage.PlotModule.DS1",
			"name": "X Axis",
			"type": "Dimension",
			"min": 0, //minimum number of data container
			"max": 2, //maximum number of data container
			"aaIndex": 1
		};
		element.addFeed(ds1);

		var ms1 = {
			"id": "limitless.viz.ext.chartwithtooltipandimage.PlotModule.MS1",
			"name": "Y Axis",
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
	flowRegisterFunc.id = "limitless.viz.ext.chartwithtooltipandimage";
	return {
		id: flowRegisterFunc.id,
		init: flowRegisterFunc
	};
});