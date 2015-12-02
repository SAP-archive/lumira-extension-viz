/*!
 * @author Vincent Dechandon <https://github.com/idawave>
 * Original idea of "3D World" with d3.js by Derek Watkins <https://github.com/dwtkns> and of course Mike Bostock <https://github.com/mbostock>
 * Link to an example of what inspired me <http://bl.ocks.org/mbostock/3795040>
 */
define("vdn_viz_ext_3dworld-src/js/core/controller-module", 
	[
		"vdn_viz_ext_3dworld-src/js/utils/path-creator-module",
		"vdn_viz_ext_3dworld-src/js/utils/color-module",
		"vdn_viz_ext_3dworld-src/js/utils/size-module",
		"vdn_viz_ext_3dworld-src/js/utils/projection-module",
		"vdn_viz_ext_3dworld-src/js/core/events",
		"vdn_viz_ext_3dworld-src/js/lib/topojson.v0"
	], 
	function(PathFactory, ColorFactory, SizeFactory, Projection, EventFactory) {
		
		/*
			Create elements
		*/
		function _CreateGlobe(svg, width, height, projection, world, path) {

			var Ocean = svg
					.append("defs")
					.append("radialGradient")
					.attr("id", "Ocean")
					.attr("cx", "75%")
					.attr("cy", "25%");
				  Ocean.append("stop").attr("offset", "5%").attr("stop-color", "#73d2e0");
				  Ocean.append("stop").attr("offset", "100%").attr("stop-color", "#a5d5cb");

			var GlobeGlow = svg
					.append("defs")
					.append("radialGradient")
					.attr("id", "GlobeGlow")
					.attr("cx", "75%")
					.attr("cy", "25%");
				  GlobeGlow.append("stop")
					.attr("offset", "5%").attr("stop-color", "#ffd")
					.attr("stop-opacity","0.6");
				  GlobeGlow.append("stop")
					.attr("offset", "100%").attr("stop-color", "#ba9")
					.attr("stop-opacity","0.2");

			var GlobeReflection = svg
					.append("defs")
					.append("radialGradient")
					.attr("id", "GlobeReflection")
					.attr("cx", "55%")
					.attr("cy", "45%");
				  GlobeReflection
					.append("stop")
					.attr("offset","30%").attr("stop-color", "#fff")
					.attr("stop-opacity","0")
				  GlobeReflection
					.append("stop")
					.attr("offset","100%").attr("stop-color", "#505962")
					.attr("stop-opacity","0.3")

			var GlobeShadow = svg
					.append("defs")
					.append("radialGradient")
					.attr("id", "GlobeShadow")
					.attr("cx", "50%")
					.attr("cy", "50%");
				  GlobeShadow
					.append("stop")
					.attr("offset","20%")
					.attr("stop-color", "#000")
					.attr("stop-opacity",".3")
				  GlobeShadow
					.append("stop")
					.attr("offset","100%").attr("stop-color", "#000")
					.attr("stop-opacity","0")  

					
			  svg.append("ellipse")
				.attr("cx", width/2)
				.attr("cy", height + (height/20))
				.attr("rx", projection.scale())
				.attr("ry", projection.scale()*.1)
				.attr("class", "noclicks")
				.style("fill", "url(#GlobeShadow)");

				

			  svg.append("circle")
				.attr("cx", width / 2).attr("cy", height / 2)
				.attr("r", projection.scale())
				.attr("class", "noclicks")
				.style("fill", "url(#Ocean)");
			  
			  svg.append("path")
				.datum(topojson.object(world, world.objects.land))
				.attr("class", "land noclicks")
				.attr("d", path);

			  svg.append("circle")
				.attr("cx", width / 2).attr("cy", height / 2)
				.attr("r", projection.scale())
				.attr("class","noclicks")
				.style("fill", "url(#GlobeGlow)");

			  svg.append("circle")
				.attr("cx", width / 2).attr("cy", height / 2)
				.attr("r", projection.scale())
				.attr("class","noclicks")
				.style("fill", "url(#GlobeReflection)");
		}
		
		function getLumiraId(el) { // TODO : move this to a utility file
			return $(el).closest("div").attr("id");
		}
		
		
		/*
			Factory
		*/
		return function Core(svg, world) {
			/*
				Private members
			*/
			var _proj, points, pointWrapper;

				var _colorField, _sizeField, _data;

			
			var _width  = +svg.attr("width"), 
				_height = +svg.attr("height");
			
			/*
				Run the dependency factories
			*/
			var Color = ColorFactory();
			
			var Event = EventFactory();
			var Size = SizeFactory();
			var Path = PathFactory(Size);
			

			/*
				Private Methods as closures
			*/			
			function _getDataBoundaries(data, field, type) {
				var min, max;
				data.features.forEach(function(datum) {
					datum = datum.geometry ? datum.geometry.properties : datum.properties;
					if (datum) {
						if (typeof min === "undefined") {
							min = datum[field];
						}
						if (typeof max === "undefined") {
							max = datum[field];
						}
						if (datum[field] < min) {
							min = datum[field];
						}
						if (datum[field] > max) {
							max = datum[field];
						}
					}
					return;
				});
				if (type === "color") {
					Color.setBoundaries(min, max);
				}
				if (type === "size") {
					Size.setBoundaries(min, max);
				}
				return;
			}
			
			function _project(width, height) {
				if (!_proj || _width !== width || _height !== height) {
					_proj = Projection(width, height);
					Path.setProjection(_proj);
					Event.setProjection(_proj);
				}
				return core;
			}
			
			function _createPointsFromData(data) {
				var data = data || _data;
				points = pointWrapper
					.data(data.features);
				points
					.enter()
					.append("path")
					.attr("class", "feature")
					.attr("d", Path.setPath);
				points
					.exit()
					.remove()
				return core;
			}
			
			function _applyColor() {
				points.attr("fill", function(datum, idx) {
					return Color.getColor(datum ? datum.geometry.properties[_colorField] : undefined);
				});
				return core;
			}
			
			function _createControls(fn) {
				
				var eventNamespace = getLumiraId(svg[0]);
				
				d3.select(window)
					.on("mousemove." + eventNamespace, Event.mousemove.bind(null, fn))
					.on("mouseup." + eventNamespace, Event.mouseup.bind(null, fn));
					

				//svg.on("mousedown", Event.mousedown, true);
				
				d3.select("div#" + eventNamespace + " svg.v-m-root").on("mousedown." + eventNamespace, Event.mousedown);

			}
			
			function _refresh() {
				svg.selectAll(".land").attr("d", Path.setPath);
				svg.selectAll(".feature").attr("d",  Path.setPath);
				return this;
			};
			
			
			
			/**
			 * Public API
			 */
			// Factory	
			function core() {
				
				_project(_width, _height);
				_CreateGlobe(svg, _width, _height, _proj, world, Path.setPath);
				_createControls(_refresh);
				pointWrapper = svg
					.append("g")
					.attr("class", "feature-wrapper")
					.selectAll("text");
				return core;
			}

			
			core.setColorField = function(field) {
				_colorField = field;
				if (_data && _colorField) {
					_getDataBoundaries(_data, _colorField, "color");
				}
				return core;
			};
			
			core.setSizeField = function(field) {
				_sizeField = field;
				Path.setSizeField(field);
				if (_data && _sizeField) {
					_getDataBoundaries(_data, _sizeField, "size");
				}
				return core;
			};
			/**
			 * Add a new dataset
			 */
			core.setData = function(data) {
				if (!data) {
					throw new Error("no data was provided");
				}
				_data = data;
				if (_data && _colorField) {
					_getDataBoundaries(_data, _colorField, "color");
				}
				if (_data && _sizeField) {
					_getDataBoundaries(_data, _sizeField, "size");
				}
				_createPointsFromData(_data);
				return core;
			};
			/**
			 * Apply a color ramp to each feature
			 */
			core.applyRamp = function() {
				_applyColor();
			};

			
			  

			return core(); // return the factory
		}
			
	}
);