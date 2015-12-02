/*<<dependency*/
define("vdn_viz_ext_3dworld-src/js/module", ["vdn_viz_ext_3dworld-src/js/render", "vdn_viz_ext_3dworld-src/js/dataMapping"], function(render, processData) {
/*dependency>>*/
    // Extension module implementation
    var moduleFunc = {
        _colorPalette: d3.scale.category20().range().concat(d3.scale.category20b().range()).concat(d3.scale.category20c().range()),
        _dispatch: d3.dispatch("initialized", "startToInit", "barData", "selectData"),

        render: function(selection) {
            //add xml ns for root svg element, so the image element can be exported to canvas
            $(selection.node().parentNode.parentNode).attr("xmlns:xlink", "http://www.w3.org/1999/xlink");
            
            var that = this,
                dispatch = this.dispatch(),
                feeds = this.feeds(),
                data = this.data();

            dispatch.startToInit();
            selection.each(function() {
                processData(data, feeds, function(err, pData) {
                    if (err) {
                        throw err;
                    }
                    render.call(that, pData, selection);
                });
            });
            dispatch.initialized({
                name: "initialized"
            });
        },
        dispatch: function(_){
            if(!arguments.length){
                return this._dispatch;
            }
            this._dispatch = _;
            return this;
        },
        colorPalette: function(_) {
            if (!arguments.length) {
                return this._colorPalette;
            }
            this._colorPalette = _;
            return this;
        },
        feeds: function() {
            return this._manifest.feeds;
        }
    };
    /*
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
        // TODO:  add your own code below to export the current extension to specific content type as 'svg' or 'png'.
    };

    /*
     * determine if the extension support to be exported to the specific <param>contentType</param>, e.g. "svg" or "png"
     * @param {String} contentType the content type to be exported to.
     */
    moduleFunc.supportExportToContentType = function(contentType) {
        return false;
        // TODO: add your own code below to enable export to specific content type as 'svg' or 'png'.
    };

    return moduleFunc;
})