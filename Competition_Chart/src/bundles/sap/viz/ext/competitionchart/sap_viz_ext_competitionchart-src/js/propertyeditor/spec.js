define("sap_viz_ext_competitionchart-src/js/propertyeditor/spec", ["sap_viz_ext_competitionchart-src/js/propertyeditor/renderers/checkbox"], function(checkBoxRenderer) {
	//property editor spec
	var spec = {
		"id": "sample.openpe.extension",
		"dependencies": [],
		"components": [{
			"id": "sample.openpe.competitionchart.extension",
			"provide": "sap.viz.controls.propertyeditor.view",
			"instance": {
				'charts': ['sap.viz.ext.competitionchart'],
				'view': {
					'sections': [{
						"id": "sap.viz.controls.propertyeditor.section.chart_title",
						"caption": 'EXTEND_CHART_TITLE',
						"propertyZone": "CHART_TITLE",
						"groups": [{
							"id": "sap.viz.controls.propertyeditor.section.chart_title.group.title.visible",
							"type": "sap.viz.controls.propertyeditor.groupImpl.SwitchGroup",
							"config": {
								"property": "title.visible",
								"label": "Show Chart Title"
							}
						}]
						}, {
						"id": "sap.viz.controls.propertyeditor.section.legend",
						"caption": 'EXTEND_LEGEND',
						"propertyZone": "LEGEND",
						"groups": [{
							"id": "sap.viz.controls.propertyeditor.section.legend.group.legend.visible",
							"type": "sap.viz.controls.propertyeditor.groupImpl.SwitchGroup",
							"config": {
								"property": "legend.visible",
								"label": "PROPERTY_EDITOR_SHOW_LEGEND"
							}
						}, {
							"id": "sap.viz.controls.propertyeditor.section.legend.group.legend.title.visible",
							"type": "sap.viz.controls.propertyeditor.groupImpl.SwitchGroup",
							"config": {
								"property": "legend.title.visible",
								"label": "PROPERTY_EDITOR_SHOW_LEGEND_TITLE",
								"visibleBinding": "legend.visible"
							}
						}]
					}, {
						'id': 'sap.viz.controls.propertyeditor.section.plotArea',
						'propertyZone': 'PLOTAREA',
						'caption': 'EXTEND_PLOT_AREA',
						"groups": [{
							"id": "sap.viz.controls.propertyeditor.section.plotArea.group.gridline.visible",
							'renderer': checkBoxRenderer,
							"config": {
								"property": "plotArea.gridline.visible",
								"label": "Show Grid Line"
							}
						}, {
							"id": "sap.viz.controls.propertyeditor.section.plotArea.group.animation.dataLoading",
							'renderer': checkBoxRenderer,
							"config": {
								"property": "plotArea.animation.dataLoading",
								"label": "Enable Data Loading Animation"
							}
						}]
					}]
				}
			}
		}]
	};
	return spec;
});