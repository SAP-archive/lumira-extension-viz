define("extendedbubblematrix-bundle", ["sap_viz_ext_extendedbubblematrix-src/js/flow",
	"css!sap_viz_ext_extendedbubblematrix-src/style/default.css"
], function(flowDefinition, cssStyleDeclaration) {
	var cssString = "",
		rules, i;
	if (cssStyleDeclaration && cssStyleDeclaration.cssRules) {
		rules = cssStyleDeclaration.cssRules;
		for (i = 0; i < rules.length; i++) {
			cssString += rules.item(i).cssText;
		}
	}
	var vizExtImpl = {
		viz: [flowDefinition],
		module: [],
		feeds: [],
		cssString: cssString
	};
	var vizExtBundle = sap.bi.framework.declareBundle({
		"id": "sap.viz.ext.extendedbubblematrix",
		"version": "1.0.1",
		"components": [{
			"id": "sap.viz.ext.extendedbubblematrix",
			"provide": "sap.viz.impls",
			"instance": vizExtImpl,
			"customProperties": {
				"name": "Extended Bubble Matrix",
				"description": "",
				"icon": {
					"path": ""
				},
				"category": [],
				"requires": [{
					"id": "sap.viz.common.core",
					"version": "5.14.0"
				}],
				"resources": [{
					"key": "sap.viz.api.env.Template.loadPaths",
					"path": "./sap_viz_ext_extendedbubblematrix-src/resources/templates"
				}]
			}
		}]
	});
	// sap.bi.framework.getService is defined in BundleLoader, which is
	// always available at this timeframe
	// in standalone mode sap.viz.js will force load and active the
	// "sap.viz.aio" bundle
	if (sap.bi.framework.getService("sap.viz.aio", "sap.viz.extapi")) {
		// if in standalone mode, sap.viz.loadBundle will be available,
		// and we load the bundle directly
		return sap.bi.framework.getService("sap.viz.aio", "sap.viz.extapi").core.registerBundle(vizExtBundle);
	} else {
		// if loaded by extension framework, return the "sap.viz.impls"
		return vizExtBundle;
	}
});