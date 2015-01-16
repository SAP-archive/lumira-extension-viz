/*<<dependency*/
define("com_sap_sample_exoplanets-src/js/flow", [ "com_sap_sample_exoplanets-src/js/module" ], function(moduleFunc) {
/*dependency>>*/
    var flowRegisterFunc = function(){
		var flow = sap.viz.extapi.Flow.createFlow({
			id : 'com.sap.sample.exoplanets',
			name : 'Exoplanets',
			dataModel : 'sap.viz.api.data.CrosstableDataset',
			type : 'BorderSVGFlow'
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
			id : 'com.sap.sample.exoplanetsmodule',
			name : 'Exoplanets Module',
		});
		element.implement('sap.viz.elements.common.BaseGraphic', moduleFunc);
		/*Feeds Definition*/
		//ds1: name
		var ds1 = {
		    "id": "com.sap.sample.exoplanetsmodule.DS1",
		    "name": "Name",
		    "type": "Dimension",
		    "min": 1,
		    "max": 2,
		    "aaIndex": 1,
		    "minStackedDims": 1,
		    "maxStackedDims": Infinity
		};
		//ms1: radius
		var ms1 = {
		    "id": "com.sap.sample.exoplanetsmodule.MS1",
		    "name": "Radius",
		    "type": "Measure",
		    "min": 1,
		    "max": Infinity,
		    "mgIndex": 1
		};
		//ms2: distance
		var ms2 = {
		    "id": "com.sap.sample.exoplanetsmodule.MS2",
		    "name": "Distance",
		    "type": "Measure",
		    "min": 1,
		    "max": Infinity,
		    "mgIndex": 2
		};
		element.addFeed(ds1);
		element.addFeed(ms1);
		element.addFeed(ms2);
		flow.addElement({
			'element':element,
			'propertyCategory' : 'Exoplanets Module'
		});
		sap.viz.extapi.Flow.registerFlow(flow);
    };
    flowRegisterFunc.id = 'com.sap.sample.exoplanets';
    return {
        id : flowRegisterFunc.id,
        init : flowRegisterFunc
    };
});