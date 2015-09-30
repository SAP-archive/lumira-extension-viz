/*<<dependency*/
define("sap_viz_ext_geomapsleaflet-src/js/flow", [ "sap_viz_ext_geomapsleaflet-src/js/module" ], function(moduleFunc) {
/*dependency>>*/
    var flowRegisterFunc = function(){
		var flow = sap.viz.extapi.Flow.createFlow({
			id : "sap.viz.ext.geomapsleaflet",
			name : "Geo Maps (Leaflet)",
			dataModel : "sap.viz.api.data.CrosstableDataset",
			type : "DIV"
		});
		var element  = sap.viz.extapi.Flow.createElement({
			id : "sap.viz.ext.module.GeoMapsLeaflet",
			name : "Geo Maps (Leaflet)"
		});
		element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);
		
        element.addProperty({  
            name: "colorPalette",  
            type: "StringArray",  
            supportedValues: "",  
            defaultValue: d3.scale.category20().range().concat(d3.scale.category20b().range()).concat(d3.scale.category20c().range())  
        });  
        
        /*Feeds Definition*/
		//ds1: Name, Lattitude, Longtitude
		var ds1 = {
		    "id": "sap.viz.ext.module.GeoMapsLeaflet.DS1",
		    "name": "X Axis",
		    "type": "Dimension",
		    "min": 1,
		    "max": 2,
		    "aaIndex": 1,
		    "minStackedDims": 1,
		    "maxStackedDims": Infinity
		};
		element.addFeed(ds1);
		
		//ms1: Measure
		var ms1 = {
		    "id": "sap.viz.ext.module.GeoMapsLeaflet.MS1",
		    "name": "Y Axis",
		    "type": "Measure",
		    "min": 1,
		    "max": Infinity,
		    "mgIndex": 1
		};
		element.addFeed(ms1);
		
		flow.addElement({
			"element":element,
			"propertyCategory" : "plotArea"
		});
		sap.viz.extapi.Flow.registerFlow(flow);
    };
    flowRegisterFunc.id = "sap.viz.ext.geomapsleaflet";
    return {
        id : flowRegisterFunc.id,
        init : flowRegisterFunc
    };
});