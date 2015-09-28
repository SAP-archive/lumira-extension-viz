define("sap_viz_ext_samplebar-src/js/flow", [ "sap_viz_ext_samplebar-src/js/module" ], function(moduleFunc) {
    var flowRegisterFunc = function(){
        var flow = sap.viz.extapi.Flow.createFlow({
            id : "sap.viz.ext.samplebar",
            name : "Sample Bar",
            dataModel : "sap.viz.api.data.CrosstableDataset",
            type : "BorderSVGFlow"
        });

        var titleElement  = sap.viz.extapi.Flow.createElement({
            id : "sap.viz.chart.elements.Title",
            name : "Title"
        });
        flow.addElement({
            "element":titleElement,
            "propertyCategory":"title",
            "place":"top"
        });

        var legendElement  = sap.viz.extapi.Flow.createElement({
            id : "sap.viz.chart.elements.ColorLegend",
            name : "Legend",
            dimensionIndex: [2]
        });
        flow.addElement({
            "element":legendElement,
            "propertyCategory":"legend",
            "place":"right"
        });
        
        var element  = sap.viz.extapi.Flow.createElement({
            id : "sap.viz.ext.samplebar.PlotModule",
            name : "Sample Bar Module"
        });
        element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

        /*Feeds Definition*/
        var ds1 = {
            "id": "sap.viz.ext.samplebar.PlotModule.DS1",
            "name": "Entity",
            "type": "Dimension",
            "min": 1, //minimum number of data container
            "max": 1, //maximum number of data container
            "aaIndex": 1,
            "minStackedDims": 0, //minimum number of dimensions
            "maxStackedDims": Infinity  //maximum number of dimensions
        };
        element.addFeed(ds1);
        
        var ds2 = {
            "id": "sap.viz.ext.samplebar.PlotModule.DS2",
            "name": "Date",
            "type": "Dimension",
            "min": 1, //minimum number of data container
            "max": 1, //maximum number of data container
            "aaIndex": 2,
            "minStackedDims": 0, //minimum number of dimensions
            "maxStackedDims": Infinity  //maximum number of dimensions
        };
        element.addFeed(ds2);
        
        var ms1 = {
            "id": "sap.viz.ext.samplebar.PlotModule.MS1",
            "name": "Primary Values",
            "type": "Measure",
            "min": 1, //minimum number of measures
            "max": 1, //maximum number of measures
            "mgIndex": 1
        };
        element.addFeed(ms1);
        
        flow.addElement({
            "element":element,
            "propertyCategory" : "plotArea"
        });
        sap.viz.extapi.Flow.registerFlow(flow);
    };
    flowRegisterFunc.id = "sap.viz.ext.samplebar";
    return {
        id : flowRegisterFunc.id,
        init : flowRegisterFunc
    };
});