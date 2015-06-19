define("sap_viz_ext_helloworld-src/js/flow", [ "sap_viz_ext_helloworld-src/js/module" ], function(moduleFunc) {
    var flowRegisterFunc = function(){
        var flow = sap.viz.extapi.Flow.createFlow({
            id : "sap.viz.ext.helloworld",
            name : "Hello World",
            dataModel : "sap.viz.api.data.CrosstableDataset",
            type : "BorderSVGFlow"
        });

        

        
        
        var element  = sap.viz.extapi.Flow.createElement({
            id : "sap.viz.ext.helloworld.PlotModule",
            name : "Hello World Module"
        });
        element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

        /*Feeds Definition*/
        var ds1 = {
            "id": "sap.viz.ext.helloworld.PlotModule.DS1",
            "name": "Untitled Dimension Set 1",
            "type": "Dimension",
            "min": 0, //minimum number of data container
            "max": 2, //maximum number of data container
            "aaIndex": 1
        };
        element.addFeed(ds1);
        
        var ms1 = {
            "id": "sap.viz.ext.helloworld.PlotModule.MS1",
            "name": "Untitled Measure Set 1",
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
    flowRegisterFunc.id = "sap.viz.ext.helloworld";
    return {
        id : flowRegisterFunc.id,
        init : flowRegisterFunc
    };
});