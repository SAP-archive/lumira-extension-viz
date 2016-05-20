/*<<dependency*/
define("sap_viz_ext_lossofsales-src/js/module", ["sap_viz_ext_lossofsales-src/js/render", "sap_viz_ext_lossofsales-src/js/dataMapping"], function(render, processData) {
/*dependency>>*/
    // Drawing Function used by new created module
    var moduleFunc = {
        // color palette used by chart
        _colorPalette : d3.scale.category20().range().concat(d3.scale.category20b().range()).concat(d3.scale.category20c().range()),
        //event dispatcher
        _dispatch : d3.dispatch("initialized", "startToInit", 'barData', 'selectData')
    };

    moduleFunc.dispatch = function(_){
        if(!arguments.length){
            return this._dispatch;
        }
        this._dispatch = _;
        return this;
    };

    /**
     * function of drawing chart
     */
    moduleFunc.render = function(selection) {
        //add xml ns for root svg element, so the image element can be exported to canvas
        $(selection.node().parentNode.parentNode).attr("xmlns:xlink", "http://www.w3.org/1999/xlink");
         //save instance variables to local variables because *this* is not referenced to instance in selection.each
        var that = this,
            _data = this._data,
            _width = this._width,
            _height = this._height,
            _colorPalette = this._colorPalette,
            _properties = this._props,
            _dispatch = this._dispatch,
            _feeds = this._manifest.feeds;

        _dispatch.startToInit();
        selection.each(function() {
            processData(_data, _feeds, function(err, pData) {
                if(err) {
                    alert(err);
                    return;
                }
                	render.call(that, pData, selection, _width, _height, _colorPalette, _properties, _dispatch);
            });
        });
        _dispatch.initialized({
            name : "initialized"
        });
    };

    /**
     * get/set your color palette if you support color palette
     */
    moduleFunc.colorPalette = function(_) {
        if (!arguments.length) {
            return this._colorPalette;
        }
        this._colorPalette = _;
        return this;
    };
    
    /**
     * export current extension to the specified content.
     * @param {Object} options the options for exporting content.
     * @example:
     * {
     *   type: String - current only support "svg".
     *   width: Number - the exported content will be scaled to the specific width.
     *   height: Number - the exported content will be scaled to the specific height.
     * }
     */
    moduleFunc.exportContent = function(options) {
        // add code for export the current extension to specific content type as 'svg' or 'png'
    };

    /**
     * determine if the extension support to be exported to the specific <param>contentType</param>, e.g. "svg" or "png"
     * @param {String} contentType the content type to be exported to.
     */
    moduleFunc.supportExportToContentType = function(contentType) {
        return false;
        // add code to enable export to specific content type as 'svg' or 'png'
    };

    return moduleFunc;
});