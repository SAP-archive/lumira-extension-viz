define("sap_viz_ext_powerflowmaps-src/js/render", [], function() {
	/*
	 * This function is a drawing function; you should put all your drawing logic in it.
	 * it's called in moduleFunc.prototype.render
	 * @param {Object} data - proceessed dataset, check dataMapping.js
	 * @param {Object} container - the target d3.selection element of plot area
	 * @example
	 *   container size:     this.width() or this.height()
	 *   chart properties:   this.properties()
	 *   dimensions info:    data.meta.dimensions()
	 *   measures info:      data.meta.measures()
	 */
	var render = function(data, container) {
		coords = [];
		power_countries = [];

		var width = this.width(),
			height = this.height(),
			colorPalette = this.colorPalette(),
			properties = this.properties(),
			dispatch = this.dispatch();
		//prepare canvas with width and height of container
		container.selectAll("svg").remove();
		vis = container.append("svg").attr("width", width).attr("height", height)
			.append("g").attr("class", "vis").attr("width", width).attr("height", height);

		line = d3.svg.line()
			.x(function(d) {
				return d.x;
			})
			.y(function(d) {
				return d.y;
			})
			.interpolate("bundle");

		margin = {
			top: 10,
			right: 10,
			bottom: 10,
			left: 10
		};
		plotWidth = width - margin.left - margin.right;
		plotHeight = height - margin.top - margin.bottom;
		
		//transform plot area
		vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var defs = vis.append("defs");

		defs.append("marker")
			.attr("id", "arrow_back")
			.attr("viewBox", "-2.5 -2.5 5 5")
			.attr("refX", 0)
			.attr("refY", 0)
			.attr("markerWidth", 2.5)
			.attr("markerHeight", 2.5)

		.attr("markerUnits", "strokeWidth")
			.attr("orient", "auto")
			.append("svg:path")
			.attr("d", "M 0,0 m -2.5,-2.5 L 2.5,0 L -2.5,2.5 Z")
			.attr("fill", "white");

		defs.append("marker")
			.attr("id", "arrow_front_in")
			.attr("viewBox", "-2.5 -2.5 5 5")
			.attr("refX", 0)
			.attr("refY", 0)
			.attr("markerWidth", 2.5)
			.attr("markerHeight", 2.5)

		.attr("orient", "auto")
			.append("svg:path")
			.attr("d", "M 0,0 m -2.5,-2.5 L 2.5,0 L -2.5,2.5 Z")
			.attr("fill", "orange");

		defs.append("marker")
			.attr("id", "arrow_front_out")
			.attr("viewBox", "-2.5 -2.5 5 5")
			.attr("refX", 0)
			.attr("refY", 0)
			.attr("markerWidth", 2.5)
			.attr("markerHeight", 2.5)

		.attr("orient", "auto")
			.append("svg:path")
			.attr("d", "M 0,0 m -2.5,-2.5 L 2.5,0 L -2.5,2.5 Z")
			.attr("fill", "gold");

		//Require JS block
		try {

			require.config({
				'paths': {

					'topojson': '../sap/bi/bundles/sap/viz/ext/powerflowmaps/topojson.v1.min',
					'eur': '../sap/bi/bundles/sap/viz/ext/powerflowmaps/mideurope.json'
				},
				shim: {

					topojson: {

						exports: 'topojson'
					},
					eur: {
						deps: ['topojson'],
						exports: 'eur'
					}
				}
			});

			// Define require.js module with all needed js libs
			define("runtime", function(require) {

				var topojson = require('topojson');
				var eur = require('eur');

				// return the required objects - can be used when module is used inside a require function
				return {
					topojson: topojson,
					eur: eur

				}
			});

			// Exception handling for require.js In case of an error it alerts the message. For example if gmaps could not be loaded
			require.onError = function(err) {
				if (err.requireType === 'timeout') {
					alert("error: " + err);
				} else {
					throw err;
				}
			};

			require(["runtime"], function(runt) {

				/* MAIN CODE BODY - INSIDE OF REQUIRE JS TO ENSURE TOPOJSON AND OUR MAP ARE THERE  */
				var topojson = runt.topojson;
				var eur = runt.eur;
				//var d3 = runt.d3;

				var line = d3.svg.line()
					.x(function(d) {
						return d.x;
					})
					.y(function(d) {
						return d.y;
					})
					.interpolate("bundle");

				var powerByHash = d3.map();
				data.forEach(function(d) {
					powerByHash.set(d.from + d.to, d);
				});
				//console.log(powerByHash);

				var mapkeys = powerByHash.keys();

				var countries = topojson.feature(eur, eur.objects.countries);

				//for centering map
				var projection = d3.geo.mercator()
					.scale(1)
					.translate([0, 0]);

				var path = d3.geo.path()
					.projection(projection)
					.pointRadius(3);

				var b = path.bounds(countries);
				b.s = b[0][1];
				b.n = b[1][1];
				b.w = b[0][0];
				b.e = b[1][0];
				b.height = Math.abs(b.n - b.s);
				b.width = Math.abs(b.e - b.w);
				s = 1 / Math.max((b.width / width), (b.height / height)); //.95
				t = [(width - s * (b.e + b.w)) / 2, (height - s * (b.n + b.s)) / 2];
				legendX = plotWidth - t[0];
				// console.log(s);
				// console.log(legendX);
				// console.log(plotWidth);
				projection.scale(s).translate(t);
				path = path.projection(projection);
				//end map centering
				//-----------------------------------------------
				//drawing countries. We also check whether any of the countries are relevant
				//countries for the data set. If so, fill with #888, otherwise #ccc. 
				//Also using this pass to create a list of relevant country codes for our dataset.
				//This means that for other components we can just filter the data before drawing.
				vis.selectAll(".country")
					.data(countries.features)
					.enter().append("path")
					.attr("class", function(d) {
						return "sap_viz_ext_powerflowmaps country " + d.id;
					})
					.attr("id", function(d) {
						return d.id;
					})
					.attr("d", path)
					.attr("onclick", function(d) {
						return "updateMap(\"" + d.id + "\");";
					})
					.style("fill", function(d) {
						var in_list = false;
						mapkeys.forEach(function(k) {
							if (in_list === false) {
								if (d.id === k.substring(0, 3)) {
									power_countries.push(k.substring(0, 3));
									in_list = true;
								} else if (d.id === k.substring(3, 6)) {
									power_countries.push(k.substring(3, 6));
									in_list = true;
								}
							}
						});
						if (in_list) {
							return "#888";
						} else {
							return "#ccc";
						}

					});

				//console.log(power_countries);

				//drawing all country boundaries
				vis.append("path")
					.datum(topojson.mesh(eur, eur.objects.countries, function(a, b) {
						return a !== b;
					}))
					.attr("d", path)
					.attr("class", "sap_viz_ext_powerflowmaps country-boundary");

				//create a subset of all the countries to just those that are relevant for further drawing
				var selected_countries = topojson.feature(eur, eur.objects.countries).features.filter(function(d) {
					return power_countries.indexOf(d.id) > -1;
				});
				//console.log(selected_countries);

				/*Put a country label in the center of each country
				Since we're making this pass anyway, also use this pass to store relevant
				country centroids and boundaries for each country code
				*/
				vis.selectAll(".sap_viz_ext_powerflowmaps country-label")
					.data(selected_countries)
					.enter().append("text")
					.attr("class", function(d) {
						return "sap_viz_ext_powerflowmaps country-label " + d.id;
					})
					.attr("id", function(d) {
						return "label_" + d.id;
					})
					.attr("transform", function(d) {
						var country_coords = {
							"id": d.id,
							"centroid": path.centroid(d),
							"bounds": path.bounds(d)
						};
						coords.push(country_coords);
						return "translate(" + path.centroid(d) + ")";
					})
					.attr("dy", ".35em")
					.text(function(d) {
						return d.id;
					});

				//console.log(coords);

				var powervals = []
				powerByHash.forEach(function(key, val) {
					if (val.from !== val.to) {
						powervals.push(+val.POWER);
					}
				});

				powerscale = d3.scale.linear()
					.range([2, 20])
					.domain([d3.min(powervals), d3.max(powervals)]);

				arrow_meta = [];
				powerByHash.forEach(function(key, val, map) {
					var country_loc_from = coords.filter(function(d) {
						return d.id === val.from;
					});
					var country_loc_to = coords.filter(function(d) {
						return d.id === val.to;
					});
					if (val.from !== val.to) {
						var ld = [{
							"x": country_loc_from[0].centroid[0],
							"y": country_loc_from[0].centroid[1]
						}, {
							"x": country_loc_to[0].centroid[0],
							"y": country_loc_to[0].centroid[1]
						}];
						var fromto = {
							"key": key,
							"from": val.from,
							"to": val.to,
							"line": ld,
							"power": +val.POWER
						};
						//console.log(fromto);
						arrow_meta.push(fromto);
					}
				});

				//console.log(arrow_meta);
				arrow_meta.sort(function(a, b) {
					return a.power == b.power ? 0 : +(a.power < b.power) || -1;
				});

				updateMap(coords[0].id);

			});

		} catch (Exception) {
			console.log("Error: " + Exception)
		}

	};

	return render;
});

