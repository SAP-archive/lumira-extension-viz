/*
 * Color Utilities
 */
define("vdn_viz_ext_3dworld-src/js/utils/color-module", [], function() {
	var DEFAULT_START_COLOR = {
		r : 255,
		g : 255,
		b : 0
	},
		DEFAULT_END_COLOR   = {
			r : 255,
			g : 0,
			b : 0
		},
		DEFAULT_COLOR       = "rgb(35,113,113)";
		
		
	function _rgbToHex() {
		/*
			Useful link for understanding :  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
		   
			Explanation :
			-------------          

			g << 8 multiplies g by 256, adding two zeroes to the end of its hex representation. 
			Same for r << 16, adding four zeroes. 
			Adding 1 << 24 (1000000 in hex) ensures that the hex representation is left-padded with any required zeroes once the leading 1 is stripped off using slice(). 
			For example, if r and g were both zero and b was 51, ((r << 16) + (g << 8) + b).toString(16) would return the string "33"; add 1 << 24 and you get "1000033". 
			Then strip the 1 and you have the hex representation.
			
		*/
		var r = arguments[0];
		var g = arguments[1];
		var b = arguments[2];
		return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	};	
		
		
	function _getColorFromRamp(value, min, max) {
		var percent = (value - min) / (max - min);
		
		var newRedValue   = DEFAULT_END_COLOR.r - DEFAULT_START_COLOR.r,
        newGreenValue = DEFAULT_END_COLOR.g - DEFAULT_START_COLOR.g,
        newBlueValue  = DEFAULT_END_COLOR.b - DEFAULT_START_COLOR.b;

		newRedValue   = parseInt((newRedValue * percent) + DEFAULT_START_COLOR.r);
		newGreenValue = parseInt((newGreenValue * percent) + DEFAULT_START_COLOR.g);
		newBlueValue  = parseInt((newBlueValue * percent) + DEFAULT_START_COLOR.b);

		return "#" + _rgbToHex(newRedValue, newGreenValue, newBlueValue);
			
	}
	
	return function ColorModule() {
		var _min, _max;
		return {
			setBoundaries: function(min, max) {
				_min = min,
				_max = max;
				return this;
			},
			getColor : function (value) {
				if (typeof value === "undefined") {
					return DEFAULT_COLOR;
				} else {
					return _getColorFromRamp(value, _min, _max);
				}
			}
		}
	};
});