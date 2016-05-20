define("sap_viz_ext_pipelinebubblemeadim-src/js/render", [], function() {
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
		console.log(data.length);
		var	BU = ["GTI", "ICS", "AD", "PI", "OMS"], // Bubbule color group
			stageHeight = 30;
		var stageSeq = ["Scout", "Scope", "Execute", "Commercialize"];
		var subStageSeq = ["Ideation", "Evaluation", "Proof of Concept", "Developing", "Piloting", "Launch", "Market Intro"];
		var buColor = d3.scale.ordinal()
			.domain(["GTI", "ICS", "AD", "PI", "OMS"])
			.range(["#50514f", "#247ba0", "#f25f5c", "#ffe066", "#02c39a"]);
		
		var x_axis = data.meta.dimensions('Stage, Bubble Color & Tooltip'),
			bubSize = data.meta.measures('Bubble Size')[0];
		var y_measures =  data.meta.measures('Bubble Height')[0];
		
		var pipeStage = x_axis[0],
			bubCol = x_axis[1],
			bubTip = x_axis[2]; // column name for each section
		
		var newData = data.filter(function(d){
    		return d[pipeStage] && d[y_measures];
    	});

        var margin = {
				top: 20,
				right: 40,
				bottom: 30,
				left: 20
			},
			width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom;

        // An SVG element with a bottom-right origin.
        container.selectAll("g").remove();
		var svg = container
		    .attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("class", "pipetable")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        /* --------- initialize axis and pipeline ----------- */
		var xSub = d3.scale.linear()
			.range([0, width]);

		var y = d3.scale.linear()
			.range([height*0.95, 0]);

		var r = d3.scale.linear().range([0, width / 8]);

		var xSubAxis = d3.svg.axis()
			.scale(xSub)
			.tickSize(height)
			.orient("top");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(10);
			
        container.selectAll("svg").remove();
		/* Rename key of data */
	/* Rename key of data */
		for (var obj in newData) {
            newData[obj][bubSize] = Number(newData[obj][bubSize]);
            newData[obj][y_measures] = Number(newData[obj][y_measures]); // bubble height and value inside
            
            var curstage = newData[obj][pipeStage];
            if(curstage && curstage !== ""){ // split pipeStage column to Stage & Sub-Stage element
                //console.log(typeof(curstage));
                var stage = curstage.split("- ");
                newData[obj][pipeStage] = stage[0];
                // hard code for sub-Stage name of project management to fit particular newDataset
                if(newData[obj][pipeStage] === "Scout"){
                    newData[obj]['sub' + pipeStage] = "Ideation";
                }else if(newData[obj][pipeStage] === "Commercialize"){
                    newData[obj]['sub' + pipeStage] = "Market Intro";
                }else{
                    newData[obj]['sub' + pipeStage] = stage[1];
                } 
            }
    	} // data
    	console.log(newData);
    	
    	/* reorganize the data array */
		var stageArr = d3.nest()
			.key(function(d) {
				return d[pipeStage]; // Incase there is space in stage name
			})
			.sortKeys(function(a,b){
				var val1 = a.split(" ")[0],
				val2 = b.split(" ")[0];
				return  stageSeq.indexOf(val1) - stageSeq.indexOf(val2) ;
			})
			.key(function(d) {
				return d['sub' + pipeStage];
			})
			.sortKeys(function(a,b){
				return  subStageSeq.indexOf(a) - subStageSeq.indexOf(b);
			})
			.rollup(function(group) {
				var obj = [];
				for (var j = 0; j < group.length; j++) {
					var subobj = {};
					subobj.npv = Number(group[j][bubSize]);
					subobj.bu = group[j][bubCol];
					//subobj.activity = group[j]["Current Activity"];
					subobj.project = group[j][bubTip];
					subobj.md = group[j][y_measures];
					subobj.stage = group[j][pipeStage];
					subobj.subStage = group[j]['sub' + pipeStage];
					obj.push(subobj);
				}
				return obj;
			}) // 通过value显示需要的object
			.entries(newData)
			.filter(function(stageobj) {
				return stageobj.key !=="" ;
			});
		
		console.log("## Stage Arr: assign data to d3.nest() with pipeStage and 'sub'+pipeStage: ");
		console.log(stageArr);
		
		var subStageArr = [];
		for (var i in stageArr) {
			for (var j in stageArr[i].values) {
				var arr = stageArr[i].values[j].values;
				arr.sort(function(a,b){
					if (a.npv > b.npv) {
			            return -1;
			          }
			          if (a.npv < b.npv) {
			            return 1;
			          }
			          // a must be equal to b
			          return 1;
				});
				//console.log(arr);
				subStageArr = subStageArr.concat(stageArr[i].values[j]);
			}
		}
		console.log("## Sub Stage Arr: concat all sub stage item in stageArr(Data to draw bubble):");
		console.log(subStageArr);
		for(var i in subStageArr){
				console.log( subStageArr[i].key + " has length " +  subStageArr[i].values.length);
		}
		
		var allStageArr = d3.nest().key(function(d){ return d.bu;}).entries(subStageArr[0].values);
		console.log("## All Sub Stage Arr: map data by BU");
		console.log(allStageArr);

// 		/* ------------------- set x scale for sub stage -------------------*/
 		xSub.domain([0, subStageArr.length]);
 		xSubAxis.ticks(subStageArr.length);
        var subStageWidth = width/subStageArr.length;

		y.domain([0, d3.max(newData, function(d) {
			return d[y_measures]; // find the biggest y_axis value
		})]);
		/*---------------- Draw rect for pipelines  ------------------*/
		console.log("Current width is " + width);
	   
	    var stageIndex = 0;
	        
		var stage = svg.append("g")
			.attr("class", "extPipebubBar_stage")
			.selectAll(".extPipebubBar_stage")
		    .data(stageArr)
		    .enter()
		    .append("g")
		    .attr("class","extPipebubBar_stage");
		    
		var subStage = svg.append("g")
			.attr("class", "extPipebubBar_subStage")
			.selectAll(".extPipebubBar_subStage")
		    .data(subStageArr)
		    .enter()
		    .append("g")
		    .attr("class","extPipebubBar_subStage");
	        
	    stage.append("rect")
		    .attr("class","extPipebubBar")
		    .attr("x", function(d){ 
		        //console.log(d);
		        var stageX = stageIndex*subStageWidth;
		        stageIndex += d.values.length;
		        return stageX;
		    })
            .attr("width", function(d){ 
                stageIndex += d.values.length;
                return d.values.length * subStageWidth; 
            })
            .attr("y",  height)
            .attr("height", stageHeight)
            .attr("fill", "#5BC0EB")
            .attr("stroke-width", 1)
            .attr("stroke", "#50514f");
        stageIndex = 0;
        
        stage.append("text")
            .attr("text-anchor", "middle")
            .style("fill", "#fff")
            .style("width", subStageWidth)
            .attr("transform", function(d){
                var xVal = (stageIndex + d.values.length/2) * subStageWidth;
                stageIndex += d.values.length;
                var yVal = height + stageHeight*0.5 + 4;
                return "translate(" + xVal + "," + yVal + ")"; 
            })
            .text(function(d){ return d.key; });
		
		subStage.append("rect")
		    .attr("class","extPipebubBar")
			.attr("x", function(d,i){ return i*subStageWidth;})
            .attr("width", subStageWidth)
            .attr("y", height + stageHeight )
            .attr("height", stageHeight)
            .attr("fill", "#007EA7")
            .attr("stroke-width", 1)
            .attr("stroke", "#50514f");
            
        subStage.append("text")
            .attr("text-anchor", "middle")
            .style("fill", "#fff")
            .style("width", subStageWidth)
            .attr("transform", function(d,i){
                var xVal = (i + 0.5)*subStageWidth,
                    yVal = height +1.5 * stageHeight;
                return "translate(" + xVal + "," + yVal + ")"; 
            })
            .text(function(d){ 
                return d.key; 
            })
            .style("width", function(){
            	//console.log(this.getBBox().width);
            	return this.getBBox().width;
            }); // ERROR: no work!
            
        /*---------------- Create Bubble ------------------*/
		r.domain([0, d3.max(newData, function(d) {
			return d[bubSize];
		})]);

		svg.append("g")
			.attr("class", "extPipebubX extPipebubAxis")
			.attr("transform", "translate(0," + height + ")")
			.call(xSubAxis);

		svg.append("g")
			.attr("class", "y extPipebubBar")
			.call(yAxis)
			.append("text")
		    .attr("y", -16)
			.attr("dx", "-2em")
			.attr("font-size", "16px")
		    .style("text-anchor", "start")
			.text(y_measures + " (Value in Bubble)");

		var bubbleGroup = svg.append("g").attr("class", "bubbleGroup");
		
		var tooltip = svg.append("g")
			.attr("class", "extPipebubD3tip");
		tooltip.append("rect")
			.attr("class", "label");

		var tipcontent = tooltip.append("g")
			.attr("class", "label_detail");
		tipcontent.append("text").attr("class", "project");
		tipcontent.append("text").attr("class", "info1");
		tipcontent.append("text").attr("class", "info2");

		for (var index in subStageArr) {
			//console.log(subStageArr[index]);
			var bubble = bubbleGroup.selectAll(".bubble" + index)
				.data(subStageArr[index].values)
				.enter().append("g")
				.filter(function(d) {
					return d.bu === BU[0] || d.bu === BU[1] || d.bu === BU[2] || d.bu === BU[3] || d.bu === BU[4];
				})
				.attr("class", "bubbleNode")
				.filter(function(d) {
					return d.md > 0;
				})
				.attr("transform", function(d) {
					var xValue = index * subStageWidth + 0.5 * subStageWidth,
						yValue = y(d.md);
					return "translate(" + xValue + "," + yValue + ")";
				});

		var bubbles = bubble.append("circle")
				.attr("class", "bubble" + index)
    			.attr("r", 0)
				.style("fill", function(d) {
					console.log("Draw Bubble");
					return buColor(d.bu);
				})
				.style("opacity", 1)
				.attr("stroke", "#efefef")
				.attr("stroke-width", 1);
				
			bubbles.transition()
				.duration(750)
				.ease("elastic")
				.attr("r", function(d){
                	//console.log(d);
    				if (d.npv < 5) {  return d3.max([subStageWidth*3/20-5, 1]);
    				} else if (d.npv < 10) {  return d3.max([subStageWidth*4/20-5, 2]);
    				} else {   return d3.max([subStageWidth*6/20-5, 3]);  }
    			});
				
			var bubbleText = bubble.append("text")
				.attr("dy", ".3em")
				.style("text-anchor", "middle")
				.style("opacity", 0)
				.style("fill", function(d) {
					return d.bu === "PI" ? "#222" : "#fff";
				})
				.text(function(d) {
					return d.md;
				});
				
			bubbleText.transition()
				.duration(750)
				.ease("elastic")
				.style("opacity", 1);
				
			bubble.on('mouseover', function(d) {
				d3.select(this).attr('opacity', 0.8)
				.attr("font-size", "1.4em").attr("font-weight", "bold");
			    //console.log(d);
				var position = d3.select(this).attr("transform").split(",");
				tooltip.attr("transform", "translate(" + (parseFloat(position[0].split("(")[1]) + subStageWidth/3) + "," + (parseFloat(position[1]) - 40) +")")
					.style("opacity", 1);
				
				tooltip.select('.label')
				    .attr("x", 0).attr("width", 130)
				    .attr("y",0) .attr("height", 50)
				    .attr("rx", 2).attr("ry", 2)
				    // .attr("fill","#444").attr("stroke-width", 1)
				    // .attr("stroke", "#aaa")
				    .attr("opacity", .7);
				   
				tipcontent.select('.project')
					.attr("font-size", "1.2em")
				    .attr("dy","1.4em")
				    .attr("x", 10)
				    .text(d.project);
				    
				tipcontent.select('.info1')
				    .attr("dy","2.6em")
				    .attr("x", 10)
				    .text(bubSize + "(size): " + d.npv);
				    
				tipcontent.select('.info2')
				    .attr("dy","3.8em")
				    .attr("x", 10)
				    .text(bubCol + "(color): " + d.bu);
			})
			.on('mouseout', function(){
				d3.select(this).attr('opacity', 1)
				.attr("font-size", "1.1em").attr("font-weight", "400");
			    tooltip.style("opacity", 0);
			}); // bubble: mouseover/mouseout

		} //for (var index in subStageArr)
	}; // render = function(data, container)

	return render;
});