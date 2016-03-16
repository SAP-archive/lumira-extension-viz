define("sap_viz_ext_timelinelegend-src/js/flow", ["sap_viz_ext_timelinelegend-src/js/module"], function(moduleFunc) {
	var flowRegisterFunc = function() {
		var flow = sap.viz.extapi.Flow.createFlow({
			id: "sap.viz.ext.timelinelegend",
			name: "Timeline Legend Chart",
			dataModel: "sap.viz.api.data.CrosstableDataset",
			type: "BorderSVGFlow"
		});

		var legendElement = sap.viz.extapi.Flow.createElement({
			id: "sap.viz.chart.elements.ColorLegend",
			name: "Legend",
			dimensionIndex: [2]
		});
		flow.addElement({
			"element": legendElement,
			"propertyCategory": "legend",
			"place": "right"
		});

		var element = sap.viz.extapi.Flow.createElement({
			id: "sap.viz.ext.timelinelegend.PlotModule",
			name: "Timeline Legend Chart Module"
		});
		element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

		/*Feeds Definition*/
		var ds1 = {
			"id": "sap.viz.ext.timelinelegend.PlotModule.DS1",
			"name": "Start, end, item and tooltip",
			"type": "Dimension",
			"min": 0, //minimum number of data container
			"max": 2, //maximum number of data container
			"aaIndex": 1
		};
		element.addFeed(ds1);
		var ds2 = {
			"id": "sap.viz.ext.timelinelegend.PlotModule.DS2",
			"name": "Color(only)",
			"type": "Dimension",
			"min": 0, //minimum number of data container
			"max": 1, //maximum number of data container
			"aaIndex": 2
		};
		element.addFeed(ds2);

		var ms1 = {
			"id": "sap.viz.ext.timelinelegend.PlotModule.MS1",
			"name": "Duration",
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
		
		// Workaround as SAPUI5 uses a lower version of viz library
		// Force to bind the 1st dimension to categroy axis, and bind the 2nd dimension to color legend
		if (element.bindingDefinition) {
			Object.defineProperty(element.bindingDefinition[0], "scaleType", {
				get: function() {
					return 'categoryScale';
				}
			});
			Object.defineProperty(element.bindingDefinition[1], "scaleType", {
				get: function() {
					return 'colorScale';
				}
			});
		}
		// End of workaround

		flow.addElement({
			"element": element,
			"propertyCategory": "plotArea"
		});
		sap.viz.extapi.Flow.registerFlow(flow);
	};
	flowRegisterFunc.id = "sap.viz.ext.timelinelegend";
	return {
		id: flowRegisterFunc.id,
		init: flowRegisterFunc
	};
});