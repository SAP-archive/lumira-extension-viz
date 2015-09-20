/*<<dependency*/
define("sap_viz_ext_googlemapsheatmap-src/js/flow", [ "sap_viz_ext_googlemapsheatmap-src/js/module" ], function(moduleFunc) {
/*dependency>>*/
    var flowRegisterFunc = function(){
		var flow = sap.viz.extapi.Flow.createFlow({
			id : 'sap.viz.ext.googlemapsheatmap',
			name : 'Google Maps (Heatmap)',
			dataModel : 'sap.viz.api.data.CrosstableDataset',
			type : 'DIV'
		});
		var element  = sap.viz.extapi.Flow.createElement({
			id : 'sap.viz.ext.module.GoogleMapsHeatmap',
			name : 'Google Maps Heatmap',
		});
		element.implement('sap.viz.elements.common.BaseGraphic', moduleFunc);
		/*Feeds Definition*/
		//ds1: Lattitude, Longtitude
		var ds1 = {
		    "id": "sap.viz.ext.module.GoogleMapsHeatmap.DS1",
		    "name": "Latitude and Longtitude",
		    "type": "Dimension",
		    "min": 1,
		    "max": 2,
		    "aaIndex": 1,
		    "minStackedDims": 1,
		    "maxStackedDims": Infinity
		};
		//ms1: Measure
		var ms1 = {
		    "id": "sap.viz.ext.module.GoogleMapsHeatmap.MS1",
		    "name": "Measure",
		    "type": "Measure",
		    "min": 1,
		    "max": Infinity,
		    "mgIndex": 1
		};
		element.addFeed(ds1);
		element.addFeed(ms1);
		flow.addElement({
			'element':element,
			'propertyCategory' : 'Google Maps Heatmap'
		});
		sap.viz.extapi.Flow.registerFlow(flow);
    };
    flowRegisterFunc.id = 'sap.viz.ext.googlemapsheatmap';
    return {
        id : flowRegisterFunc.id,
        init : flowRegisterFunc
    };
});