/*<<dependency*/
define("sap_viz_ext_footballheatmap-src/js/flow", [ "sap_viz_ext_footballheatmap-src/js/module" ], function(moduleFunc) {
/*dependency>>*/
    var flowRegisterFunc = function(){
		var flow = sap.viz.extapi.Flow.createFlow({
			id : 'sap.viz.ext.footballheatmap',
			name : 'Football Heatmap',
			dataModel : 'sap.viz.api.data.CrosstableDataset',
			type : 'DIV'
		});
		var titleElement  = sap.viz.extapi.Flow.createElement({
			id : 'sap.viz.chart.elements.Title',
			name : 'Title',
		});
		flow.addElement({
			'element':titleElement,
			'propertyCategory':'title',
			'place':'top'
		});
		var element  = sap.viz.extapi.Flow.createElement({
			id : 'sap.viz.ext.module.FootballHeatmapModule',
			name : 'Football Heatmap Module',
		});
		element.implement('sap.viz.elements.common.BaseGraphic', moduleFunc);
		/*Feeds Definition*/
		//ds1: x, y
		var ds1 = {
		    "id": "sap.viz.ext.module.FootballHeatmapModule.DS1",
		    "name": "Data Points (x,y)",
		    "type": "Dimension",
		    "min": 2,
		    "max": 2,
		    "aaIndex": 1,
		    "minStackedDims": 1,
		    "maxStackedDims": Infinity
		};
		//ms1: value
		var ms1 = {
		    "id": "sap.viz.ext.module.FootballHeatmapModule.MS1",
		    "name": "Measure",
		    "type": "Measure",
		    "min": 1,
		    "max": 1,
		    "mgIndex": 1
		};
		element.addFeed(ds1);
		element.addFeed(ms1);
		flow.addElement({
			'element':element,
			'propertyCategory' : 'Football Heatmap Module'
		});
		sap.viz.extapi.Flow.registerFlow(flow);
    };
    flowRegisterFunc.id = 'sap.viz.ext.footballheatmap';
    return {
        id : flowRegisterFunc.id,
        init : flowRegisterFunc
    };
});