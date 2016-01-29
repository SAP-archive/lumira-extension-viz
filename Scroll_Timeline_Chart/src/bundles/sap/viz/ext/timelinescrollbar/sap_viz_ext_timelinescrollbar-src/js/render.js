define("sap_viz_ext_timelinescrollbar-src/js/render", [], function() {
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
		// console.log(data);
		// TODO: add your own visualization implementation code below ...
			var width = this.width(),
				height = this.height(),
				colorPalette = this.properties().colorPalette;
				
			var margin = {  top: 10, right: 10,	bottom: 30,	left: 30};
			var plotWidth = width - margin.left - margin.right,
				plotHeight = height - margin.top - margin.bottom,
				maxHeight = plotHeight * 2,
				perPageTaskNumber = 8,
				brushHeight = Math.max( 60 , plotHeight/10 ),
				axisHeight = 28,
				brushDivisor = 1,
				textHeight = 0;  //transform plot area
	
			//prepare canvas with width and height of container
			container.selectAll('svg').remove();
			
			var vis = container.append('svg').attr('width', width).attr('height', height)
				               .append('g').attr('class', 'vis').attr('width', width).attr('height', height);
			// START: sample render code for a column chart
			// Replace the code below with your own one to develop a new extension
	
			var dsets = data.meta.dimensions(), // ["startDate", "endDate", "taskName", "status"]
				mset1 = data.meta.measures(0);  // only one measure 'Margin' is used in this sample
			
			d3.gantt = function() {
				var ganttSingleton;

				var timeDomainStart = d3.time.day.offset(new Date(), -3);
				var timeDomainEnd = d3.time.hour.offset(new Date(), +3);
				var taskTypes = [];
				var tickFormat = "%H:%M", 
					barOffset = 0;
				// var keyFunction = function(d){	return d[dsets[0]] + d[dsets[2]] + d[dsets[1]]; };
                
				var rectTransform = function(d) {
					var rectW = x(d[dsets[0]]) || 0, rectH = y(d[dsets[2]]) || 0;
					return "translate(" + rectW + "," + rectH + ")";
				};

				var x = d3.time.scale().domain([timeDomainStart, timeDomainEnd])
					.range([0, plotWidth - margin.left])
					.clamp(true);
				var xOverview = d3.time.scale().domain([timeDomainStart, timeDomainEnd])
					.range([0, plotWidth - margin.left])
					.clamp(true);
				var y = d3.scale.ordinal().domain(taskTypes)
					.rangeRoundBands([0, plotHeight - brushHeight], .1);
				console.log("@Init: Current Max Height = " +  (plotHeight - brushHeight));
	
				var xAxis = d3.svg.axis().scale(x).orient("bottom");
				var xAxisOverview = d3.svg.axis().scale(xOverview).orient("bottom");
				var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
				var barColor = d3.scale.ordinal().range(colorPalette);
				
				var svg = vis.attr("class", "sap_viz_ext_timelinescroll_chart")
						.attr("width", plotWidth)
						.attr("height", plotHeight - brushHeight);
				
				var dateOverview = vis.append("g").attr("class","sap_viz_ext_timelinescroll_dateoverview")
						.attr("transform", "translate("+ margin.left + ", " + (plotHeight-brushHeight + margin.bottom) + ")");
				
				dateOverview.append("rect").attr("class","sap_viz_ext_timelinescroll_dateoverview_bg")
						.attr("width", plotWidth - margin.left/2)
						.attr("height", brushHeight - axisHeight);
				
				var gantt_rects,
					yAxisWidth = margin.left;
	
				var initTimeDomain = function() {
                    console.log("## Call initTimeDomain()");
					if (tasks === undefined || tasks.length < 1) {
						timeDomainStart = d3.time.day.offset(new Date(), -3);
						timeDomainEnd = d3.time.hour.offset(new Date(), +3);
						return;
					}
					tasks.sort(function(a, b) {	return a[dsets[1]] - b[dsets[1]]; });
					timeDomainEnd = tasks[tasks.length - 1][dsets[1]];
					
					tasks.sort(function(a, b) {	return a[dsets[0]] - b[dsets[0]]; });
					timeDomainStart = tasks[0][dsets[0]];
					// console.log("timeDomain START: " + timeDomainStart);
					// console.log("timeDomain END: " + timeDomainEnd);
				};
	
				var initAxis = function(tasks, xAxisOffset) {
					console.log("## Call initAxis()");
					var pages = tasks.length/perPageTaskNumber;
					if(pages >= 1) {
						maxHeight = pages * (plotHeight - brushHeight);
					}else {
						maxHeight = plotHeight - brushHeight;
					}
					
					x = d3.time.scale().domain([timeDomainStart, timeDomainEnd])
						.range([0, plotWidth - xAxisOffset]).clamp(false);
					y = d3.scale.ordinal().domain(taskTypes)
						.rangeRoundBands([0, maxHeight], .1);
						
					//console.log("@initAxis: Current y.rangeBand() = " + y.rangeBand());

					xAxis = d3.svg.axis().scale(x).orient("bottom")
						//.tickFormat(d3.time.format(tickFormat))
						.tickSubdivide(true)
						.tickSize(6).tickPadding(8);
						
					var xDateoverviewGrid = d3.svg.axis().scale(x).orient("top")
						.tickSize(brushHeight - axisHeight).tickFormat("");
						
					yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
					
					var dateoverview_children = dateOverview
						.selectAll(".sap_viz_ext_timelinescroll_dateoverview_axis")[0].parentNode.children;
					
					if(dateoverview_children.length < 2){
						var overviewGrid = dateOverview.append("g")
							.attr("class","sap_viz_ext_timelinescroll_dateoverview_grid")
							.call(xDateoverviewGrid)
							.attr("transform", "translate(0, " + (brushHeight - axisHeight) + ")");
							
						var overviewAxis = dateOverview.append("g")
							.attr("class","sap_viz_ext_timelinescroll_dateoverview_axis")
							.transition()
							.call(xAxis);
							
						overviewAxis.attr("transform", "translate(0, " + (brushHeight - axisHeight) + ")");
						dateOverview.select(".sap_viz_ext_timelinescroll_dateoverview_bg");
						
						dateBrush();
					}
				};
						
				function dateBrush(){
					// console.log("## Call dateBrush(); " + timeDomainStart +", " + timeDomainEnd);
					var brushEndDate = d3.time.day.offset(timeDomainStart, dayBetween(timeDomainStart, timeDomainEnd)/brushDivisor);
					console.log("@dayBetween: " + dayBetween(timeDomainStart, timeDomainEnd)/brushDivisor);
					  
					var brush = d3.svg.brush()
						.x(x)
					   	.extent([timeDomainStart, brushEndDate])
					    .on("brush", brushed);
						    
					dateOverview.append("g")
					    .attr("class", "sap_viz_ext_timelinescroll_dateoverview_brush")
					    .call(brush);
					    
					dateOverview.selectAll("rect")
						.attr("height", brushHeight - axisHeight);

					function brushed() {
						x.domain(brush.empty()? xOverview.domain(): brush.extent());
						gantt_rects.selectAll(".sap_viz_ext_timelinescroll_rect")
							.attr("transform", function(d){
					  	    	return rectTransform(d);
				  	    	})
				  	    	.attr("width", function(d) { 
	                            var rect_width = x(d[dsets[1]]) - x(d[dsets[0]]);
	                            return rect_width > 0 ? rect_width : 0;
							});
						svg.select(".x.sap_viz_ext_timelinescroll_axis").call(xAxis);
					} // brushed()
				}// dateBrush()
	
				function gantt(tasksgroup) {
					console.log("## Call Gantt()");
					initTimeDomain();
					initAxis(tasksgroup, yAxisWidth/2);
	
					var gantt_divcontainer = svg.append("foreignObject")
						.attr("width", plotWidth + yAxisWidth + "px")
						.attr("height", plotHeight - brushHeight + "px")
						.attr("class", "sap_viz_ext_timelinescroll_forobj")
						.append("xhtml:div")
						.attr("class", "sap_viz_ext_scrollgantt-container")
						.style("width", plotWidth + yAxisWidth + "px")
						.style("height", plotHeight - brushHeight + "px")
						.style("left", "0px")
						.style("top", margin.top + "px");
						// .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
					
					// X Axis
					svg.append("g").attr("class", "x sap_viz_ext_timelinescroll_axis")
						.attr("transform", "translate(" + margin.left +  ", " + (plotHeight - brushHeight) + ")")
						.transition()
						.call(xAxis);
						
					var gantt_chartgroup = gantt_divcontainer.append("svg")
						.attr("class", "gantt-chart")
						.attr("width", plotWidth + yAxisWidth )
						.attr("height", maxHeight);
						
					gantt_rects = gantt_chartgroup.append("g")
						.attr("class", "sap_viz_ext_timelinescroll_chart_tasks")
						.selectAll(".tasks_")
						.data(tasksgroup)
						.enter()
						.append("g")
						.attr("transform", "translate(" + yAxisWidth + ", 0 )")
						.attr("class", function(d) {
							var taskname = d.key;
							return  "task_"+ taskname.split(" ")[0];
						});
						
					//console.log("@Grantt: Current y.rangeBand() = " + y.rangeBand());
					var rect_item = gantt_rects.selectAll(".sap_viz_ext_timelinescroll_rect")
						.data(function(d){ 	return d.values; })
						.enter()
						.append("rect")
						.attr("class", "sap_viz_ext_timelinescroll_rect")
						.attr("rx", 5)
						.attr("ry", 5)
						.attr("y",  margin.left)
						.attr("transform", rectTransform)
						.attr("height", function(){
							return y.rangeBand(); 
						})
						.attr("width", function(d) { 
                            var rect_width = x(d[dsets[1]]) - x(d[dsets[0]]);
                            return rect_width > 0 ? rect_width : 0;
						})
						.attr("fill", function(d){
							return barColor(d[dsets[3]]);
						});
						
					var tooltip = gantt_chartgroup.append("g").attr("class", "sap_viz_ext_timelinescroll_tootip");
					tooltip.append("rect").attr("class", "timelinescroll_tootip_label");
					
					var tipcontent = tooltip.append("g")
							.attr("class", "timelinescroll_tootip_label_detail");
					tipcontent.append("text").attr("class", "tootip_label_Project");
					tipcontent.append("text").attr("class", "tootip_label_info1");
					tipcontent.append("text").attr("class", "tootip_label_info2");
						
					rect_item.on('mouseover', function(d) {
						var thisRect = d3.select(this);
						    thisRect.attr('opacity', 0.8)
						    .attr("font-size", "1.4em").attr("font-weight", "bold");
						   
						    tooltip.attr("transform", function(){
						    	var axis_width = svg.select(".x.sap_viz_ext_timelinescroll_axis").node().getBBox().width;
						    	// var MouseX = d3.event.pageX > axis_width ? (d3.event.pageX - 200): d3.event.pageX - width/10,
						    	// 	MouseY =  d3.event.pageY - y.rangeBand();
						    	var position = thisRect.attr("transform").split(","),
						    		mouseX = parseFloat(position[0].split('(')[1]) + 140,
						    		mouseY = parseFloat(position[1]) - y.rangeBand()/2;
						    	return 	"translate(" + mouseX + "," + mouseY  + ")";
						    })
						    .style("opacity", 1);
							
						    tooltip.select('.timelinescroll_tootip_label')
						        .attr("x", 0).attr("width", 160)
						        .attr("y",0) .attr("height", 40)
						        .attr("rx", 2).attr("ry", 2)
						        .attr("opacity", .7);
						
						    tipcontent.select('.tootip_label_Project')
						        .attr("font-size", "1.2em")
						        .attr("dy","1.4em")
						        .attr("x", 10)
						        .text(dsets[3] + ": " + d[dsets[3]]);
							
							var startdate = d[dsets[0]], enddate = d[dsets[1]];
							tipcontent.select('.tootip_label_info1')
						        .attr("dy","2.8em")
						        .attr("x", 10)
						        .text(startdate.getDate() + '/' + startdate.getMonth() + '/' + startdate.getFullYear() + ' ');
						
						    tipcontent.select('.tootip_label_info2')
						        .attr("dy","2.8em")
						        .attr("dx", function(){
						        	return tipcontent.select('.tootip_label_info1').node().getBBox().width + 5;
						        })
						        .attr("x", 10)
						        .text(' - ' + enddate.getDate() + '/' + enddate.getMonth() + '/' + enddate.getFullYear());
						})
						.on('mouseout', function(){
						    d3.select(this).attr('opacity', 1)
						    .attr("font-size", "1.1em").attr("font-weight", "400");
						    tooltip.style("opacity", 0);
						}); // bubble: mouseover/mouseout

						
					gantt_chartgroup.append("rect")
						.attr("class", "y sap_viz_ext_timelinescroll_axis_bg");
					// Y Axis
					gantt_chartgroup.append("g")
						.attr("class", "y sap_viz_ext_timelinescroll_axis")
						.attr("transform", "translate(" + yAxisWidth + ", 0)")
						.transition().call(yAxis);
					
					var zoom = d3.behavior.zoom()
						.on("zoom", function(){
							var tx = d3.event.translate[0], ty = d3.event.translate[1], ts = d3.event.scale;
							gantt_chartgroup.attr("transform", "translate(0, " + ty + ")" + " scale(1 " + d3.event.scale + ")");
						});
					
					updateAxis(tasksgroup);
				} // function gantt(tasks) 
				
				function updateAxis(tasksgroup, tooltip){
					// var yAxisWid;
					var yAxis = svg.select(".y.sap_viz_ext_timelinescroll_axis");
					// Move Y Axis
					yAxis.attr("transform", function(){
						yAxisWidth = d3.select(this).node().getBBox().width;
						return "translate(" + yAxisWidth + ", 0)";
					});
					//console.log("@UpdateAxis: Current y.rangeBand() = " + y.rangeBand());
					barOffset = (0 - y.rangeBand()/2 + textHeight);
					
				    svg.select(".y.sap_viz_ext_timelinescroll_axis_bg")
						.attr("width",  yAxisWidth)
						.attr("height",  yAxis.node().getBBox().height + brushHeight)
						.attr("fill","white");
					
					initAxis(tasksgroup, yAxisWidth);
					x.range([0, plotWidth - yAxisWidth]);
					svg.select(".x.sap_viz_ext_timelinescroll_axis")
						 .attr("transform", "translate(" + yAxisWidth +  ", " + (plotHeight - brushHeight) + ")")
						 .transition()
						 .call(xAxis);
				    
				    yAxisWidth -= margin.left;
					var gantt_tasks = svg.selectAll(".sap_viz_ext_timelinescroll_chart_tasks")
						.attr("transform", "translate(" + yAxisWidth + ", "+ barOffset + ")");
					gantt_rects.selectAll(".sap_viz_ext_timelinescroll_rect")
						.attr("transform", function(d){
				  	    	return rectTransform(d);
			  	    	})
			  	    	.attr("width", function(d) { 
                            var rect_width = x(d[dsets[1]]) - x(d[dsets[0]]);
                            return rect_width > 0 ? rect_width : 0;
						});
				}
				
				function dayBetween(startDate, endDate){
					var oneDay = 24*60*60*1000; // Calculate one day in milliseconds
					
					var startDate_ms = startDate.getTime(),
						endDate_ms = endDate.getTime();
					
					return Math.round((endDate_ms - startDate_ms)/oneDay);
				}
	
				gantt.margin = function(value) {
					if (!arguments.length){
						return margin;  }
					margin = value;
					return gantt;
				};
	
				gantt.timeDomain = function(value) {
					if (!arguments.length){
						return [timeDomainStart, timeDomainEnd];  }
					timeDomainStart = +value[0], timeDomainEnd = +value[1];
					return gantt;
				};
	
				gantt.taskTypes = function(value) {
					if (!arguments.length){
						return taskTypes;  }
					taskTypes = value;
					return gantt;
				};
	
				gantt.width = function(value) {
					if (!arguments.length){
						return width;}
					width = +value;
					return gantt;
				};
	
				gantt.height = function(value) {
					if (!arguments.length){
						return height;}
					height = +value;
					return gantt;
				};
	
				gantt.tickFormat = function(value) {
					if (!arguments.length){	return tickFormat;}
					tickFormat = value;
					return gantt;
				};
	
				//return gantt; 
				return {
					getGantt: function(){
						if(!ganttSingleton){
							ganttSingleton = gantt;
						}
						return ganttSingleton;
					}
				};
			}; // d3.gantt()
	
			var taskNames = [],
				rawtasks = data,
				tasks = [];
				
			for (var i in data) {
				data[i][dsets[0]] = new Date(data[i][dsets[0]]);
				data[i][dsets[1]] = new Date(data[i][dsets[1]]);
				//if(data[i][dsets[2]]){	taskNames.push(data[i][dsets[2]]); }
			}

			for(var index = 0; index < rawtasks.length ; index++){
				if(rawtasks[index][dsets[0]].getFullYear() && rawtasks[index][dsets[2]] !== null){
					tasks.push(rawtasks[index]);
				}
			}
			tasks.sort(function(a, b) {	return a[dsets[1]] - b[dsets[1]];});
			tasks.sort(function(a, b) { return a[dsets[0]] - b[dsets[0]];});
			
			var nest_tasks_nofil = d3.nest()
				.key(function(d) {  return d[dsets[2]]; })
				.entries(tasks);
        	
            var nest_tasks = nest_tasks_nofil.filter(function(d){
            		taskNames.push(d.key);
                    return d.key != "null";
                });
			console.log(nest_tasks);
			
			var format = "%H:%M";
			var gantt = d3.gantt().getGantt()
					.taskTypes(taskNames).tickFormat(format);
			
	
			function getEndDate() {
				var lastEndDate = Date.now();
				if (tasks.length > 0) {
					lastEndDate = tasks[tasks.length - 1][dsets[1]];
				}
				return lastEndDate;
			}
			
			var offsetval = getTimeDomainStringOffset();
	
			gantt(nest_tasks);
			// END: sample render code	
	
			function getTimeDomainStringOffset() {
				var diff, tempstring = "";
				//console.log
				if (tasks.length > 0) {
					var lastEndDate = tasks[tasks.length - 1][dsets[1]];
					var startDate = tasks[1][dsets[0]];
					diff = lastEndDate - startDate;
					// console.log("DIFF" + diff) ;
					diff = diff / (1000 * 60 * 60);
					// console.log("DIFF->"+diff);
					if (diff < 24) {
						var resi = diff / tasks.length;
						if (resi < 3){	tempstring = "1hr"; }
						if (resi < 6){	tempstring = "3hr"; }
						if (resi >= 6){	tempstring = "6hr"; }
	
						offsetval = 0;
					} else {
						var daysval = diff / 24;
						if (daysval < 7){	tempstring = "1day"; }
						if (daysval >= 7){	tempstring = "1week"; }
	
						offsetval = daysval;
					}
	
				}
				//    console.log("OFFBEFORE->"+offsetval);
				if (offsetval <= 0){ 	offsetval = 50;  }

				return offsetval;
			}
		}; // Render function
		
		return render;
});