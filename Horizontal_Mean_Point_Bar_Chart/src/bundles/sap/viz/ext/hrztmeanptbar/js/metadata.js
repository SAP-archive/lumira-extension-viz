define(["css!../css/style.css"], function(css) {
	return function() {
		return {
			id: "sap.viz.ext.hrztmeanptbar",
			name: "HorizontalMeanPointBar",
			dataType: "csv",
			bindingDefinition: [{
				"id": "sap.viz.ext.hrztmeanptbar.PlotModule.DS1",
				"name": "Category, item and others",
				"type": "Dimension",
				"min": "0",
				"max": "2",
				"role": "mark.color"
			}, {
				"id": "sap.viz.ext.hrztmeanptbar.PlotModule.MS1",
				"name": "X Axis",
				"type": "Measure",
				"min": "0",
				"max": "Infinity",
				"role": "layout.value"
			}],
			properties: {
				"plotArea.colorPalette": {
					defaultValue: d3.scale.category20().range().concat(d3.scale.category20b().range()).concat(d3.scale.category20c().range())
				}
			},
			css: css,
			builtInComponents: []
		};
	};
});