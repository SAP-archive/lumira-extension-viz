/*
 * Events
 */
define("vdn_viz_ext_3dworld-src/js/core/events", [], function() {

	return function Event() {
		var mouseLoc, rotation, _projection;
		return q = {
			setProjection: function(projection) {
				_projection = projection;
			},
			mousedown: function(e) {
			  mouseLoc = [d3.event.pageX, d3.event.pageY];
			  rotation = _projection.rotate();
			  d3.event.preventDefault();
			}, 
			mousemove: function(fn) {
			  if (mouseLoc) {
				var m1 = [d3.event.pageX, d3.event.pageY]
				  , o1 = [rotation[0] + (m1[0] - mouseLoc[0]) / 6, rotation[1] + (mouseLoc[1] - m1[1]) / 6];
				o1[1] = o1[1] > 30  ? 30  :
						o1[1] < -30 ? -30 :
						o1[1];
				_projection.rotate(o1);
				fn();
			  }
			},
			mouseup: function(fn) {
			  if (mouseLoc) {
				q.mousemove(fn);
				mouseLoc = null;
			  }
			}	
		};
	};
});