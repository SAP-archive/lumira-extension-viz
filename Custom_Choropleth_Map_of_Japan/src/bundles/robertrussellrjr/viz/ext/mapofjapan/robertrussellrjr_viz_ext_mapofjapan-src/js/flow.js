define("robertrussellrjr_viz_ext_mapofjapan-src/js/flow", [ "robertrussellrjr_viz_ext_mapofjapan-src/js/module" ], function(moduleFunc) {
    var flowRegisterFunc = function(){
        var flow = sap.viz.extapi.Flow.createFlow({
            id : "robertrussellrjr.viz.ext.mapofjapan",
            name : "Map of Japan",
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
            id : "robertrussellrjr.viz.ext.mapofjapan.PlotModule",
            name : "Map of Japan Module"
        });
        element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);

        /*Feeds Definition*/
        var ds1 = {
            "id": "robertrussellrjr.viz.ext.mapofjapan.PlotModule.DS1",
            "name": "Measure",
            "type": "Dimension",
            "min": 0, //minimum number of data container
            "max": 2, //maximum number of data container
            "aaIndex": 1
        };
        element.addFeed(ds1);
        
        var ms1 = {
            "id": "robertrussellrjr.viz.ext.mapofjapan.PlotModule.MS1",
            "name": "Prefecture",
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
    flowRegisterFunc.id = "robertrussellrjr.viz.ext.mapofjapan";
    return {
        id : flowRegisterFunc.id,
        init : flowRegisterFunc
    };
});