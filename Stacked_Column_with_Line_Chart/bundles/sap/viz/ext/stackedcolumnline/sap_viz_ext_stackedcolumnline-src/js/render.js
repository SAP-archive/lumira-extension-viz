/*<<dependency*/
define("sap_viz_ext_stackedcolumnline-src/js/render", ["sap_viz_ext_stackedcolumnline-src/js/utils/util"], function(util){
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
      
// START: sample render code for a column chart
// Replace the code below with your own one to develop a new extension
      
        /**
         * To get the dimension set, you can use either name or index of the dimension set, for example
         *     var dset_xaxis = data.meta.dimensions('X Axis’);    // by name 
         *     var dset1 = data.meta.dimensions(0);                // by index
         * 
         * To get the dimension or measure name, you should only use index of the dimension and avoid
         * hardcoded names.
         *     var dim1= dset_xaxis[0];        // the name of first dimension of dimension set ‘X Axis'
         * 
         * The same rule also applies to get measures by using data.meta.measures()
         */
         var meta = data.meta,
            dims = meta.dimensions('X Axis'),
            y_measures = meta.measures('Y Axis');

        var dimensionName = dims[0];  //we only use one dimension in this chart
        //var dimensionName = meta.dimensions(0,0);    
        
        var valueLineMeasureName = meta.measures("Y Axis 2")[0]; //we only have one value line measure
        var csvData = data;
        
        
        var margin = { top: 10, right: 200, bottom: 60, left: 50 },
        width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom;
        var legendSpacing = 60;
        var legend_X_Pos = margin.left + width + legendSpacing;
        var legend_width = 18;
        var legend_Text_X_Pos = legend_X_Pos + legend_width + 4;
        
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .rangeRound([height, 0]);

        var y2 = d3.scale.linear()
            .rangeRound([height, 0]);

        //We use 20 colors by default for the stacked columns and value line. If there are more measures, adjust this line
        var color = d3.scale.ordinal().range(colorPalette);
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickFormat(d3.format(".2s"))
            .tickSize(-width); //this creates the trellis

        var y2Axis = d3.svg.axis()
            .scale(y2)
            .orient("right")
            .tickSize(4)
            .tickFormat(d3.format(".2s"));

        // Define the value line
        var valueline = d3.svg.line()
            .x(function (d) { return x(d[dimensionName]) + x.rangeBand()/2; })
            .y(function (d) { return y2(d[valueLineMeasureName]); });

        var svg = vis.append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate("  + margin.left + "," + margin.top + ")");
        
        color.domain(d3.keys(csvData[0]).filter(function(key) { return key !== dimensionName && key !== valueLineMeasureName; }));
        csvData.forEach(function (d) {
            var y0 = 0;
            d.MeasureGroup1 = color.domain().map(function (name) { return { name: name, y0: y0, y1: y0 += +d[name], dim: d[dimensionName]}; });
            d.total = d.MeasureGroup1[d.MeasureGroup1.length - 1].y1;
        });
        
        //This sorts the columns
        //csvData.sort(function (a, b) { return a.total - b.total; });
        
        x.domain(csvData.map(function (d) { return d[dimensionName]; }));
    
        //Add 20% to the input domain to avoid columns reaching the top
        y.domain([0, 1.2 * d3.max(csvData, function (d) { return d.total; })]).nice();
        y2.domain([0, 1.2* d3.max(csvData, function (d) { return d[valueLineMeasureName]; })]).nice();

        //Add the X axis
        svg.append("g")
            .attr("class", "sap_viz_ext_stackedline_X_axis")
            .attr("transform", "translate(0," + height  + ")")
            .call(xAxis)
            .selectAll("text")
                .attr("y", 9)
                .attr("x", 0)
                .attr("dy", ".71em")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");
        
        vis.append("text")
            .attr("x", margin.left + width/2)
            .attr("y", height + margin.bottom)
            .attr("text-anchor", "middle")
            .attr("style", "font-weight:bold")
            .text(dimensionName);
        
        //Add the Y axis on the left
        svg.append("g")
            .attr("class", "sap_viz_ext_stackedline_Y_axis")
            .call(yAxis);
            
       vis.append("text")
            .attr("transform", "rotate(-90 20" + " " +  height/2 +")")
            .attr("x", 20)
            .attr("y", height/2)
            .attr("text-anchor", "middle")
            .attr("style", "font-weight:bold")            
            .text(function(){
                var y_label = "";
                for (var k=0; k<y_measures.length; k++){
                    y_label += y_measures[k];
                    if (y_label.length>50 && k<y_measures.length -1){
                        y_label += "...";
                        break;
                    }
                    if (k < y_measures.length -1)
                        y_label +=", ";
                }
                return y_label;
            });
        
        //Add Y Axis 2 on the right
        svg.append("g")
            .attr("class", "sap_viz_ext_stackedline_Y_axis")
            .attr("transform", "translate(" +  width + ",0)")
            .call(y2Axis);
        
        vis.append("text")
            .attr("transform", "rotate(-90 " + (margin.left + width + 50) + " " +  height/2 +")")
            .attr("x", margin.left + width + 50)
            .attr("y", height/2)
            .attr("text-anchor", "middle")
            .attr("style", "font-weight:bold")
            .text(valueLineMeasureName);
        
        //Add the stacked columns
        var column = svg.selectAll(".column")
            .data(csvData)
            .enter().append("g")
            .attr("class", "column")
            .attr("transform", function (d) { return "translate("  + x(d[dimensionName]) + ",0)"; });
        
        column.selectAll("rect")
            .data(function (d) { return d.MeasureGroup1; })
          .enter().append("rect")
            .attr("width", x.rangeBand())
            .attr("y", function (d) { return y(d.y1); })
            .attr("height", function (d) { return y(d.y0) - y(d.y1); })
            .attr("fill", function (d) { return color(d.name); })
            .attr("stroke", function(d){
                return ColorLuminance(color(d.name), -0.3);
            })
            .attr("stroke-width", 0)
            .on("mouseover", function() {
                       d3.select(this)
                           .attr("stroke-width", 2);
               })
               .on("mouseout", function(d) {
                   d3.select(this)
                           .transition()
                           .duration(250)
                        .attr("stroke-width", 0);
               })
            .append("title")
            .text(function(d){return dimensionName + ": " + d.dim + "\n" + d.name + ": " + (d.y1 - d.y0)});
        
        //Add the Value line with data dots
        var lineColor = colorPalette[y_measures.length + 1]; // Use the second next color to avoid the color being too close to the column
        // Add the value line path.
        svg.append("path")
           .attr("class", "line")
           .attr("stroke", lineColor)
           .attr("stroke-width", 2)
           .attr("fill", "none")
           .attr("d", valueline(csvData));

        //Add the data dots in the value line
        svg.selectAll(".dot")
              .data(csvData)
          .enter().append("circle")
              .attr("r", 3.5)
              .attr("stroke", lineColor)
              .attr("stroke-width", 2)
              .attr("fill", lineColor)
              .attr("cx", function (d) { return x(d[dimensionName]) + x.rangeBand()/2; })
              .attr("cy", function (d) { return y2(d[valueLineMeasureName]); })
              .on("mouseover", function() {
                       d3.select(this)
                           .attr("stroke", ColorLuminance(lineColor,-0.3));
               })
               .on("mouseout", function(d) {
                   d3.select(this)
                           .transition()
                           .duration(250)
                        .attr("stroke", lineColor);
               })
              .append("title")
              .text(function(d){return dimensionName + ": " + d[dimensionName] + "\n" + valueLineMeasureName + ": " + d[valueLineMeasureName]});

        //Add the legend
        var legend = vis.selectAll(".legend")
            .data(color.domain().slice().reverse())
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) { return "translate(0," + (20+ i * 20) + ")"; });

        legend.append("rect")
            .attr("x", legend_X_Pos)
            .attr("width", legend_width)
            .attr("height", legend_width)
            .style("fill", color);

        legend.append("text")
            .attr("x", legend_Text_X_Pos)
            .attr("y", legend_width/2)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function (d) { return (d.length<18)?d:(d.substring(0,16)+"..."); });
    
        //Add the legend for value line separately
        var valueLineLegend = vis.append("g");
        valueLineLegend.append("line")
            .attr("x1", legend_X_Pos)
            .attr("y1", legend_width/2)
            .attr("x2", legend_X_Pos + legend_width)
            .attr("y2", legend_width/2)
            .attr("stroke", lineColor);
        
        valueLineLegend.append("text")
            .attr("x", legend_Text_X_Pos)
            .attr("y", legend_width/2)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text((valueLineMeasureName.length<18)?valueLineMeasureName:(valueLineMeasureName.substring(0,16)+"..."));

        
        
        function ColorLuminance(hex, lum) {
            // validate hex string
            hex = String(hex).replace(/[^0-9a-f]/gi, '');
            if (hex.length < 6) {
                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            }
            lum = lum || 0;

            // convert to decimal and change luminosity
            var rgb = "#", c, i;
            for (i = 0; i < 3; i++) {
                c = parseInt(hex.substr(i*2,2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
                rgb += ("00"+c).substr(c.length);
            }
            return rgb;
        }
// END: sample render code
    };

    return render; 
});