define("siesta_saphackathon_viz_ext_bounceball-src/js/render", [], function() {
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
		var x_axis = data.meta.dimensions('x_Axis');
		var y_measures = data.meta.measures('y_Axis');
		
		var timePeriod = x_axis[0],
			breathRate = x_axis[1];
		
		var	bounceRate = y_measures[0]; // column name for each section
		console.log(data);
		var mapdata = d3.map(data, function(d){
			return d[timePeriod];
		}); // Don't use this dataset
		console.log(mapdata);
		console.log(data.map(function(d){ return d[timePeriod]; }) );
		var	color = d3.scale.ordinal()
			.domain(d3.range(0,7))
			.range([ "#08306b", "#08519c","#2171b5", "#4292c6", "#6baed6", "#9ecae1", "#c6dbef","#deebf7"]);
			
        var margin = {	top: 20,	right: 40,	bottom: 30,	left: 20 },
			width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom;

        // An SVG element with a bottom-right origin.
        container.selectAll("g").remove();
		var svg = container
		    .attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("class", "bounceBall")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		var ball_height = d3.scale.linear()
			.domain([d3.min(data, function(d) { return Number(d[bounceRate]);}), d3.max(data, function(d) { return Number(d[bounceRate]);}) ] )
			.range([height*0.9, height*0.1]);
		console.log(data.map(function(d) { return Number(d[bounceRate]);}));
		console.log("d[bounceRate], min " + d3.min(data, function(d) { return Number(d[bounceRate]);}) + " to Max "+ d3.max(data, function(d) { return Number(d[bounceRate]);}) + " is " + ball_height(1000) + ", " + ball_height(1200) );
		
		var x_sec =  d3.scale.ordinal()
			.domain(data.map(function(d) { return d[timePeriod]; }))
			.rangeBands([0, width]);
		var y_axis = d3.scale.linear()
			.domain([d3.min(data, function(d) { return Number(d[bounceRate]);}), d3.max(data, function(d) { return Number(d[bounceRate]);}) ] )
			.range([height, 0]);
		var stageHeight = 0.1*height;
		
		var xAxis = d3.svg.axis().scale(x_sec).orient("bottom");
		
		var yAxis = d3.svg.axis()
			.scale(y_axis)
			.orient("left")
			.tickSize(-width)
			.tickFormat(function(d) {
				return d;
			});
			
		/* Draw Axis */
		svg.append("g")
		    .attr("class", "x_axis_ext_bounceball")
		    .attr("transform", "translate(0," + height + ")")
		    .call(xAxis)
		    .append("text")
		    .attr("dy", "-15px")
		    .attr("dx",  width + "px")
		    .style("text-anchor",  "end")
		    .style("font-size", "2em")
		    .style("visibility", "visible")
		    .text(timePeriod);
		    
		svg.append("g")
		    .attr("class", "y_axis_ext_bounceball")
		    .call(yAxis)
		    .append("text")
		    .attr("dy", "-10px")
		    .style("text-align", "center")
		    .style("font-size", "2em")
		    .style("visibility", "visible")
		    .text(bounceRate);
		    
		// Draw Stage for each hour at neight
		var stage = svg.append("g")
			.attr("class", "extBounceBall_stage")
			.selectAll(".extBounceBall_stage")
		    .data(data)
		    .enter()
		    .append("g")
		    .attr("class","extBounceBall_stage");
	        
	    stage.append("rect")
		    .attr("class","extHourStage")
		    .attr("x", function(d) { return x_sec(d[timePeriod]); })
    		.attr("width", x_sec.rangeBand())
            .attr("y",  height)
            .attr("height", stageHeight)
            .attr("fill", function(d,i){
            	return color(i);
            })
            .attr("stroke-width", 1)
            .attr("stroke", "#50514f");
        
        stage.append("text")
            .attr("text-anchor", "middle")
            .style("fill", function(d){
            	return (parseInt(d[timePeriod]) >= 3 &&	parseInt(d[timePeriod]) < 7) ? "#333": "#fff";
            })
            .style("font-size", "1.6em")
            .style("width",x_sec.rangeBand())
            .attr("transform", function(d) { 
            	return  "translate(" + (x_sec(d[timePeriod])+x_sec.rangeBand()/2) + "," + (height + stageHeight/2) + ")";} )
            .text(function(d){ 
            	if(typeof d[timePeriod] === "number"){
                    return (d[timePeriod] > 6 && d[timePeriod] < 12) ? d[timePeriod] + " pm" : d[timePeriod] + " am"; 
                }else if(typeof d[timePeriod] === "string"){
                    return d[timePeriod];
                } 
            });

		var ball = svg.append("g")
			.attr("class", "extBounceBall_ball")
			.selectAll(".extBounceBall_ball")
		    .data(data)
		    .enter();
		    
		var ball_radius=  0.3*x_sec.rangeBand(),
			ball_initHeight = height - ball_radius;
		    
		var bounceBall = ball.append("g")
			.attr("class", function(d,i){
				return "bounceBall_" + i;
			})
			.attr("transform",function(d,i) {  
				return  "translate(" + (x_sec(d[timePeriod])+x_sec.rangeBand()/2) + "," + ball_initHeight + ")"; 	
			})
			.append("circle")
			.attr("r", function(){
				return width>600? ball_radius/2 : ball_radius;	
			})
			.attr("fill", function(d,i){
				// console.log(d);
				// console.log("Total height" + height + ",and bounce height: " + (height-stageHeight/2));
				// console.log("Ball Duration " + ball_vel(d[bounceRate]) + ", and Ball Height " + ball_height(Number(d[breathRate])));
				return color(i);
			})
			.attr("stroke", "#eee")
			.attr("stroke-width", "1px");
		
		function bounce(){
			bounceBall.transition()
				.duration(750)
				.ease("cubic-out")
				.attr("transform",function(d) { 
					var ballHeihgt = ball_height(d[bounceRate]);
	            	//return  "translate(" + (x_sec(d[timePeriod])+x_sec.rangeBand()/2) + "," + ballHeihgt + "), scale(1.1,0.9)";
            		return  "translate(0," + (-ballHeihgt) + "), scale(0.9, 1.1)";
				})
				.transition()
				.ease("cubic-in")
				.duration(750)
				.attr("transform",function() {
	            	//return  "translate(" + (x_sec(d[timePeriod])+x_sec.rangeBand()/2) + "," + (height-stageHeight/2) + "), scale(0.9,1.1)";
	            	return  "translate( 0,0 ), scale(1.1, 0.9)";
				})
				.each("end", bounce);
			// bounceBall.selectAll("circle").transition().attr("opacity", 1);
		}
		
		bounce();
		    

			
	}; // Render function()

	return render;
});