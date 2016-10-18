define("sap_viz_ext_electionparty-src/js/flow", ["sap_viz_ext_electionparty-src/js/module"], function(moduleFunc) {
	var flowRegisterFunc = function() {
		var flow = sap.viz.extapi.Flow.createFlow({
			id: "sap.viz.ext.electionparty",
			name: "ElectionParty",
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

		// var legendElement = sap.viz.extapi.Flow.createElement({
		// 	id: "sap.viz.chart.elements.ColorLegend",
		// 	name: "Legend",
		// 	dimensionIndex: [1]
		// });
		// flow.addElement({
		// 	"element": legendElement,
		// 	"propertyCategory": "legend",
		// 	"place": "right"
		// });
		
		// var legendElement  = sap.viz.extapi.Flow.createElement({
  //          id : "sap.viz.chart.elements.ColorLegend",
  //          name : "Legend",
  //          dimensionIndex: [1]
  //      });
  //      flow.addElement({
  //          "element":legendElement,
  //          "propertyCategory":"legend",
  //          "place":"right"
  //      });

		var element = sap.viz.extapi.Flow.createElement({
			id: "sap.viz.ext.electionparty.PlotModule",
			name: "electionparty Module"
		});
		element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

		/*Feeds Definition*/
		var ds1 = {
			"id": "sap.viz.ext.electionparty.PlotModule.DS1",
			"name": "Year, Party, President",
			"type": "Dimension",
			"min": 3, //minimum number of data container
			"max": 3, //maximum number of data container
			"aaIndex": 1
		};
		element.addFeed(ds1);
		
		var ms1 = {
			"id": "sap.viz.ext.electionparty.PlotModule.MS1",
			"name": "Expenditures",
			"type": "Measure",
			"min": 1, //minimum number of measures
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
	flowRegisterFunc.id = "sap.viz.ext.electionparty";
	return {
		id: flowRegisterFunc.id,
		init: flowRegisterFunc
	};
});