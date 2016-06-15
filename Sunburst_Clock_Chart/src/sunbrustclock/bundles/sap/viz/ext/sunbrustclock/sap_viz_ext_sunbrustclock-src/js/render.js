define("sap_viz_ext_sunbrustclock-src/js/render", [], function() {
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
	// TODO: add your own visualization implementation code below ...
			var margin = {	top: 5, right: 5,	bottom: 5,	left: 5 },
			width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom;
// 		var	colorPalette = this.colorPalette(),
// 			dispatch = this.dispatch;
		var status = data.meta.dimensions(0)[0],
			doorId = data.meta.dimensions(0)[1],
			date = data.meta.dimensions(0)[2],
			localTime = data.meta.dimensions(0)[3];
		var status_secs =  data.meta.measures(0)[0];

		var newObject = d3.nest()
			.key(function(d) {
				return d[doorId]; // Incase there is space in stage name
			})
            .sortKeys(d3.ascending)
			.entries(data);
			
		for(var i in newObject){
			newObject[i].children = newObject[i].values;
            newObject[i].children.sort(function(a,b){
                return new Date(a[date] + " " + a[localTime]) - new Date(b[date] + " " + b[localTime]);
            });
		}
		
		var newObject2 = d3.nest()
			.key(function(d) {
				return d[status]; // Incase there is space in stage name
			})
			.sortKeys(d3.ascending)
			.entries(data);
        
		var root = {"key":"DoorStatus", "children": newObject};
			
        // An SVG element with a bottom-right origin.
        container.selectAll("g").remove();
		var svg = container
		    .attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("class", "sunbrustclock")
		    .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");
		
		var radiusGap = 20,
		    outterRadius = Math.min(width, height) / 2 - Math.max(margin.left, margin.right, margin.top, margin.bottom) * 2,
		    sunbrustRadius = outterRadius - radiusGap * 2,
		    innerRadius = sunbrustRadius/2 + 20,
            tooltipWidth = 140,
            tooltipHeight = 60;
		
		// data for day clock
		var innerData = [{ "key": "Door Shut", "value": 50, "text": ["PP%", "Door Shut"] }, 
		                 { "key": "Door Cycles", "value": 50, "text": ["13", "Door Cycles"] }];
		var clockData = [{ "key": "0-6", "value": 50, "text": "6hrs" }, 
		                 { "key": "6-12", "value": 50, "text": "12hrs" },  
		                 { "key": "12-18", "value": 50, "text": "18hrs" },  
		                 { "key": "18-0", "value": 50, "text": "0hrs" }];

		// scale for sunbrust data
		var x = d3.scale.linear().range([0, 2 * Math.PI]),
		    y = d3.scale.sqrt().range([0, sunbrustRadius]);

		// day clock color setup
		var innerColor = d3.scale.ordinal()
		            .domain(innerData.map(function(d){ return d.key; }))
		            .range(["#FFB400", "#FA7921"]),
		    clockColor = d3.scale.ordinal()
		            .domain(clockData.map(function(d){ return d.key; }))
		            .range(["#2C8C99", "#42D9C8"]);

		var partition = d3.layout.partition().sort(null)
		    .value(function(d) { return 1; });

		var arc = d3.svg.arc()
		    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
		    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
		    .innerRadius(function(d) {   return Math.max(0, y(d.y)); })
		    .outerRadius(function(d) {    return Math.max(0, y(d.y + d.dy));  });
    
		// svg container
		var dayClock = svg.append("g").attr("class", "dayClock");
		var sunbrustChart = svg.append("g").attr("class", "sunbrust");
		var doorShutInfo = svg.append("g").attr("class", "doorShutInfo");
        var tooltip = svg.append("g").attr("class", "sunbrustTooltip");
		tooltip.append("rect").attr("class", "label");

		var tipcontent = tooltip.append("g")
			.attr("class", "label_detail");
		tipcontent.append("text").attr("class", "project");
		tipcontent.append("text").attr("class", "info1");
		tipcontent.append("text").attr("class", "info2");
		
		// Keep track of the node that is currently being displayed as the root.
		var node = undefined;
		var doorCyctles = 0, closeBefore = true,
		    doorShuts = 0, doorTotal = 0;
    
    	node = root;
        var sunbrustColor = d3.scale.ordinal()
	            .domain(root.children[0].children.map(function(d){ return d[status]; }))
	            .range(["#e5e059", "#bdd358", "#999799", "#e5625e", "#006ba6", "#0496ff", "#ffbc42", "#d81159", "#8f2d56"]);
        
    	var path = sunbrustChart.datum(root)
          .selectAll("path")
          .data(partition.nodes)
          .enter()
          .append("path")
          .filter(function(d,i){
              if(!d.children){
                  doorTotal++;
                  if(closeBefore && d[status] !== "Close Limit"){ doorCyctles++; } 
                  if(d[status] === "Close Limit"){doorShuts++; closeBefore = true; }
                  else{ closeBefore = false; }
              }
              return d[status] !== "Close Limit"; 
          })
          .attr("d", arc)
          .style("fill", function(d) { 
              return d[status]?( d[status] === "Open Limit" ? "#fff" : sunbrustColor(d[status])) : "#fff"; 
          })
          .on("click", click)
          .on('mouseover', function(d) {
				d3.select(this).attr('opacity', 0.8).attr("font-size", "1.4em").attr("font-weight", "bold");
              
				var centroid = d3.select(this).node().getBBox();
//				tooltip.attr("transform", "translate(" + (parseFloat(centroid[0]) + subStageWidth/3) + "," + (parseFloat(centroid[1]) - 40) +")").style("opacity", 1);
				tooltip.attr("transform", "translate(" + (centroid.x + tooltipWidth/3) + "," + (centroid.y - tooltipHeight/3) + ")")
                    .style("opacity", 1);
				
				tooltip.select('.label').attr("x", 0).attr("width", tooltipWidth).attr("y",0) .attr("height", tooltipHeight).attr("rx", 2).attr("ry", 2).attr("opacity", .7);
				   
				tipcontent.select('.project').attr("font-size", "1.2em").attr("dy","1.4em").attr("x", 10).text(d[status]);
				tipcontent.select('.info1').attr("dy","2.6em").attr("x", 10).text("Date: " + d[localTime]);
				tipcontent.select('.info2').attr("dy","3.8em").attr("x", 10).text("DoorID: " + d[doorId]);
			})
			.on('mouseout', function(){
				d3.select(this).attr('opacity', 1).attr("font-size", "1.1em").attr("font-weight", "400");
			    tooltip.style("opacity", 0);
			})
          .each(stash);
        
    innerData[0].text[0] = (doorShuts/doorTotal * 100).toFixed(2) + "%";// Door Shut
    innerData[1].text[0] = doorCyctles;// Door Cyctles
    // console.log("New InnerData[Door Shut] " + innerData[0].text[0] + ", Door Cyctles: " + innerData[1].text[0]);
    
    // Draw day clock and front door cycles/shut
    drawDayClock(dayClock, outterRadius, clockData, clockColor, "value", "text", 4, SimpleContent,"sunbrustclock-bg");
    drawDayClock(doorShutInfo, innerRadius, innerData, innerColor, "value", "text", 2, MultiLineContent, "sunbrustclock");
    
    var recovery = svg.selectAll(".arc").on("click", function(){
        path.transition()
            .duration(1000)
            .attrTween("d", arcTweenZoom(root));
    });

    function click(d) {
        node = d;
        path.transition()
          .duration(1000)
          .attrTween("d", arcTweenZoom(d));
	}

	d3.select(self.frameElement).style("height", height + "px");

	// Setup for switching data: stash the old values for transition.
	function stash(d) {
	  d.x0 = d.x;
	  d.dx0 = d.dx;
	}

	// When zooming: interpolate the scales.
	function arcTweenZoom(d) {
	  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),  // [0, 1] - [0, 0.08780487804878048]
	      yd = d3.interpolate(y.domain(), [d.y, 1]),   // [0, 1] -  [0.3333333333333333, 1] 
	      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, sunbrustRadius]);   // [0, 192] -  [20, 192]
	  return function(d, i) {
	    return i
	        ? function(t) { return arc(d); }  // click center to revocery
	        : function(t) {  // click sub chart to drill in
	//            console.log("t: "+ t.toFixed(4) + " ; xd(t): "+ xd(t)); 
	            x.domain(xd(t)); 
	            y.domain(yd(t)).range(yr(t)); 
	            return arc(d);
	        };
	  };
	}
	
	//  Background clock 
	function drawDayClock(svg, radius, data, color, valueKey, textKey, strokeWid, WriteTextHandler, classname){
	//    console.log("Current Day Clock's radius is " + radius + " , and sunbrustRadius " + sunbrustRadius);
        var arc = d3.svg.arc().outerRadius(radius).innerRadius(0)
                    .startAngle(function(d) { return d.startAngle + Math.PI/2; })
                    .endAngle(function(d) { return d.endAngle + Math.PI/2; });
        
        var pie = d3.layout.pie()
                    .value(function(d){ 
                        return d[valueKey]; 
                    }).sort(null);

        var g = svg.selectAll(".arc")
                .data(pie(data))
                .enter()
                .append("g")
                .attr("class", "arc");

        g.append("path")
            .attr("class", classname)
            .attr("d", arc)
            .attr("fill", function(d,i){  return color(d.data.key);  })
            .attr("stroke-width", strokeWid + "px");
        
        // Text drawing handler
        WriteTextHandler(g, textKey, arc, radius);
    }

