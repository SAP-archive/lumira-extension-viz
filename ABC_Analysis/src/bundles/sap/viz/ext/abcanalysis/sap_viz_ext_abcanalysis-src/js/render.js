define("sap_viz_ext_abcanalysis-src/js/render", [], function() {
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

     //stores dimension names in variables
     //(column names for "usage value" and "classification" may differ per dataset)
     var dimension1 = data.meta.dimensions()[0],
         dimension2 = data.meta.dimensions()[1];

     //sets variables for width, height, and the color palette so they can be used
     //within different contexts
     var width = this.width(),
         height = this.height(),
         colorPalette = this.colorPalette();


     container.selectAll('svg').remove();

     var vis = container.append('svg')
         .attr('width', width)
         .attr('height', height)
         .append('g')
         .attr('class', 'vis')
         .attr('width', width)
         .attr('height', height);

     //finds actual plot width and height by subtracting margins
     var margin = {
             top: 40,
             right: 20,
             bottom: 40,
             left: 40
         },
         plotWidth = width - margin.left - margin.right,
         plotHeight = height - margin.top - margin.bottom;

     //translates plot area within margins
     vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     //creates scales and axes
     var color = d3.scale.ordinal()
         .range(colorPalette);

     var x = d3.scale.linear()
         .range([0, plotWidth])
         .domain([0, 100]); //scales go from 0 to 100%

     var y = d3.scale.linear()
         .range([plotHeight, 0])
         .domain([0, 100]); //scales go from 0 to 100%

     var xAxis = d3.svg.axis()
         .scale(x)
         .orient("bottom");

     var yAxis = d3.svg.axis()
         .scale(y)
         .orient("left");

     //call axes
     vis.append("g")
         .attr("class", "sap_viz_ext_abcanalysis_x_axis")
         .attr("transform", "translate(0," + plotHeight + ")")
         .call(xAxis);

     vis.append("g")
         .attr("class", "sap_viz_ext_abcanalysis_y_axis")
         .call(yAxis);

     //append axis labels
     vis.append("text")
         .attr("transform", "translate(" + (plotWidth / 2) + " ," + (plotHeight + margin.bottom) + ")")
         .style("text-anchor", "middle")
         .attr("font-size", 12)
         .text("% of Total Items");

     vis.append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", 0 - margin.left)
         .attr("x", 0 - (plotHeight / 2))
         .attr("dy", "1em")
         .style("text-anchor", "middle")
         .attr("font-size", 12)
         .text("% of Total Usage Value");


     var abcArray = sortABC(data, dimension2);

     var aArray = abcArray[0];
     var numAItems = aArray.length;

     var bArray = abcArray[1];
     var numBItems = bArray.length;

     var cArray = abcArray[2];
     var numCItems = cArray.length;

     var totalItems = numAItems + numBItems + numCItems;

     var aUsageValue = calcUsageValue(aArray, dimension1);
     var aPercentItems = (numAItems / totalItems) * 100;

     var bUsageValue = calcUsageValue(bArray, dimension1);
     var bPercentItems = (numBItems / totalItems) * 100;

     var cUsageValue = calcUsageValue(cArray, dimension1);
     var cPercentItems = (numCItems / totalItems) * 100;

     var toolTip = vis.append("text")
         .attr("x", plotWidth / 2)
         .attr("y", plotHeight / 2)
         .attr("font-size", 16)
         .style("text-anchor", "middle");

     var bars = vis.selectAll(".abc-bar")
         .data(abcArray)
         .enter()
         .append("rect")
         .attr("class", "abc-bar")
         .attr("x", function(d, i) {
             return x(getStartX(i));
         })
         .attr("y", function(d, i) {
             return y(getStartY(i));
         })
         .attr("width", function(d, i) {
             return x(getPercentItems(i));
         })
         .attr("height", function(d, i) {
             return y(0) - y(getUsageValue(i));
         })
         .attr("fill", function(d, i) {
             return color(i);
         })
         .style("stroke", "black")
         .style("shape-rendering", "crispEdges")
         .on("mouseenter", function(d, i) {
             //fade bar and show tooltip
             d3.select(this).style("opacity", 0.6)
             toolTip.text(d[i][dimension2] + ": ~" + Math.round(getPercentItems(i)) + "% of items | ~" +
                 Math.round(getUsageValue(i)) + "% of value");
         })
         .on("mouseout", function() {
             d3.select(this).style("opacity", 1);
             toolTip.text("");
         })


     var labels = vis.selectAll(".abc-label")
         .data(abcArray)
         .enter()
         .append("text")
         .attr("class", "abc-bar")
         .text(function(d, i) {
             return d[i][dimension2];
         })
         .attr("x", function(d, i) {
             return x(getStartX(i)) + (x(getPercentItems(i)) / 2);
         })
         .attr("y", function(d, i) {
             return y(getStartY(i)) - 10;
         })
         .attr("fill", "black")
         .attr("font-size", 16)
         .style("text-anchor", "middle");

     function getPercentItems(i) {
         switch (i) {
             case 0:
                 return aPercentItems;
             case 1:
                 return bPercentItems;
             case 2:
                 return cPercentItems;
         }
     }

     function getUsageValue(i) {
         switch (i) {
             case 0:
                 return aUsageValue;
             case 1:
                 return bUsageValue;
             case 2:
                 return cUsageValue;
         }
     }

     //sorts data into 3 arrays based on whether they have A, B, or C values in
     //the classification dimension
     function sortABC(dataArray, dim) {
         var aArray = [];
         var bArray = [];
         var cArray = [];

         dataArray.forEach(function(d) {
             if (d[dim] == "A" || d[dim] == "a") {
                 aArray.push(d);
             } else if (d[dim] == "B" || d[dim] == "b") {
                 bArray.push(d);
             } else if (d[dim] == "C" || d[dim] == "c") {
                 cArray.push(d);
             }
         });

         return [aArray, bArray, cArray];
     }

     //calculates the total usage value of each classification group
     function calcUsageValue(arr, dim) {
         return d3.sum(arr, function(d) {
             return parseFloat(d[dim])
         });
     }

     function getStartX(i) {
         switch (i) {
             case 0:
                 return 0;
             case 1:
                 //return percentage of last value so that this bar will start right next
                 //to the last on the x-axis
                 return getPercentItems(i - 1);
             case 2:
                 return getPercentItems(i - 2) + getPercentItems(i - 1);
         }
     }

     function getStartY(i) {
         switch (i) {
             case 0:
                 return getUsageValue(i);
             case 1:
                 //return usage value of last value plus this usage value, so that this bar
                 //will start above the last on the y-axis
                 return getUsageValue(i - 1) + getUsageValue(i);
             case 2:
                 return getUsageValue(i - 2) + getUsageValue(i - 1) + getUsageValue(i);
         }
     }

 };

 	return render;
});
