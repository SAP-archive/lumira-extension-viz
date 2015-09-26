define("ucs_viz_ext_gauge-src/js/flow", [ "ucs_viz_ext_gauge-src/js/module" ], function(moduleFunc) {
    var flowRegisterFunc = function(){
        var flow = sap.viz.extapi.Flow.createFlow({
            id : "ucs.viz.ext.gauge",
            name : "Gauge",
            dataModel : "sap.viz.api.data.CrosstableDataset",
            type : "BorderSVGFlow"
        });

        

        
        
        var element  = sap.viz.extapi.Flow.createElement({
            id : "ucs.viz.ext.gauge.PlotModule",
            name : "Gauge Module"
        });
        element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

        /*Feeds Definition*/
        var ds1 = {
            "id": "ucs.viz.ext.gauge.PlotModule.DS1",
            "name": "Key",
            "type": "Dimension",
            "min": 0, //minimum number of data container
            "max": 2, //maximum number of data container
            "aaIndex": 1
        };
        element.addFeed(ds1);
        
        var ms1 = {
            "id": "ucs.viz.ext.gauge.PlotModule.MS1",
            "name": "Measures",
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

        flow.addElement({
            "element":element,
            "propertyCategory" : "plotArea"
        });
        sap.viz.extapi.Flow.registerFlow(flow);
    };
    flowRegisterFunc.id = "ucs.viz.ext.gauge";
    return {
        id : flowRegisterFunc.id,
        init : flowRegisterFunc
    };
});