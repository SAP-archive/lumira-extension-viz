define("sap_viz_ext_swotanalysiscstprp-src/js/propertyeditor/renderers/checkbox", [], function() {
	var buildPropertyTree = function(path, value) {
		var ret = {};
		if (!path || !path.length) {
			return ret;
		}
		var current = ret,
			pathArray = path.split(".");
		for (var i = 0, len = pathArray.length; i < len; i++) {
			if (i === len - 1) {
				current[pathArray[i]] = value;
			} else {
				current[pathArray[i]] = {};
				current = current[pathArray[i]];
			}
		}
		return ret;
	};

	var readProperty = function(obj, path) {
		if (!path || !path.length) {
			return obj;
		}
		var current = obj,
			pathArray = path.split(".");
		for (var i = 0, len = pathArray.length; i < len; i++) {
			if (!current) {
				return undefined;
			} else if (i === len - 1) {
				return current[pathArray[i]];
			} else {
				current = current[pathArray[i]];
			}
		}
		return undefined;
	};

	var checkBoxRenderer = function(div, proxy, config) {
		// create a simple CheckBox
		
		var oLayout = new sap.ui.commons.layout.MatrixLayout({id: config.layoutId, layoutFixed:false});

		var oLabel, oText;
		
		// First Name
		
		oLayout.createRow(
		
			oLabel = new sap.ui.commons.Label({ id : config.labelId, text: config.label , labelFor:"firstName"}),
			
			oText = new sap.ui.commons.TextField({
				id: config.fieldId, 
				required:false, 
				maxLength: 6, 
				value: "FFFFFF", 
				width: "60px",
				liveChange: function(oEvent) {
					proxy.updateProperties(buildPropertyTree(config.property, oEvent.getParameter("liveValue")));
				}
			})
		
		);
		
		oLayout.placeAt($(div));
		
		// var oTextView = new sap.ui.commons.TextView();
		// oTextView.setText("Left Top Color: #");
		// oTextView.placeAt($(div));
		// var oInput3 = new sap.ui.commons.TextField({
		// 	id: 'input3',
		// 	value : 'TextField',
		// 	tooltip : 'FFFFF',
		// 	width : '15em',
		// 	liveChange : function(oEvent){
		// 		sap.ui.getCore().getControl("TextView").setText(oEvent.getParameter("liveValue"));
		// 	}
		// }).placeAt($(div));
	};

	return checkBoxRenderer;
});