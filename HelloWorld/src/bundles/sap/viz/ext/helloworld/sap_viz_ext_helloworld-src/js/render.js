define("sap_viz_ext_helloworld-src/js/render", [], function(){
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
    var render = function(data, container, width, height, colorPalette, properties, dispatch) {
		//prepare canvas with width and height of container
		container.selectAll('svg').remove();
        var vis = container.append('svg').attr('width', width).attr('height', height)
                    .append('g').attr('class', 'vis').attr('width', width).attr('height', height);
      
        vis.append("text").text("Hello World!").attr("y",20).attr("font-size","large");
    };

    return render; 
});