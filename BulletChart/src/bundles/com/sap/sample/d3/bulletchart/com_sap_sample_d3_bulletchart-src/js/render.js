/*<<dependency*/
define("com_sap_sample_d3_bulletchart-src/js/render", ["com_sap_sample_d3_bulletchart-src/js/utils/util"], function(util){
/*dependency>>*/ 
    /**
     * This function is a drawing function; you should put all your drawing logic in it.
     * it's called in moduleFunc.prototype.render
     * @param {Object} data - data set passed in
     * @param {Object} container - target DOM element (SVG or DIV) of the plot area to render in
     * @param {float} width - width of canvas
     * @param {float} height - height of canvas
     * @param {Array of color string} colorPalette - color palette
     * @param {Object} properties - properties of chart
     * @param {Object} dispatch - event dispatcher
     */
    var render = function(data, container, width, height, colorPalette, properties, dispatch) {
		//prepare canvas with width and height of container
		container.selectAll('svg').remove();
        var vis = container.append('svg').attr('width', width).attr('height', height)
                    .append('g').attr('class', 'vis').attr('width', width).attr('height', height);

// MDL: Convert from d3.CSV to d3.JSON as expected by the bullet chart.
var fdata = [];
var meta = data.meta;
var titleFields = meta.dimensions('Titles');
var actualFields = meta.measures('Actuals');
var targetFields = meta.measures('Target');
var rangeFields = meta.measures('Ranges');

for (var i=0; i < data.length; i++) {
	var titles = [];
	var actuals = [];
	var targets = [];
	var ranges = [];
	var name;
	
	for (var j=0; j < titleFields.length; j++) {
		name = titleFields[j];
		titles.push(data[i][name]);
	}
	
	for (var j=0; j < actualFields.length; j++) {
		name = actualFields[j];
		actuals.push(data[i][name]);
	}

	for (var j=0; j < targetFields.length; j++) {
		name = targetFields[j];
		targets.push(data[i][name]);
	}

	for (var j=0; j < rangeFields.length; j++) {
		name = rangeFields[j];
		ranges.push(data[i][name]);
	}

	var row = { Titles:titles, Actuals:actuals, Target:targets, Ranges:ranges};
	fdata.push(row);
}
// MDL: end

// MDL: Added bullet width to make it easier to adapt to the page width.
// MDL: Added bullet height so can calculate the y-position for each bullet SVG.
var bulletWidth = width;
var bulletHeight = 52;
var margin = {top: 5, right: 40, bottom: 20, left: 120},
    width = bulletWidth - margin.left - margin.right,
    height = bulletHeight - margin.top - margin.bottom;
// MDL: end

var chart = d3_bullet()
    .width(width)
    .height(height);

// MDL: JSON is already embedded.
// d3.json("bullets.json", function(error, data) {
// MDL: end
  var svg = vis.selectAll("svg")
// MDL: Renamed data to fdata.
      .data(fdata)
// MDL: end
    .enter().append("svg")
      .attr("class", "bullet")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
// MDL: Y position
	  .attr("y", function(d, idx) {
			return bulletHeight * idx;
		})
// MDL: end
	  .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(chart);

  var title = svg.append("g")
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + height / 2 + ")");

  title.append("text")
      .attr("class", "title")
  // MDL: title is the first item in titles	  
      .text(function(d) { return (d.Titles && d.Titles.length > 0 ? d.Titles[0] : ""); });
  // MDL: end

  title.append("text")
      .attr("class", "subtitle")
      .attr("dy", "1em")
  // MDL: title is the second item in titles	  
      .text(function(d) { return (d.Titles && d.Titles.length > 1 ? d.Titles[1] : ""); });
  // MDL: end

// MDL: Remove randomize as the data will be passed in instead
//  d3.selectAll("button").on("click", function() {
//    svg.datum(randomize).call(chart.duration(1000)); // TODO automatic transition
//  });
// MDL: end
 
// MDL: JSON is already embedded.
//});
// MDL: end

// MDL: Remove randomize as the data will be passed in instead.
//function randomize(d) {
//  if (!d.randomizer) d.randomizer = randomizer(d);
//  // MDL: Renamed ranges to "Ranges", markers to "Target" and measures to "Actuals"
//  d.Ranges = d.Ranges.map(d.randomizer);
//  d.Target = d.Target.map(d.randomizer);
//  d.Actuals = d.Actuals.map(d.randomizer);
//  // MDL: end
//  return d;
//}
// MDL: end

// MDL: Remove randomize as the data will be passed in instead.
//function randomizer(d) {
//  // MDL: Renamed ranges to "Ranges"
//  var k = d3.max(d.Ranges) * .2;
//  // MDL: end
//  return function(d) {
//    return Math.max(0, d + k * (Math.random() - .5));
//  };
//}
// MDL: end

    };

// Chart design based on the recommendations of Stephen Few. Implementation
// based on the work of Clint Ivy, Jamie Love, and Jason Davies.
// http://projects.instantcognition.com/protovis/bulletchart/
var d3_bullet = function() {
  var orient = "left", // TODO top & bottom
      reverse = false,
      duration = 0,
      ranges = bulletRanges,
      markers = bulletMarkers,
      measures = bulletMeasures,
      width = 380,
      height = 30,
      tickFormat = null;

  // For each small multiple…
  function bullet(g) {
    g.each(function(d, i) {
      var rangez = ranges.call(this, d, i).slice().sort(d3.descending),
          markerz = markers.call(this, d, i).slice().sort(d3.descending),
          measurez = measures.call(this, d, i).slice().sort(d3.descending),
          g = d3.select(this);

      // MDL: Adjust ranges so we always have something to draw in the background.
      var maxMarker = (markerz.length > 0 ? markerz[0]: 0);    
      var maxMeasure = (measurez.length > 0 ? measurez[0] : 0);    
      var maxRanges = (rangez.length > 0 ? rangez[0] : 0);
      var maxValue = Math.max(maxMarker, maxMeasure, maxRanges);
      if (rangez.length == 0) {
          rangez.push(maxValue);
      }
      else if (rangez[0] < maxValue) {
          rangez[0] = maxValue;
      }
      // MDL: end	

      // Compute the new x-scale.
      var x1 = d3.scale.linear()
	  // MDL: domain is: 0..maxValue
          .domain([0, maxValue])
	  // MDL: end
          .range(reverse ? [width, 0] : [0, width]);

      // Retrieve the old x-scale, if this is an update.
      var x0 = this.__chart__ || d3.scale.linear()
          .domain([0, Infinity])
          .range(x1.range());

      // Stash the new scale.
      this.__chart__ = x1;

      // Derive width-scales from the x-scales.
      var w0 = bulletWidth(x0),
          w1 = bulletWidth(x1);

      // Update the range rects.
      var range = g.selectAll("rect.range")
          .data(rangez);

      range.enter().append("rect")
          .attr("class", function(d, i) { return "range s" + i; })
          .attr("width", w0)
          .attr("height", height)
          .attr("x", reverse ? x0 : 0)
        .transition()
          .duration(duration)
          .attr("width", w1)
          .attr("x", reverse ? x1 : 0);

      range.transition()
          .duration(duration)
          .attr("x", reverse ? x1 : 0)
          .attr("width", w1)
          .attr("height", height);

      // Update the measure rects.
      var measure = g.selectAll("rect.measure")
          .data(measurez);

      measure.enter().append("rect")
	  // MDL: Use the darker measure color when there is only one measure.
          .attr("class", function(d, i) { 
              var count = measurez.length;
              if (count == 1) {
                  // Only one measure so use darker color.
                  return "measure s" + 1; 
              }
              return "measure s" + i; 
          })		  
	  // MDL: end
          .attr("width", w0)
          .attr("height", height / 3)
          .attr("x", reverse ? x0 : 0)
          .attr("y", height / 3)
        .transition()
          .duration(duration)
          .attr("width", w1)
          .attr("x", reverse ? x1 : 0);

      measure.transition()
          .duration(duration)
          .attr("width", w1)
          .attr("height", height / 3)
          .attr("x", reverse ? x1 : 0)
          .attr("y", height / 3);

      // Update the marker lines.
      var marker = g.selectAll("line.marker")
          .data(markerz);

      marker.enter().append("line")
          .attr("class", "marker")
          .attr("x1", x0)
          .attr("x2", x0)
          .attr("y1", height / 6)
          .attr("y2", height * 5 / 6)
        .transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1);

      marker.transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)
          .attr("y1", height / 6)
          .attr("y2", height * 5 / 6);

      // Compute the tick format.
      var format = tickFormat || x1.tickFormat(8);

      // Update the tick groups.
      var tick = g.selectAll("g.tick")
          .data(x1.ticks(8), function(d) {
            return this.textContent || format(d);
          });

      // Initialize the ticks with the old scale, x0.
      var tickEnter = tick.enter().append("g")
          .attr("class", "tick")
          .attr("transform", bulletTranslate(x0))
          .style("opacity", 1e-6);

      tickEnter.append("line")
          .attr("y1", height)
          .attr("y2", height * 7 / 6);

      tickEnter.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "1em")
          .attr("y", height * 7 / 6)
          .text(format);

      // Transition the entering ticks to the new scale, x1.
      tickEnter.transition()
          .duration(duration)
          .attr("transform", bulletTranslate(x1))
          .style("opacity", 1);

      // Transition the updating ticks to the new scale, x1.
      var tickUpdate = tick.transition()
          .duration(duration)
          .attr("transform", bulletTranslate(x1))
          .style("opacity", 1);

      tickUpdate.select("line")
          .attr("y1", height)
          .attr("y2", height * 7 / 6);

      tickUpdate.select("text")
          .attr("y", height * 7 / 6);

      // Transition the exiting ticks to the new scale, x1.
      tick.exit().transition()
          .duration(duration)
          .attr("transform", bulletTranslate(x1))
          .style("opacity", 1e-6)
          .remove();
    });
    d3.timer.flush();
  }

  // left, right, top, bottom
  bullet.orient = function(x) {
    if (!arguments.length) return orient;
    orient = x;
    reverse = orient == "right" || orient == "bottom";
    return bullet;
  };

  // ranges (bad, satisfactory, good)
  bullet.ranges = function(x) {
    if (!arguments.length) return ranges;
    ranges = x;
    return bullet;
  };

  // markers (previous, goal)
  bullet.markers = function(x) {
    if (!arguments.length) return markers;
    markers = x;
    return bullet;
  };

  // measures (actual, forecast)
  bullet.measures = function(x) {
    if (!arguments.length) return measures;
    measures = x;
    return bullet;
  };

  bullet.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return bullet;
  };

  bullet.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return bullet;
  };

  bullet.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x;
    return bullet;
  };

  bullet.duration = function(x) {
    if (!arguments.length) return duration;
    duration = x;
    return bullet;
  };

  return bullet;
};

function bulletRanges(d) {
  // MDL: Return an empty array if the ranges property is missing.
  // MDL: Renamed ranges to "Ranges"
  return (d.Ranges ? d.Ranges : []);
  // MDL: end
}

function bulletMarkers(d) {
  // MDL: Return an empty array if the markers property is missing.
  // MDL: Renamed markers to "Target"
  return (d.Target ? d.Target : []);
  // MDL: end
}

function bulletMeasures(d) {
  // MDL: Return an empty array if the measures property is missing.
  // MDL: Renamed measures to "Actuals"
  return (d.Actuals ? d.Actuals : []);
  // MDL: end
}

function bulletTranslate(x) {
  return function(d) {
    return "translate(" + x(d) + ",0)";
  };
}

function bulletWidth(x) {
  var x0 = x(0);
  return function(d) {
    return Math.abs(x(d) - x0);
  };
}

    return render; 
});