//var pieMap = drawDayClock(dayClock, outterRadius, clockData, clockColor, "value", "text", 1, 6, SimpleContent);
//var pieBG = drawDayClock(svg, innerRadius, innerData, innerColor, "value", "text", 2, 0, MultiLineContent);

	function MultiLineContent(group, textKey, arc, radius){
	    var dataGroup = [],
	        grouplength = 0,
	        index = 0;
	    group.selectAll("text")
	        .data(function(d){
	            dataGroup.push(d);
	            grouplength = d.data[textKey].length; 
	//                console.log( d.data[textKey] );
	            return d.data[textKey]; 
	        })
	        .enter()
	        .append("text")
	        .attr("transform", function(d, i) {
	            var dataArr = dataGroup[Math.floor(index/grouplength)];
	            index++;
	            return "translate(" + arc.centroid(dataArr) + ")"; })
	        .attr("dy", function(d,i){
	            var x = d3.select(this).attr("transform").split(",")[1];
	            return (parseInt(x) < 0?(radius/4 * i + radius/16):(radius/16 - radius/4 * i)) + "px";
	        })
	        .style("text-transform","uppercase")
	        .style("text-anchor", "middle")
	        .style("fill", function(d,i){ return i?"#fff":"#666"; })
	        .style("font-size", function(d,i){ 
	            return radius/4 - i*radius/8 + "px"; 
	//                return 2.5 - i + "em"; 
	        })
	        .text(function(d, i) { return d; });
	        console.log( dataGroup );
	}
	
		function SimpleContent(group, textKey, arc){
		    group.append("text")
		//        .attr("transform", function(d) {
		           // return "translate(" + arc.centroid(d) + ")"; })
		        .attr("transform", "translate(0,0)")
		        .attr("dx", function(d,i){
		            return i%2? 0 : (i%4? 0 - outterRadius - 20 + "px" : outterRadius + 20 + "px");
		        })
		        .attr("dy", function(d,i){
		            return i%2? (i%3? outterRadius + 16 + "px" : (0 - outterRadius - 16 + "px")) : 0;
		        })
		        .style("text-anchor", "middle")
		        .style("fill", "#ccc")
		        .text(function(d) { return d.data[textKey]; });
		}
	};

	return render;
});