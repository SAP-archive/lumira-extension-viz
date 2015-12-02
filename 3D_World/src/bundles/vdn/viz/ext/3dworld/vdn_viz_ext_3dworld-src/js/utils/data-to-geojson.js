/*
 * Lumira Data to Geojson converter
 * Regarding what the user dropped in the Dimensions input
 * Format the data Lumira Engine sends us into a FeatureCollection object
 */
define("vdn_viz_ext_3dworld-src/js/utils/data-to-geojson", [], function() {
	return function DataFormatterUtil(lumiraData, dimensions, measures) {
		var geojson, 
			lng = dimensions[0],
			lat = dimensions[1];

        if (typeof lng === "undefined" || typeof lat === "undefined") {
            console.error("Missing lng or lat field");
        }
        
        geojson = {
            type : "FeatureCollection",
            features : []
        };

        lumiraData.forEach(function(datum) {
            var _lng = datum[lng];
            var _lat = datum[lat];
            if (typeof _lng !== "undefined" && typeof _lat !== "undefined") {
				_lng = _lng.replace(",", ".");
				_lat = _lat.replace(",", ".");
                var obj = {
                    type: "Feature",
                    geometry : {
                        type : "Point",
                        properties : {},
                        coordinates : [+_lng, +_lat] // lazy string to float
                    }
                };
                measures.forEach(function(measure) {
					if (datum[measure] !== _lng || datum[measure] !== _lat) {
						obj.geometry.properties[measure] = datum[measure];
					}
				});
                geojson.features.push(obj);
            }
        });
		return geojson;
	};
});