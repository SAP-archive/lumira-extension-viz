/*<<dependency*/
define("vdn_viz_ext_3dworld-src/js/dataMapping", ["vdn_viz_ext_3dworld-src/js/utils/util"], function(util){
/*dependency>>*/
    var processData = function(data, feeds, done) {
        // Build name index so that dimension/measure sets can be accessed by name
        util.buildNameIdx(feeds);
        /*
         * mapper function is optional and used to customize your data conversion logic, for example, 
         * you can map from object array to a simplified x-y value array as below, 
         *
         *     var mapper = function(d, meta) {
         *         var val = parseFloat(d[meta.measures(0, 0)]);
         *         mems = [];
         *         $.each(meta.dimensions(), function(idx, dim) {
         *             mems.push(d[dim]);
         *        });
         *       return [mems.join(" / "), val];
         *     }
         */
        var mapper = function(d) {
            return d;
        };
        // convert data into an object array, which is compatible to the return of
        // d3.csv() by default. Each data row is converted into attributes of an object.
        util.toTable(data, mapper, function(err, pData) {
            if(err) {
                return done(err, null);
            } else if(!pData) {
                return done("Empty data", null);
            }
            return done(null, pData);
        });
    };
    return processData;
})