var coords = [];
var power_countries = [];
var powerscale;
var vis;
var line;
var margin, plotWidth, plotHeight;
var legendX;

function isInArray(value, array) {
	return array.indexOf(value) > -1;
}

function formatShort(num) {
	if (Math.abs(num) / 1000000.0 > 1) {
		if (Math.abs(num) / 1000000.0 > 10) {
			return (num / 1000000.0).toFixed(0) + "M";
		} else {
			if (num < -1000000) {
				return (num / 1000000.0).toFixed(0) + "M";
			} else {
				return (num / 1000000.0).toFixed(1) + "M";
			}
		}
	} else {
		return (num / 1000.0).toFixed(0) + "K";
	}
}

function closestPoint(p, ps) {
	//console.log(p,ps);
	var cl_x = p.x,
		cl_y = p.y;
	cl_x = (Math.abs(p.x - ps[0]) < Math.abs(p.x - ps[1]) ? ps[0] : ps[1]);
	cl_y = (Math.abs(p.y - ps[2]) < Math.abs(p.y - ps[3]) ? ps[2] : ps[3]);
	if (p.x > d3.min([ps[0], ps[1]]) && p.x < d3.max([ps[0], ps[1]])) {
		cl_x = p.x;
	}
	if (p.y > d3.min([ps[2], ps[3]]) && p.y < d3.max([ps[2], ps[3]])) {
		cl_y = p.y;
	}

	return {
		"x": cl_x,
		"y": cl_y
	};
}

