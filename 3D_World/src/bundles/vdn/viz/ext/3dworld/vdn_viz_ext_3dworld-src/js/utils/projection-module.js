/*

*/
define("vdn_viz_ext_3dworld-src/js/utils/projection-module", [], function() {
	var DEFAULT_WIDTH  = 960,
		DEFAULT_HEIGHT = 500;
	return function(width, height) { // should this be a factory ?
		width = width || DEFAULT_WIDTH;
		height = height || DEFAULT_HEIGHT;
		return d3
				.geo
				.orthographic()
				.translate([width / 2, height / 2])
				.clipAngle(90)
				.scale(height/2 + (height/18));
		
	}		
});