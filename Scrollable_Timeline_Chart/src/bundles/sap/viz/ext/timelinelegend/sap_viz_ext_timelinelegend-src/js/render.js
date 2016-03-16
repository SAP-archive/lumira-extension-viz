define("sap_viz_ext_timelinelegend-src/js/render", [], function() {
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
		var width = this.width(),
			height = this.height(),
			colorPalette = this.properties().colorPalette;
			
		var margin = {  top: 10, right: 0,	bottom: 30,	left: 10};
		var plotWidth = width - margin.left - margin.right,
			plotHeight = height - margin.top - margin.bottom,
			maxHeight = plotHeight * 2,
			perPageTaskNumber = 8,
			brushHeight = Math.max( 60 , plotHeight/10 ),
			axisHeight = 28,
			brushDivisor = 1,
			textHeight = 0;  //transform plot area
		var barChartHeight = plotHeight - brushHeight;

		//prepare canvas with width and height of container
		container.selectAll('svg').remove();
		
		var vis_svg = container.append('svg').attr('width', width).attr('height', height);
		var vis = vis_svg.append('g').attr('class', 'vis').attr('width', width).attr('height', height);

		var parsedData = new parseData(data);
		
		d3.gantt = function() {
			var ganttSingleton;

			parsedData.timeDomainStart = d3.time.day.offset(new Date(), -3);
			parsedData.timeDomainEnd = d3.time.hour.offset(new Date(), +3);
			var taskTypes = parsedData.nest_tasks.map(function(d){	return d.key; });
			var tickFormat = "%H:%M", 
				barOffset = 0;
			// var keyFunction = function(d){	return d[parsedData.dsets[0]] + d[parsedData.dsets[2]] + d[parsedData.dsets[1]]; };
            
			var rectTransform = function(d) {
//				console.log(d);
				var rectW = x(d[parsedData.dsets[0]]) || 0, rectH = y(d[parsedData.dsets[2]]) || 0;
				if(d.MaxLev){ 
                    rectH += y.rangeBand() - y.rangeBand() * (d.MaxLev - d.Overlap + 1) / d.MaxLev; 
                }
				return "translate(" + rectW + "," + rectH + ")";
			};

			var x = d3.time.scale().domain([parsedData.timeDomainStart, parsedData.timeDomainEnd])
				.range([0, plotWidth - margin.left])
				.clamp(true);
			var xOverview = d3.time.scale().domain([parsedData.timeDomainStart, parsedData.timeDomainEnd])
				.range([0, plotWidth])
				.clamp(true);
			var y = d3.scale.ordinal().domain(taskTypes)
				.rangeRoundBands([0, barChartHeight], .1);

			var xAxis = d3.svg.axis().scale(x).orient("bottom");
			var xAxisOverview = d3.svg.axis().scale(xOverview).orient("top");
			var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
			var barColor = d3.scale.ordinal().range(colorPalette);
			barColor.domain(parsedData.colorLegendList);
			
			var svg = vis.attr("class", "sap_viz_ext_timelinelegend_chart")
					.attr("width", plotWidth)
					.attr("height", barChartHeight);
			
			var dateOverview = vis.append("g").attr("class","sap_viz_ext_timelinelegend_dateoverview")
					.attr("transform", "translate( 0, " + (plotHeight-brushHeight + margin.bottom) + ")");
			
			dateOverview.append("rect").attr("class","sap_viz_ext_timelinelegend_dateoverview_bg")
					.attr("width", plotWidth  - margin.left/2)
					.attr("height", brushHeight - axisHeight);
			
			var gantt_rects,
				yAxisWidth = margin.left;

			var initTimeDomain = function() {
                console.log("## Call initTimeDomain()");
                var tasksLength = parsedData.tasks.length,
                taskList = parsedData.tasks;
				if (taskList === undefined ||tasksLength < 1) {
					parsedData.timeDomainStart = d3.time.day.offset(new Date(), -3);
					parsedData.timeDomainEnd = d3.time.hour.offset(new Date(), +3);
					return;
				}
				taskList.sort(function(a, b) {	return a[parsedData.dsets[1]] - b[parsedData.dsets[1]]; });
				parsedData.timeDomainEnd = taskList[tasksLength - 1][parsedData.dsets[1]];
				
				taskList.sort(function(a, b) {	return a[parsedData.dsets[0]] - b[parsedData.dsets[0]]; });
				parsedData.timeDomainStart = taskList[0][parsedData.dsets[0]];
			};

			var initAxis = function(tasks, xAxisOffset) {
				console.log("## Call initAxis()");
				var pages = tasks.length/perPageTaskNumber;
                maxHeight = barChartHeight;
				
				x = d3.time.scale().domain([parsedData.timeDomainStart, parsedData.timeDomainEnd])
					.range([0, plotWidth - xAxisOffset]).clamp(false);
				y = d3.scale.ordinal().domain(taskTypes)
					.rangeRoundBands([0, maxHeight], .1);
//				console.log(maxHeight + ", " + y.rangeBand());

				xAxis = d3.svg.axis().scale(x).orient("bottom")
					.tickSubdivide(true)
					.tickSize(6).tickPadding(8);
					
				xAxisOverview = d3.svg.axis().scale(x).orient("top")
					.tickSubdivide(true)
					.tickSize(plotHeight).tickPadding(8);
					
				var xDateoverviewGrid = d3.svg.axis().scale(x).orient("top")
					.tickSize(brushHeight - axisHeight).tickFormat("");
					
				yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
				
				var dateoverview_children = dateOverview
					.selectAll(".sap_viz_ext_timelinelegend_dateoverview_axis")[0].parentNode.children;
				
				if(dateoverview_children.length < 2){
					
					var overviewGrid = dateOverview.append("g")
						.attr("class","sap_viz_ext_timelinelegend_dateoverview_grid")
						.call(xDateoverviewGrid)
						.attr("transform", "translate(0, " + (brushHeight - axisHeight) + ")");
						
					var overviewAxis = dateOverview.append("g")
						.attr("class","sap_viz_ext_timelinelegend_dateoverview_axis")
						.transition()
						.call(xAxis);
						
					overviewAxis.attr("transform", "translate(0, " + (brushHeight - axisHeight) + ")");
					// dateOverview.select(".sap_viz_ext_timelinelegend_dateoverview_bg");
					dateBrush();
				}
			};
					
			function dateBrush(){
				// var brushEndDate = d3.time.day.offset(parsedData.timeDomainStart, dayBetween(parsedData.timeDomainStart, parsedData.timeDomainEnd)/brushDivisor);
				// console.log("@dayBetween: " + dayBetween(parsedData.timeDomainStart, parsedData.timeDomainEnd)/brushDivisor);
				  
				var brush = d3.svg.brush()
					.x(x)
				   	//.extent([parsedData.timeDomainStart, brushEndDate])
				    .extent([parsedData.timeDomainStart, parsedData.timeDomainEnd])
				    .on("brush", brushed);
					    
				dateOverview.append("g")
				    .attr("class", "sap_viz_ext_timelinelegend_dateoverview_brush")
				    .call(brush);
				    
				dateOverview.selectAll("rect")
					.attr("height", brushHeight - axisHeight);

				function brushed() {
					x.domain(brush.empty()? xOverview.domain(): brush.extent());
					gantt_rects.selectAll(".sap_viz_ext_timelinelegend_rect")
						.attr("transform", function(d){
				  	    	return rectTransform(d);
			  	    	})
			  	    	.attr("width", function(d) { 
                            var rect_width = x(d[parsedData.dsets[1]]) - x(d[parsedData.dsets[0]]);
                            return rect_width > 0 ? rect_width : 0;
						});
					svg.select(".x.sap_viz_ext_timelinelegend_axis_hint").call(xAxisOverview);	
					svg.select(".x.sap_viz_ext_timelinelegend_axis").call(xAxis);
				} // brushed()
			}// dateBrush()

			function gantt(tasksgroup) {
				console.log("## Call Gantt()");
				initTimeDomain();
				initAxis(tasksgroup, yAxisWidth/2);
				
				// Btm hind for date	
				svg.append("g").attr("class", "x sap_viz_ext_timelinelegend_axis_hint")
					.attr("transform", "translate(" + margin.left +  ", " + (barChartHeight) + ")")
					.transition()
					.call(xAxisOverview);
					
				// X Axis
				svg.append("g").attr("class", "x sap_viz_ext_timelinelegend_axis")
					.attr("transform", "translate(" + margin.left +  ", " + (barChartHeight) + ")")
					.transition()
					.call(xAxis);
					
			//	var tlchartgroup = gantt_divcontainer.append("svg")
				var tlchartgroup = svg.append("g")
					.attr("class", "sap_viz_ext_timelinelegend_chart")
					.attr("width", plotWidth + yAxisWidth )
					.attr("height", maxHeight);
					
				gantt_rects = tlchartgroup.append("g")
					.attr("class", "sap_viz_ext_timelinelegend_chart_tasks")
					.selectAll(".tasks_")
					.data(tasksgroup)
					.enter()
					.append("g")
					.attr("transform", "translate(" + yAxisWidth + ", 0 )")
					.attr("class", function(d) {
						var taskname = d.key;
						return  "task_"+ taskname.split(" ")[0];
					});
					
				var rect_item = gantt_rects.selectAll(".sap_viz_ext_timelinelegend_rect")
					.data(function(d){  return d.values; })
					.enter()
					.append("rect")
					.attr("class", "sap_viz_ext_timelinelegend_rect")
					.attr("rx", 5)
					.attr("ry", 5)
					.attr("y",  margin.left)
					.attr("transform", rectTransform)
					.attr("height", function(d, i){						
						return d.MaxLev ? y.rangeBand() * (d.MaxLev - d.Overlap + 1) / d.MaxLev : y.rangeBand(); 
					})
					.attr("width", function(d){
                        var rect_width = x(d[parsedData.dsets[1]]) - x(d[parsedData.dsets[0]]);
                        return rect_width > 0 ? rect_width : 0;
                    })
					.attr("fill", function(d){
						return barColor(d[parsedData.dset2[0]]);
					});
                
                    
					
				var tooltip = tlchartgroup.append("g").attr("class", "sap_viz_ext_timelinelegend_tootip");
				tooltip.append("rect").attr("class", "timelinelegend_tootip_label");
				
				var tipcontent = tooltip.append("g")
						.attr("class", "timelinelegend_tootip_label_detail");
				tipcontent.append("text").attr("class", "tootip_label_Project");
				tipcontent.append("text").attr("class", "tootip_label_info1");
				tipcontent.append("text").attr("class", "tootip_label_info2");
					
                var timer;
				rect_item.on('mouseover', function(data) {
					    var thisRect = d3.select(this);
                        rect_item.on("mousemove", function(){
                            clearTimeout(timer);    
                            timer=setTimeout(showTooltip(thisRect, tooltip, tipcontent, data), 200);
                        });
					})
					.on('mouseout', function(){
					    d3.select(this).attr('opacity', 1)
					    	.attr("font-size", "1.1em").attr("font-weight", "400");
					    tooltip.attr("transform", function(){
    								var curTrans = tooltip.attr("transform").split(" ")[0];
    								return curTrans + " scale(.1, .1)";
    							})
    							.style("opacity", 0);
					}); // bubble: mouseover/mouseout
					
				tlchartgroup.append("rect")
					.attr("class", "y sap_viz_ext_timelinelegend_axis_bg");
				// Y Axis
				tlchartgroup.append("g")
					.attr("class", "y sap_viz_ext_timelinelegend_axis")
					.attr("transform", "translate(" + yAxisWidth + ", 0)")
					.transition().call(yAxis);
				
				var zoom = d3.behavior.zoom()
					.on("zoom", function(){
						var tx = d3.event.translate[0], ty = d3.event.translate[1], ts = d3.event.scale;
						tlchartgroup.attr("transform", "translate(0, " + ty + ")" + " scale(1 " + d3.event.scale + ")");
					});
				
				updateAxis(tasksgroup);
			} // function gantt(tasks)
            
            function showTooltip(thisRect, tooltip, tipcontent, curData){
                thisRect.attr('opacity', 0.8)
                    .attr("font-size", "1.4em").attr("font-weight", "bold");

                tooltip.style("opacity", 1)
                    .transition()
                    .duration(250)
                    .attr("transform", function(){
                        var axis_width = svg.select(".x.sap_viz_ext_timelinelegend_axis").node().getBBox().width;

                        var leftBar = d3.select('.sapBiVaExplorerLeft'),
                            rightBar = d3.select('.sapBiVaExplorerRight'),
                            topBar = d3.select('.sap-vi-desktop-app-roomselectorparent'),
                            topsubBar = d3.select('.sapBiVaExplorerTopToolbar');
                        // console.log(leftBar.node().getBoundingClientRect().width);
                        var leftOffset = leftBar[0][0] ? (rightBar[0][0] ? ( leftBar.node().getBoundingClientRect().width + rightBar.node().getBoundingClientRect().width ) : 0) : 0;
                        var topOffset = topBar[0][0] ? topBar.node().getBoundingClientRect().height : 0,
                            topsubOffset = topsubBar[0][0] ? topsubBar.node().getBoundingClientRect().height : 0;

                        var mouseX = d3.event.pageX - yAxisWidth - leftOffset;
                        var mouseY = d3.event.pageY > barChartHeight ? d3.event.pageY - y.rangeBand() - topOffset - topsubOffset: d3.event.pageY - y.rangeBand()/2 - topOffset - topsubOffset;
                        if(mouseX + 180 > plotWidth - yAxisWidth){
                            mouseX -= 180;
                        }
                        if(mouseY + 40 > barChartHeight){
                            mouseY -= 50;
                        }
                        return 	"translate(" + mouseX + "," + mouseY  + ") scale(1,1)";
                    });

                tooltip.select('.timelinelegend_tootip_label')
                    .attr("x", 0).attr("width", 180)
                    .attr("y",0) .attr("height", 60)
                    .attr("rx", 2).attr("ry", 2)
                    .attr("opacity", .7);

                tipcontent.select('.tootip_label_Project')
                    .attr("font-size", "1.2em")
                    .attr("dy","1.4em")
                    .attr("x", 10)
                    .text(curData[parsedData.dsets[3]] ? (parsedData.dsets[3] + ": " + curData[parsedData.dsets[3]]) : "(Drag data to 1st dims input)" );

                var startdate = curData[parsedData.dsets[0]], enddate = curData[parsedData.dsets[1]],
                startdate_text = startdate.getDate() + ' / ' + (startdate.getMonth() + 1) + ' / ' + startdate.getFullYear() + ' ',
                enddate_text =  ' - ' + enddate.getDate() + ' / ' + (enddate.getMonth() + 1) + ' / ' + enddate.getFullYear();
                tipcontent.select('.tootip_label_info1')
                    .attr("dy","2.8em")
                    .attr("x", 10)
                    .text(parsedData.dset2[0] + ": " + curData[parsedData.dset2[0]]);

                tipcontent.select('.tootip_label_info2')
                    .attr("dy","4em")
                    .attr("x", 10)
                    .text(startdate_text + enddate_text);
            }
			
			function updateAxis(tasksgroup, tooltip){
				var yAxis = svg.select(".y.sap_viz_ext_timelinelegend_axis"),
                    itemBars =  d3.select('.sap_viz_ext_timelinelegend_chart_tasks'),
                    chartContainer = d3.select('.sap_viz_ext_timelinelegend_chart');   
        
				// Move Y Axis
				yAxis.attr("transform", function(){
					yAxisWidth = d3.select(this).node().getBBox().width;
					return "translate(" + yAxisWidth + ", 0)";
				});
                
				barOffset = Math.max((itemBars.node().getBBox().height - chartContainer.node().getBBox().height), -8);
                
			    svg.select(".y.sap_viz_ext_timelinelegend_axis_bg")
					.attr("width",  yAxisWidth)
					.attr("height", barChartHeight)
					.attr("fill","white");
				
				initAxis(tasksgroup, yAxisWidth);
				x.range([0, plotWidth - yAxisWidth]);
								// Btm hind for date	
				svg.select(".x.sap_viz_ext_timelinelegend_axis_hint")
					.attr("transform", "translate(" + yAxisWidth +  ", " + barChartHeight + ")")
					.call(xAxisOverview);
					
				svg.select(".x.sap_viz_ext_timelinelegend_axis")
					 .attr("transform", "translate(" + yAxisWidth +  ", " + barChartHeight + ")")
					 .transition()
					 .call(xAxis);
				vis_svg.attr("width", plotWidth + 1);
				console.log("@UpdateAxis: plotwidth: " + plotWidth );

			    yAxisWidth -= margin.left;
				var gantt_tasks = svg.selectAll(".sap_viz_ext_timelinelegend_chart_tasks")
					.attr("transform", "translate(" + yAxisWidth + ", "+ barOffset + ")");
				gantt_rects.selectAll(".sap_viz_ext_timelinelegend_rect")
					.attr("transform", function(d){
			  	    	return rectTransform(d);
		  	    	})
		  	    	.attr("width", function(d) { 
                        var rect_width = x(d[parsedData.dsets[1]]) - x(d[parsedData.dsets[0]]);
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
					return [parsedData.timeDomainStart, parsedData.timeDomainEnd];  }
				parsedData.timeDomainStart = +value[0], parsedData.timeDomainEnd = +value[1];
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
		
		var format = "%H:%M";
		var gantt = d3.gantt().getGantt()
				//.taskTypes(taskNames)
				.tickFormat(format);
		
		function getEndDate() {
			var lastEndDate = Date.now();
			if (parsedData.tasks.length > 0) {
				lastEndDate = parsedData.tasks[parsedData.tasks.length - 1][parsedData.dsets[1]];
			}
			return lastEndDate;
		}

		gantt(parsedData.nest_tasks);
//		console.log(parsedData.nest_tasks);
        
        console.log("#Update xAxis");
//        svg.select(".x.sap_viz_ext_timelinelegend_axis_hint").call(xAxisOverview);	
//        svg.select(".x.sap_viz_ext_timelinelegend_axis").call(xAxis);
	}; // render()
	
	function parseData(data){
		var dsets = data.meta.dimensions(0),
			dset2 = data.meta.dimensions(1),// ["startDate", "endDate", "taskName", "status"]
			mset1 = data.meta.measures(0);  // only one measure 'Margin' is used in this sample
			
		var rawtasks = data.filter(function(d){  
			return d[mset1[0]] && d[dsets[2]];
		});
		
		var taskNames = [], tasks = [];
			
		for (var i in rawtasks) {
			rawtasks[i][dsets[0]] = new Date(rawtasks[i][dsets[0]]);
			rawtasks[i][dsets[1]] = new Date(rawtasks[i][dsets[1]]);
		} // string to date object
		
		var color_nest_tasks = d3.nest()
			.key(function(d) {  return d[dset2[0]]; })
			.entries(rawtasks);
			
		var colorLegendList =color_nest_tasks.map(function(d){
			return d.key;        
		});
	
		for(var index = 0; index < rawtasks.length ; index++){
			if(rawtasks[index][dsets[0]].getFullYear() && rawtasks[index][dsets[2]] !== null){
				tasks.push(rawtasks[index]);
			}
		}
		tasks.sort(function(a, b) {	return a[dsets[1]] - b[dsets[1]];});
		tasks.sort(function(a, b) { return a[dsets[0]] - b[dsets[0]];});
		//console.log(tasks);
		
		var nest_tasks = d3.nest()
			.key(function(d) {  return d[dsets[2]]; })
			.entries(tasks);
       	
       	for(var i = 0 ; i < nest_tasks.length ; i++){
       		var subTasks = nest_tasks[i].values;
       		for(var j = 0 ; j < subTasks.length - 1 ; j++){
       		   for(var m = 1 ; m < subTasks.length - j ; m++){
                    overlapeRect(subTasks[j], subTasks[j + m]);       
               }
       		}
//            console.log(subTasks);
       	}
       	
       	return {
       		taskNames: taskNames,
       		tasks: tasks,
       		colorLegendList: colorLegendList,
       		nest_tasks: nest_tasks,
       		dsets: dsets,
       		dset2: dset2,
       		mset1: mset1
       	};
	}
	
	function overlapeRect(taskA, taskB){
        if(taskB["Start Date"] < taskA["End Date"]){
			taskA.Overlap = taskA.Overlap ?  taskA.Overlap : 1 ; 
			taskB.Overlap = taskB.Overlap ?  taskB.Overlap + 1 : 2 ;
            taskA.MaxLev = taskB.Overlap;
            taskB.MaxLev = taskB.Overlap;
		}else{
            taskA.Overlap = taskA.Overlap ?  taskA.Overlap : 1 ; 
			taskB.Overlap = taskB.Overlap ?  taskB.Overlap : 1 ;
        }
	}

	return render;
});