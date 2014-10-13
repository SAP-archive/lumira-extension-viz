/*<<dependency*/
define("sap_viz_ext_helloworld-src/js/render", ["sap_viz_ext_helloworld-src/js/utils/util"], function(util){
/*dependency>>*/ 
    /**
     * This function is a drawing function; you should put all your drawing logic in it.
     * it's called in moduleFunc.prototype.render
     * @param {Object} data - data set passed in
     * @param {Object} container - target DOM element (SVG or DIV) of the plot area to render in
     * @param {float} width - width of canvas
     * @param {float} height - height of canvas
     * @param {Array of color string} colorPalette - color palette
     * @param {Object} properties - properties of chart
     * @param {Object} dispatch - event dispatcher
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