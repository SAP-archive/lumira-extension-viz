define("sap_viz_ext_helloworld2016-src/js/renderImage", [], function() {
	/*
	 * Get thr URL to an image.
	 */
	var getImageUrl = function (fileName) {
		// This resource path (id) is defined in both the helloworld2016-bundle.js and preview.html files
		// In Design Studio the URL may have ?version=XXX appended to take that into account when building our URL.
		var path = sap.viz.api.env.Resource.path("sap.viz.ext.helloworld2016.images")[0];
		if (path.indexOf("?") > -1) {
			// Has "?" so add the file name before the "?, something like this: something/fileName?version=XXX
			var pathArgs = path.split("?");
			path = pathArgs[0] + "/" + fileName + "?" + pathArgs[1];
		} else {
			// No "?" so just append the file name.
			path = path + "/" + fileName;
		}
		return path;
    };

	/*
	 * This function is a test of using a local JavaScript module from render.js. ALl it does is add two images ot the container.
	 * @param {Object} container - the target d3.selection element of plot area
	 */
	var renderImage = function(container) {
		
		// Image 1.
		container.append("image")
		.attr("xlink:href", getImageUrl("Canada.png"))                         
        .attr("x", "0")
        .attr("y", "20")
        .attr("width", "40")
        .attr("height", "40");
        
        // Image 2.
		container.append("image")
		.attr("xlink:href", getImageUrl("Spain.png"))                         
        .attr("x", "50")
        .attr("y", "20")
        .attr("width", "40")
        .attr("height", "40");
	};
	
	return renderImage;
});