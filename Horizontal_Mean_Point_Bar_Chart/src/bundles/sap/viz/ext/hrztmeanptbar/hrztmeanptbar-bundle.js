define(["./js/chart"], function(vizExtImpl) {
	var vizExtBundle = sap.bi.framework.declareBundle({
		"id": "sap.viz.ext.hrztmeanptbar",
		"version": "1.0.1",
		"components": [{
			"id": "sap.viz.ext.hrztmeanptbar",
			"provide": "sap.viz.impls.ext",
			"instance": vizExtImpl,
			"customProperties": {
				"name": "HorizontalMeanPointBar",
				"description": " ",
				"requires": [{
					"id": "sap.viz.common.core",
					"version": "5.18.0"
				}]
			}
		}]
	});
	// register bundle to support Lumira extension framework
	if (sap.bi.framework.getService("sap.viz.aio", "sap.viz.extapi")) {
		return sap.bi.framework.getService("sap.viz.aio", "sap.viz.extapi").core.registerBundle(vizExtBundle);
	} else {
		return vizExtBundle;
	}
});