function findLineRatios(path, fromborder, toborder) {
	var fromratio = 0.0,
		toratio = 1.0;
	var pl = path.getTotalLength();
	var begin = path.getPointAtLength(0);
	var end = path.getPointAtLength(pl);

	var x_dir = (begin.x < end.x ? true : false);
	var y_dir = (begin.y < end.y ? true : false);
	for (var n = 0.65; n < 1; n = n + 0.02) {
		var testpoint = path.getPointAtLength(n * pl);
		if (x_dir) {
			if (testpoint.x > toborder.x) {
				if (y_dir) {
					if (testpoint.y > toborder.y) {
						toratio = n;
						break;
					}
				} else {
					if (testpoint.y < toborder.y) {
						toratio = n;
						break;
					}
				}
			}
		} else {
			if (testpoint.x < toborder.x) {
				if (y_dir) {
					if (testpoint.y > toborder.y) {
						toratio = n;
						break;
					}
				} else {
					if (testpoint.y < toborder.y) {
						toratio = n;
						break;
					}
				}
			}
		}
	}

	for (var n = 0.01; n < 0.2; n = n + 0.02) {
		var testpoint = path.getPointAtLength(n * pl);
		//console.log(testpoint);
		if (x_dir) {
			if (testpoint.x > fromborder.x) {
				break;
			}
		} else {
			if (testpoint.x < fromborder.x) {
				break;
			}
		}
		if (y_dir) {
			if (testpoint.y > fromborder.y) {
				break;
			}
		} else {
			if (testpoint.y < fromborder.y) {
				break;
			}
		}
		fromratio = n;
	}

	return {
		"from": fromratio,
		"to": toratio
	};
}

