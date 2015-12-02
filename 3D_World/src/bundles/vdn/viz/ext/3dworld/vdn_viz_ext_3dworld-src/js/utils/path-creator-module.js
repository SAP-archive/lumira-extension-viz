/**
 *
 */
define("vdn_viz_ext_3dworld-src/js/utils/path-creator-module", [], function() {
	
	
	return function Path(Size) {
		var _projection, _field;
		return {
			setProjection : function(projection) {
				_projection = projection;
			},
			setSizeField : function(field) {
				_field = field;
			},
			setPath : function(datum, idx) { // Wrapper for d3 path creation
				if (!_projection) {
					throw new Error("projection is not defined");
				}
				return d3.geo.path().projection(_projection).pointRadius(_field && datum.geometry ? Size.getSize(datum.geometry.properties[_field]) : 8).call(this, datum); // we have to apply the context and parameter manually coz the wrapper :-/
			}
		}
	}
	
});

