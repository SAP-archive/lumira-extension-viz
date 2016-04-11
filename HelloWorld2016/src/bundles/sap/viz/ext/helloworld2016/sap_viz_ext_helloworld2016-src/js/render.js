define("sap_viz_ext_helloworld2016-src/js/render", ["sap_viz_ext_helloworld2016-src/js/renderImage"], function(renderImage) {
	/*
	 * This function is a drawing function; you should put all your drawing logic in it.
	 * it's called in moduleFunc.prototype.render
	 * @param {Object} data - proceessed dataset, check dataMapping.js
	 * @param {Object} container - the target d3.selection element of plot area
	 * @example
	 *   container size:     this.width() or this.height()
	 *   chart properties:   this.properties()
	 *   dimensions info:    data.meta.dimensions()
	 *   measures info:      data.meta.measures()
	 */
	var render = function(data, container) {
		// TODO: add your own visualization implementation code below ...

		container.selectAll("text").remove();
		container.append("text").text("Hello World! with local module and images...")
			.classed("sap_viz_ext_helloworld2016", true);
			
		// Use the local renderImage module to add two images to the container.
		container.selectAll("g").remove();
		var imageContainer = container.append("g")
		.attr("x", 0)
		.attr("y", 125)
		.attr("width", this.width())
		.attr("height", this.height());
		renderImage(imageContainer);
	};

	return render;
});