/*
 * Color Utilities
 */
define("vdn_viz_ext_3dworld-src/js/utils/size-module", [], function() {

	var _computedMin = 10, computedMax = 30;
		
	function _getSize(value, min, max) {
		var percent = (value - min) / (max - min);
        percent = percent > 1 ? percent = 1 : percent < 0 ? percent = 0 : percent;
        return _computedMin + computedMax * percent;
	}
	
	
	return function SizeModule() {
		var _min, _max;
		return {
			setBoundaries: function(min, max) {
				_min = min,
				_max = max;
				return this;
			},
			getSize : function (value) {
				if (typeof value === "undefined" || typeof _min === "undefined" || typeof _max === "undefined") {
					return computedMax / 3;
				} else {
					return _getSize(value, _min, _max);
				}
			}
		}
	};
});