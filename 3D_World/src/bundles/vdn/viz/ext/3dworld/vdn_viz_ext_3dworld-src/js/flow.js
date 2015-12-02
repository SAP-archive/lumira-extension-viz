define("vdn_viz_ext_3dworld-src/js/flow", [ "vdn_viz_ext_3dworld-src/js/module" ], function(moduleFunc) {
    var flowRegisterFunc = function(){
		var flow = sap.viz.extapi.Flow.createFlow({
			id : "vdn.viz.ext.3dworld",
			name : "3D World",
			dataModel : "sap.viz.api.data.CrosstableDataset",
			type : "SVG"
		});
		var element  = sap.viz.extapi.Flow.createElement({
			id : "sap.viz.ext.module.3DWorldModule",
			name : "3D World Module"
		});
		element.implement("sap.viz.elements.common.BaseGraphic", moduleFunc);
		/*Feeds Definition*/
		var LngLatFeed = {
		    "id": "vdn.viz.ext.module.3DWorldModule.DS1", // Can't change the id from DS1 or Lumira fails to load the extension (cannot read property length of undefined)
		    "name": "Lng/Lat",
		    "type": "Dimension",
		    "min": 0,
		    "max": 2,
		    "aaIndex": 1,
		    "minStackedDims": 1,
		    "maxStackedDims": Infinity
		};
		element.addFeed(LngLatFeed);
		
		var SizeFeed = {
		    "id": "vdn.viz.ext.module.3DWorldModule.Size", // But still can change ids of measures... Why?
		    "name": "Size",
		    "type": "Measure",
		    "min": 0,
		    "max": 1,
		    "mgIndex": 1
		};
		element.addFeed(SizeFeed);
		
		var ColorFeed = {
		    "id": "vdn.viz.ext.module.3DWorldModule.Color",
		    "name": "Color",
		    "type": "Measure",
		    "min": 0,
		    "max": 1,
		    "mgIndex": 2
		};
		element.addFeed(ColorFeed);
		
		flow.addElement({
			"element":element,
			"propertyCategory" : "plotArea"
		});
		sap.viz.extapi.Flow.registerFlow(flow);
    };
    flowRegisterFunc.id = "vdn.viz.ext.3dworld";
    return {
        id : flowRegisterFunc.id,
        init : flowRegisterFunc
    };
});