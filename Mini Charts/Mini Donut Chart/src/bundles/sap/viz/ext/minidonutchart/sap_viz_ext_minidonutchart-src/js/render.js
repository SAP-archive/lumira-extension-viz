define("sap_viz_ext_minidonutchart-src/js/render", [], function(){
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
      
      console.log(data);
         var colors = this.properties().colorPalette;
         var mset1 = data.meta.measures(0),
	  
         
         //Find measure name.
         measureName = mset1[0];
         
         
         var pieData=[];
         
         //Convert measure into number and push into an array
         data.forEach(function(d) {
               d[measureName] = +d[measureName];
               pieData.push(d[measureName]);
               pieData.push(1-d[measureName]);
          });
          
          //Create container svg element
          var svg = container
              .append('svg')
              .attr('width', width)
              .attr('height', height)
              .append('g')
              .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

          //Calculate radius of donut dynamically
          var radius = Math.min(width, height)/2 ;
          
          var pie = d3.layout.pie()
                .sort(null);

          //Create donut part of chart
          var arc = d3.svg.arc()
               .innerRadius(radius*0.6)
               .outerRadius(radius);
           
           //Create inner gray circle
          var circle = svg.append("circle")                  
               .attr("r", radius*0.75)
               .attr("fill", "lightgray")
               .style("stroke",colors[0])
               .style("stroke-width",2);
               
          var path = svg.selectAll('path')
              .data(pie(pieData))
              .enter()
              .append('path')
              .attr('d', arc)
              .attr('fill', colors[0])
              .style("opacity", function(d, i) { return i == pieData.length - 1 ? 0 : 1; })
              .style("stroke","white")
              .style("stroke-width",2);
    
        //Number formatting
        var d3Format = d3.format(",.2%");	
          
        //Write label on chart
        svg.append("text")
              .attr("dy", ".35em")
              .style("text-anchor", "middle")
              .attr("class", "minidonutchart_text")
              .style("font-size",  radius/4 + "px")
              .style("fill","#686868")
              .text(d3Format(pieData[0]));
          
    };

    return render; 
});