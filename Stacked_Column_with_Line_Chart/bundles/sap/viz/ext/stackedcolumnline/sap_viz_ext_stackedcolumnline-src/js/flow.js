/*<<dependency*/
define("sap_viz_ext_stackedcolumnline-src/js/flow", [ "sap_viz_ext_stackedcolumnline-src/js/module" ], function(moduleFunc) {
/*dependency>>*/
    var flowRegisterFunc = function(){
		var flow = sap.viz.extapi.Flow.createFlow({
			id : 'sap.viz.ext.stackedcolumnline',
			name : 'Stacked Column with Line Chart',
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
			id : 'sap.viz.ext.module.stackedcolumnlinemodule',
			name : 'Stacked Column with Line Module',
		});
		element.implement('sap.viz.elements.common.BaseGraphic', moduleFunc);
		/*Feeds Definition*/
		//ds1: property
		var ds1 = {
		    "id": "sap.viz.ext.module.stackedcolumnlinemodule.DS1",
		    "name": "X Axis",
		    "type": "Dimension",
		    "min": 1,
		    "max": 2,
		    "aaIndex": 1,
		    "minStackedDims": 1,
		    "maxStackedDims": Infinity
		};
		//ms1: annual_emissions, monthly_cost, Gas, Electrical
		var ms1 = {
		    "id": "sap.viz.ext.module.stackedcolumnlinemodule.MS1",
		    "name": "Y Axis",
		    "type": "Measure",
		    "min": 1,
		    "max": Infinity,
		    "mgIndex": 1
		};
		//ms2: normalised_cost
		var ms2 = {
		    "id": "sap.viz.ext.module.stackedcolumnlinemodule.MS2",
		    "name": "Y Axis 2",
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
			'propertyCategory' : 'Stacked Column with Line Module'
		});
		sap.viz.extapi.Flow.registerFlow(flow);
    };
    flowRegisterFunc.id = 'sap.viz.ext.stackedcolumnline';
    return {
        id : flowRegisterFunc.id,
        init : flowRegisterFunc
    };
});