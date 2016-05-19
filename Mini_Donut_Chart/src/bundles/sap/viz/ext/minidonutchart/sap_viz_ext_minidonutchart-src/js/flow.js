define("sap_viz_ext_minidonutchart-src/js/flow", [ "sap_viz_ext_minidonutchart-src/js/module" ], function(moduleFunc) {
    var flowRegisterFunc = function(){
        var flow = sap.viz.extapi.Flow.createFlow({
            id : "sap.viz.ext.minidonutchart",
            name : "Mini Donut Chart",
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

        
        
        var element  = sap.viz.extapi.Flow.createElement({
            id : "sap.viz.ext.minidonutchart.PlotModule",
            name : "Mini Donut Chart Module"
        });
        element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

        /*Feeds Definition*/
        var ms1 = {
            "id": "sap.viz.ext.minidonutchart.PlotModule.MS1",
            "name": "Measure",
            "type": "Measure",
            "min": 1, //minimum number of measures
            "max": 1, //maximum number of measures
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
    flowRegisterFunc.id = "sap.viz.ext.minidonutchart";
    return {
        id : flowRegisterFunc.id,
        init : flowRegisterFunc
    };
});