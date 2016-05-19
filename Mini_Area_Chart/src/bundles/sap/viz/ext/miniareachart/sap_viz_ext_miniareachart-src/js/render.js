define("sap_viz_ext_miniareachart-src/js/render", [], function(){
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
        
        var width = this.width(),
		height = this.height(),
		colorPalette = this.colorPalette(),
		properties = this.properties(),
		dispatch = this.dispatch();
        
		container.selectAll('svg').remove();
        var vis = container.append('svg').attr('width', width).attr('height', height)
                    .append('g').attr('class', 'vis').attr('width', width).attr('height', height);
      

        var margin = {top: 20, right: 20, bottom: 30, left: 50};
    
    
  
        var mset1 = data.meta.measures(0),
            dset1 = data.meta.dimensions(0),
            measureName = mset1[0],   // Find name of measure                                                   
            dimensionName = dset1[0]; // Find name of dimension


        var yDomain=[];
        //Convert measure into number
        data.forEach(function(d) {
            
            yDomain.push( d[dimensionName]);
            d[measureName] = +d[measureName];
        });

        var maxValue=d3.max(data, function(d) { return d[measureName]; });
        var minValue=d3.min(data, function(d) { return d[measureName]; });

        //Find last value in dataset in order to write into label.
        var lastValue;
        data.forEach(function(d) {
            lastValue=d[measureName];
        });
        
        //Create scales
        var x = d3.scale.ordinal()
            .domain(yDomain)
            .rangeBands([0, width*(1+1/data.length)]);
    
        var y = d3.scale.linear()
            .range([height, 0])
            .domain([0, maxValue*2]);
 
        //Create area chart
        var area = d3.svg.area()
            .x(function(d) { return x(d[dimensionName]); })
            .y0(height)
            .y1(function(d) { return y(d[measureName]); });
        
        //Create line on area
        var valueline = d3.svg.line()
            .x(function(d) { return x(d[dimensionName]); })
            .y(function(d) { return y(d[measureName]); });
        
        //Create red minimum line
        var minLine = d3.svg.line()
            .x(function(d) { return x(d[dimensionName]); })
            .y(y(minValue));
        
        //Create green maximum line
        var maxLine =d3.svg.line()
            .x(function(d) { return x(d[dimensionName]); })
            .y(y(maxValue));

        //Create svg element 
        var svg = vis.append("g");  

        //Append area and lines
        svg.append("path")
            .datum(data)
            .attr("class", "miniareachart_area")
            .attr("d", area);

        svg.append("path")      
            .attr("class", "miniareachart_line")
            .attr("d", valueline(data));
  
        svg.append("path")      
            .attr("class", "miniareachart_lineMin")
            .attr("d", minLine(data));
  
        svg.append("path")      
            .attr("class", "miniareachart_lineMax")
            .attr("d", maxLine(data));
        

        //append last value as a label
        svg.append("text")
            .attr("x", width/2)
            .attr("y", height/5)      
            .text(lastValue)
            .style("font-size", height/6 + "px")
            .attr("class", "miniareachart_text")
            .attr("text-anchor", "middle");
        
        //append minimum and maximum dots.
        svg.selectAll("dot")    
            .data(data)                                     
            .enter().append("circle")                               
            .attr("r", 3)     
            .style("fill", function(d) {
                if (d[measureName] == minValue)
                    {return "red";}
                else if (d[measureName] == maxValue) 
                        {return "lightgreen";}
                    else
                        { return "none"; }})
            .attr("cx", function(d) { return x(d[dimensionName]); })       
            .attr("cy", function(d) { return y(d[measureName]); }); 
           
    };
    return render; 

});