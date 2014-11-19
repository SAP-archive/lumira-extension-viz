/*<<dependency*/
define("com_sap_sample_d3_bulletchart-src/js/flow", [ "com_sap_sample_d3_bulletchart-src/js/module" ], function(moduleFunc) {
/*dependency>>*/
    var flowRegisterFunc = function(){
		var flow = sap.viz.extapi.Flow.createFlow({
			id : 'com.sap.sample.d3.bulletchart',
			name : 'Bullet Chart',
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
			id : 'com.sap.sample.d3.bulletchartmodule',
			name : 'Bullet Chart Module',
		});
		element.implement('sap.viz.elements.common.BaseGraphic', moduleFunc);
		/*Feeds Definition*/
		//ds1: Title, Subtitle
		var ds1 = {
		    "id": "com.sap.sample.d3.bulletchartmodule.DS1",
		    "name": "Titles",
		    "type": "Dimension",
		    "min": 1,
		    "max": 2,
		    "aaIndex": 1,
		    "minStackedDims": 1,
		    "maxStackedDims": Infinity
		};
		//ms1: Actual, Pace
		var ms1 = {
		    "id": "com.sap.sample.d3.bulletchartmodule.MS1",
		    "name": "Actuals",
		    "type": "Measure",
		    "min": 1,
		    "max": Infinity,
		    "mgIndex": 1
		};
		//ms2: Target
		var ms2 = {
		    "id": "com.sap.sample.d3.bulletchartmodule.MS2",
		    "name": "Target",
		    "type": "Measure",
		    "min": 1,
		    "max": Infinity,
		    "mgIndex": 2
		};
		//ms3: Range 1, Range 2, Range 3
		var ms3 = {
		    "id": "com.sap.sample.d3.bulletchartmodule.MS3",
		    "name": "Ranges",
		    "type": "Measure",
		    "min": 1,
		    "max": Infinity,
		    "mgIndex": 3
		};
		element.addFeed(ds1);
		element.addFeed(ms1);
		element.addFeed(ms2);
		element.addFeed(ms3);
		flow.addElement({
			'element':element,
			'propertyCategory' : 'Bullet Chart Module'
		});
		sap.viz.extapi.Flow.registerFlow(flow);
    };
    flowRegisterFunc.id = 'com.sap.sample.d3.bulletchart';
    return {
        id : flowRegisterFunc.id,
        init : flowRegisterFunc
    };
});