define("sap_viz_ext_comparatiochart-src/js/render", [], function() {
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
        console.debug("data", data);
        
        //data mapping
        var measures = data.meta.measures(0);
        var dimensions = data.meta.dimensions(0);
        var name = dimensions[0],
        	current = measures[0],
        	min = measures[1],
        	max = measures[2];
        
        var margin = {
                top: 20,
                right: 20,
                bottom: 40,
                left: 20
            };
        var nameWidth = 50;
        var barHeight = 45;
        var numHeight = 20;
        var linePaddingLength = 10;
        var width = this.width(),
            height = barHeight * data.length;
            
        container.selectAll("svg").remove();
        
        var divContainer = container.append("foreignObject")
			.attr("width", width + "px")
			.attr("height", height + "px")
			.attr("class", "sap_viz_ext_comparatiochart_forobj")
			.append("xhtml:div")
			.attr("class", "sap_viz_ext_comparatiochart-forobj-div-container")
			.style("width", width + "px")
			.style("height", height + "px")
			.style("left", "0px")
			.style("top", 20 + "px");
        
        var vis = divContainer.append("svg").attr("width", width - margin.left - margin.right).attr("height", barHeight * (data.length + 1))
            .append("g").attr("class", "vis").attr("width", width - margin.left - margin.right).attr("height", barHeight * (data.length + 1));
            
        
        // transform plot area
        vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        var maxSalary = d3.max(
           data.map(function(d){
                return d3.max([d[current], d[min], d[max]]);
                }
            )
        );
        
        var minSalary = d3.min(
           data.map(function(d){
                return d3.min([d[current], d[min], d[max]]);
                }
            )
        );
        
        var x = d3.scale.linear()
            .domain([0, (maxSalary + minSalary)])
            .range([0, width - nameWidth]);
            
		var div = d3.select("body").append("div")   
		    .attr("class", "tooltip")               
		    .style("opacity", 0);
        
        var svg = vis.selectAll("g")
            .data(data)
           .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });
            
        var rect = svg.append("rect")
            .attr("class", "sap_viz_ext_comparatiochart_rect")
            .attr("width", function(d) { return x(d[max] - d[min]); })
            .attr("x", function(d) { return x(d[min]) + nameWidth; })
            .attr("height", barHeight - numHeight);

        
        svg.append("line")
            .attr("class", "sap_viz_ext_comparatiochart_line")
            .attr("y1", 0)
            .attr("y2", barHeight - numHeight)
            .attr("x1", function(d){return x((d[max]+d[min]) / 2) + nameWidth;})
            .attr("x2", function(d){return x((d[max]+d[min]) / 2) + nameWidth;});
            
        svg.append("line")
            .attr("class", "sap_viz_ext_comparatiochart_horizontal_line")
            .attr("y1", barHeight - linePaddingLength * 0.85)
            .attr("y2", barHeight - linePaddingLength * 0.85)
            .attr("x1", 0)
            .attr("x2", width - margin.right);

        svg.append("foreignObject")
            .attr("class", "sap_viz_ext_comparatiochart_text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", nameWidth)
            .attr("height", barHeight)
            .attr("dy", ".35em")
            .text(function(d) { return d[name]; });     
        
        svg.append("text")
            .attr("class", "sap_viz_ext_comparatiochart_numtext")
            .attr("x", function(d) { return x(d[max]) + nameWidth; })
            .attr("y", barHeight - linePaddingLength * 1.5)
            .attr("dy", ".35em")
            .text(function(d) { return "$" + d[max].toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"); });
                   
        svg.append("text")
            .attr("class", "sap_viz_ext_comparatiochart_numtext")
            .attr("x", function(d) { return x(d[min]) + nameWidth; })
            .attr("y", barHeight - linePaddingLength * 1.5)
            .attr("dy", ".35em")
            .text(function(d) { return "$" + d[min].toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"); });
            
        svg.append("circle")
            .attr("class", "sap_viz_ext_comparatiochart_bubble")
            .attr("cx", function(d){
                return x(d[current]) + nameWidth;
            })
            .attr("cy",(barHeight -numHeight)/2)
            .attr("r", (barHeight -numHeight)/2)
            .style("fill", function(d) {
                if (d[current] < d[min]) {return "#E52929";}
                else if (d[current] >= (d[max] + d[min]) / 2) {return "#008A11";}
                else { return "#F0AB00"; }
            });
        
        svg.append("text")
            .style("text-anchor","middle")
            .style("fill", "#FFFFFF")
            .attr("x",  function(d){return x(d[current])+ nameWidth;})
            .attr("y", (barHeight -numHeight)/2)
            .attr("dy", ".3em")
            .text(function(d){
                return d3.format(".0%")(d[current]/((d[max]+d[min]) / 2));
            });
    };
    return render;
});