function draw_curve(Ax, Ay, Bx, By, M) {

	// side is either 1 or -1 depending on which side you want the curve to be on.
	// Find midpoint J
	var Jx = Ax + (Bx - Ax) / 2;
	var Jy = Ay + (By - Ay) / 2;

	// We need a and b to find theta, and we need to know the sign of each to make sure that the orientation is correct.
	var a = Bx - Ax;
	var asign = (a < 0 ? -1 : 1);
	var b = By - Ay;
	var bsign = (b < 0 ? -1 : 1);
	var theta = Math.atan(b / a);

	// Find the point that's perpendicular to J on side
	var costheta = asign * Math.cos(theta);
	var sintheta = asign * Math.sin(theta);

	// Find c and d
	var c = M * sintheta;
	var d = M * costheta;

	// Use c and d to find Kx and Ky
	var Kx = Jx - c;
	var Ky = Jy + d;

	return "M" + Ax + "," + Ay +
		"Q" + Kx + "," + Ky +
		" " + Bx + "," + By;
}

var updateMap = function(level) {
	//ignore any clicks on countries we don't care about:
	if (!isInArray(level, power_countries)) {
		return;
	}
	//reset all selected countries to #888
	for (var n = 0; n < power_countries.length; n++) {
		vis.select("#" + power_countries[n]).style("fill", "#888");
		//svg.select("#label_" + power_countries[n]).style("fill", "#444");
	}
	//clear all arrows currently displayed
	vis.selectAll(".arrow").remove();

	//filter only to the selected country
	var filterval = level;
	arrow_filtered = arrow_meta.filter(function(d) {
		return d.from === filterval || d.to === filterval;
	});

	//console.log(arrow_filtered);

	var sel_country = vis.select("#" + filterval);
	sel_country.style("fill", "#E06060");
	//var sel_label = svg.select("#label_" + filterval);
	//sel_label.style("fill", "#803300");

	for (var n = 0; n < arrow_filtered.length; n++) {
		var guide_arrow = vis.append("path")
			.attr("d", line(arrow_filtered[n].line))
			.attr("opacity", 0);

		a_length = guide_arrow.node().getTotalLength();
		//console.log(a_length);
		var to_meta = coords.filter(function(d) {
			return d.id === arrow_filtered[n].to;
		});
		var from_meta = coords.filter(function(d) {
			return d.id === arrow_filtered[n].from;
		});
		var tob = to_meta[0].bounds;
		tob.s = tob[0][1];
		tob.n = tob[1][1];
		tob.w = tob[0][0];
		tob.e = tob[1][0];
		var frob = from_meta[0].bounds;
		frob.s = frob[0][1];
		frob.n = frob[1][1];
		frob.w = frob[0][0];
		frob.e = frob[1][0];
		var link = arrow_filtered[n].line;
		var toborder = closestPoint(link[0], [tob.w, tob.e, tob.s, tob.n]);
		var fromborder = closestPoint(link[1], [frob.w, frob.e, frob.s, frob.n]);
		var ratios = findLineRatios(guide_arrow.node(), fromborder, toborder);

		var from = guide_arrow.node().getPointAtLength(ratios.from * a_length);
		var to = guide_arrow.node().getPointAtLength(ratios.to * a_length);
		var divfactor = 12;

		var real_arrow_back = vis.append("path")
			.attr("class", "sap_viz_ext_powerflowmaps arrow")
			.attr("d", draw_curve(from.x, from.y, to.x, to.y, (a_length / divfactor)))
			.attr("stroke", "white")
			.attr("stroke-width", powerscale(arrow_filtered[n].power) + 2)
			.attr("opacity", 0.9)
			.attr("marker-end", "url(#arrow_back)")
			.attr("fill", "none");

		var real_arrow_front = vis.append("path")
			.attr("class", "sap_viz_ext_powerflowmaps arrow")
			.attr("d", draw_curve(from.x, from.y, to.x, to.y, (a_length / divfactor)))
			.attr("stroke", function(d) {
				if (arrow_filtered[n].from === filterval) {
					return "gold";
				} else {
					return "orange";
				}
			})
			.attr("stroke-width", powerscale(arrow_filtered[n].power))
			.attr("opacity", 0.85)
			.attr("marker-end", function(d) {
				if (arrow_filtered[n].from === filterval) {
					return "url(#arrow_front_out)";
				} else {
					return "url(#arrow_front_in)";
				}
			})
			.attr("fill", "none");

	}

	//info box - first remove any that already exists
	vis.selectAll(".info").remove();

	var rows = arrow_filtered.length;
	box_height = (rows * 12) + 40; // 15 rows, plus space for "exports" and "imports" labels
	var info = vis.append("g")
		.attr("class", "sap_viz_ext_powerflowmaps info")
		.attr("transform", "translate(" + (legendX) + "," + (margin.top + 10) + ")");
	info.append("rect")
		.attr("class", "sap_viz_ext_powerflowmaps info_box")
		.attr("rx", 8)
		.attr("ry", 8)
		.attr("width", 100)
		.attr("height", box_height)
		.style("fill", "#000");

	info.append("text")
		.attr("x", 6)
		.attr("y", 12)
		.attr("class", "sap_viz_ext_powerflowmaps info_label")
		.attr("fill", "white")
		.text("Exports");

	var exports = arrow_filtered.filter(function(d) {
		return d.from === filterval;
	});
	var imports = arrow_filtered.filter(function(d) {
		return d.to === filterval;
	});
	/*
			exports.sort(function(a, b){
				return a.to == b.to ? 0 : +(a.to > b.to) || -1;
			});
			imports.sort(function(a, b){
				return a.from == b.from ? 0 : +(a.from > b.from) || -1;
			});
			*/

	for (var n = 0; n < exports.length; n++) {
		info.append("text")
			.attr("x", 12)
			.attr("y", (12 + 14) + (n * 12))
			.attr("class", "sap_viz_ext_powerflowmaps info_text")
			.attr("fill", "gold")
			.text(exports[n].to);

		info.append("text")
			.attr("x", 60)
			.attr("y", (12 + 14) + (n * 12))
			.attr("class", "sap_viz_ext_powerflowmaps info_text")
			.attr("fill", "gold")
			.text(formatShort(exports[n].power));
	}

	var new_y = (12 + 14) + (exports.length * 12) + 4;
	info.append("text")
		.attr("x", 6)
		.attr("y", new_y)
		.attr("class", "sap_viz_ext_powerflowmaps info_label")
		.attr("fill", "white")
		.text("Imports");

	for (var n = 0; n < imports.length; n++) {
		info.append("text")
			.attr("x", 12)
			.attr("y", (new_y + 14) + (n * 12))
			.attr("class", "sap_viz_ext_powerflowmaps info_text")
			.attr("fill", "orange")
			.text(imports[n].from);

		info.append("text")
			.attr("x", 60)
			.attr("y", (new_y + 14) + (n * 12))
			.attr("class", "sap_viz_ext_powerflowmaps info_text")
			.attr("fill", "orange")
			.text(formatShort(imports[n].power));
	}

}
