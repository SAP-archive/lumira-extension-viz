(function() {
    /**
     * This function is a drawing function; you should put all your drawing logic in it.
     * it's called in moduleFunc.prototype.render
     * @param {Object} data - data set passed in
     * @param {SVG Group} vis - canvas which is an svg group element
     * @param {float} width - width of canvas
     * @param {float} height - height of canvas
     * @param {Array of color string} colorPalette - color palette
     * @param {Object} properties - properties of chart
     * @param {Object} dispatch - event dispatcher
     */
    function render(data, vis, width, height, colorPalette, properties, dispatch) {
        /*
         * Start: You can remove all the code in this render function between the Start and End comments
         * and replace it with your own implementation code.
         * You can also remove the Start and End comment blocks.
         */
                //fetch data from imported data (in cross table format) and convert them.
        //if you are not familiar with cross tables or pivot tables, you can convert the data to flat table format as follows
        var fdata = _util.toFlattenTable(data);
        if (!fdata) {
            return;
        }

        var pdata = [];
        for(var i = 0; i<fdata.length; i++){
            var dummy = [];
            for(var j = 0; j<fdata.meta.Measures.length; j++){
                dummy[fdata.meta.Measures[j]] = fdata[i].Measures[j];
            }
            dummy[fdata.meta.Date[0]] = fdata[i].Date[0];
            //console.log(dummy);
            pdata.push(dummy);
        }
        //console.log(pdata);
        
        
        var format = d3.format("0,000");
        var dateparse = d3.time.format("%m/%d/%Y").parse;
        var dataset = [];
        
        dataset = pdata.map(function (d) {
               //console.log(d);
       
               month = dateparse(d.Month);
               full_abs_line = +d["Full Absorption Line"];
               base_cap = +d["Base Capacity (In House)"];
               max_cap_ih = +d["Maximum Capacity (In House)"];
               max_cap_sub = +d["Maximum Capacity (incl. subcontracting)"];
               comp_hours = +d["Completed Hours"];
               sub_prev_month = (d["Subcontracting previous month"] ? +d["Subcontracting previous month"] : -1);
               lab_prev_month = (d["Direct Labor Completed Hours"] ? +d["Direct Labor Completed Hours"] : -1);
               orders_not_rel = (d["Orders on Hand: Not Released"] ? +d["Orders on Hand: Not Released"] : -1 );
               orders_rel = (d["Orders on Hand: Released"] ? +d["Orders on Hand: Released"] : -1);
               backlog = (d["Backlog"] ? +d["Backlog"] : -1);
               backlog_prev = (d["Backlog previous year"] ? +d["Backlog previous year"] : -1);
               forecast = (d["Sales forecast"] ? +d["Sales forecast"] : -1 );
       
       
               return {"month": month, "full_abs_line": full_abs_line, "base_cap": base_cap, "max_cap_ih": max_cap_ih, "max_cap_sub": max_cap_sub,
                   "comp_hours": comp_hours, "sub_prev_month": sub_prev_month, "lab_prev_month": lab_prev_month, 
                   "orders_not_rel": orders_not_rel, "orders_rel": orders_rel, "backlog": backlog, "backlog_prev": backlog_prev, "forecast": forecast};
            });
        //console.log(dataset);
        

        var margin = {
            top : 20,
            right : 180,
            bottom : 20,
            left : 20
        }, plotWidth = width - margin.left - margin.right, plotHeight = height - margin.top - margin.bottom;
        //transform plot area
        vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
  //time scale
   var x = d3.time.scale()
       .range([0, plotWidth]);
   x.domain(d3.extent(dataset, function(d){
       //console.log(d.month);
       return d.month;
   }));
   
   //2 y scales: 
   
   var y1 = d3.scale.linear()
       .range([plotHeight,0]);
   y1.domain([0, d3.max(dataset, function(d) { return d.max_cap_sub*1.1; })]);
   
   var y2 = d3.scale.linear()
      .range([plotHeight,0]);
   y2.domain([0, d3.max(dataset, function(d) { return d3.max([d.backlog*1.1, d.backlog_prev*1.1]); })]);
   
   var xAxis = d3.svg.axis()
       .orient("bottom")
       .scale(x)
       .tickFormat(d3.time.format("%b %Y"));;
   
   var y1Axis = d3.svg.axis()
       .scale(y1)
       .orient("left")
       .tickFormat(d3.format(".2s"));
   
   var y2Axis = d3.svg.axis()
       .scale(y2)
       .orient("right")
       .tickFormat(d3.format(".2s"));
   
   
   /*
    *   Data plots
    */
   var max_cap = d3.svg.area()
       .x(function(d) { return x(d.month); })
       .y0(y1(0))
       .y1(function(d) { return y1(d.max_cap_sub); });
   
   var norm_cap = d3.svg.area()
       .x(function(d) { return x(d.month); })
       .y0(y1(0))
       .y1(function(d) { return y1(d.max_cap_ih); });
   
   var min_cap = d3.svg.area()
       .x(function(d) { return x(d.month); })
       .y0(y1(0))
       .y1(function(d) { return y1(d.base_cap); });
   
   var abs_line = d3.svg.line()
           .x(function(d) { return x(d.month); })
           .y(function(d) { return y1(d.full_abs_line); })
           .interpolate("linear");
   
   
   //paint areas
   vis.append("path")
       .datum(dataset)
       .attr("class", "area")
       .attr("d", max_cap)
       .style("stroke", "#404040")
       .style("fill", "#D0D0D0");
   
   vis.append("path")
       .datum(dataset)
       .attr("class", "area")
       .attr("d", norm_cap)
       .style("stroke", "#404040")
       .style("fill", "#B0B0B0");
   
   vis.append("path")
       .datum(dataset)
       .attr("class", "area")
       .attr("d", min_cap)
       .style("stroke", "#404040")
       .style("fill", "#808080");
   
   
   //bars
   /*
   console.log("comp_hours\tsub_prev_month\tlab_prev_month\torders_not_rel\torders_rel\tforecast");
   for(var i=0; i<dataset.length; i++){
       console.log(dataset[i].comp_hours + "\t" + dataset[i].sub_prev_month + "\t" + dataset[i].lab_prev_month + "\t" + dataset[i].orders_not_rel + "\t" + dataset[i].orders_rel + "\t" + dataset[i].forecast);
   }
   */

   //detect past from future. Run through lab_prev_month and see where the -1 starts.
   var present_split = 0;
   for(var i=0; i<dataset.length; i++){
       if(+dataset[i].lab_prev_month === -1){
           present_split = i;
           break;
       }
   }
   
   var past = dataset.slice(0,present_split);
   var future = dataset.slice(present_split);
   
  var labelVar = "month"; 
  var varNames = ["lab_prev_month", "sub_prev_month"];
  var color = d3.scale.ordinal()
      .range(["#0000FF", "#00BFFF", "#008000", "#FF0000", "#FFFF80"]);
  
  past.forEach(function (d){
      var y0=0;
      d.mapping = varNames.map(function (name){
          return {
              name: name,
              label: d[labelVar],
              y0: y0,
              y1: y0 += +d[name]
          };
      });
      d.total = d.mapping[d.mapping.length-1].y1;
  });
  
  var pastbars = vis.selectAll(".pastbars")
      .data(past)
      .enter().append("g")
      .attr("class", "pastbars")
      .attr("transform", function (d) {
          return "translate(" + x(d.month) + ",0)";
      });
  pastbars.selectAll("rect")
      .data(function (d) { return d.mapping; })
      .enter().append("rect")
      .attr("width", "30")
      .attr("x", "-15")
      .attr("y", function (d) {
          return y1(d.y1);
      })
      .attr("height", function (d) {
          return y1(d.y0) - y1(d.y1);
      })
      .style("fill", function (d) { return color(d.name); })
      .style("stroke", "#404040")
      .style("stroke-width", "1");
  
  
  //future bars
  
  varNames = ["orders_rel", "orders_not_rel", "forecast"];
  
  future.forEach(function (d){
      var y0=0;
      d.mapping = varNames.map(function (name){
          return {
              name: name,
              label: d[labelVar],
              y0: y0,
              y1: y0 += +d[name]
          };
      });
      d.total = d.mapping[d.mapping.length-1].y1;
  });
   
  var futurebars = vis.selectAll(".futurebars")
      .data(future)
      .enter().append("g")
      .attr("class", "futurebars")
      .attr("transform", function (d) {
          return "translate(" + x(d.month) + ",0)";
      });
  futurebars.selectAll("rect")
      .data(function (d) { return d.mapping; })
      .enter().append("rect")
      .attr("width", "30")
      .attr("x", "-15")
      .attr("y", function (d) {
          return y1(d.y1);
      })
      .attr("height", function (d) {
          return y1(d.y0) - y1(d.y1);
      })
      .style("fill", function (d) { return color(d.name); })
      .style("stroke", "#404040")
      .style("stroke-width", "1");

       
   
   // blank out some overspill
   vis.append("rect")
           .attr("x", -margin.left)
           .attr("y", 0)
           .attr("width", margin.left)
           .attr("height", plotHeight+10)
           .style("fill", "white");
   
   vis.append("rect")
        .attr("x", plotWidth)
        .attr("y", 0)
        .attr("width", margin.right)
        .attr("height", plotHeight+10)
        .style("fill", "white");
   
   
 //lines
   vis.append("path")
           .attr("class", "line")
           .style("stroke", "#000000")
           .style("stroke-dasharray", ("5,5"))
           .style("stroke-width", "2")
           .attr("d", abs_line(dataset));
   
   
// begin backlog lines
   var pendown = false;
   var dpath = "";
   for(i=0; i<dataset.length-1; i++) {
       if(dataset[i].backlog>-1){
           if(!pendown){
               dpath += "M";
               pendown=true;
           }else{
               dpath += "L";
           }
           dpath+=x(dataset[i].month);
           dpath = dpath + "," + y2(dataset[i].backlog);          
       }
   }
   
   vis.append("g")
       .append("path")
       .attr("class", "backlog")
       .style("stroke", "#000000")
       //.style("stroke-dasharray", ("5,5"))
       .style("stroke-width", "2")
       .style("fill", "none")
       .attr("d", dpath);
   
   
   pendown = false;
   dpath = "";
   for(i=0; i<dataset.length-1; i++) {
       if(dataset[i].backlog_prev>-1){
           if(!pendown){
               dpath += "M";
               pendown=true;
           }else{
               dpath += "L";
           }
           dpath+=x(dataset[i].month);
           dpath = dpath + "," + y2(dataset[i].backlog_prev);          
       }
   }
   
   vis.append("g")
       .append("path")
       .attr("class", "backlog")
       .style("stroke", "#000000")
       .style("stroke-dasharray", ("3,3"))
       .style("stroke-width", "2")
       .style("fill", "none")
       .attr("d", dpath);
   
   
   //paint the axes
   vis.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0, " + plotHeight + ")")
       .call(xAxis);
   
   vis.append("g")
       .attr("class", "y axis")
       .call(y1Axis);
   
   vis.append("g")
       .attr("class", "y axis")
       .attr("transform", "translate(" + plotWidth + ", 0)")
       .call(y2Axis)
       .append("text")
       .attr("dx", "-4em")
       .attr("dy", "-0.75em")
       .attr("transform", "rotate(-90)")
       .text("Backlog");
        
    //Legend - hardcoded: too complex to drive programmatically
    var legend_g = vis.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (plotWidth+40) + ", 10)");
        
    legend_g.append("rect")
        .attr("y", 0)
        .attr("width", "16")
        .attr("height", "8")
        .style("fill", color("lab_prev_month"))
        .style("stroke", "#404040")
        .style("stroke-width", "1");
    legend_g.append("text")
        .attr("class", "legend")
        .attr("x", "20")
        .attr("y", "0")
        .attr("dy", ".75em")
        .style("text-anchor", "start")
        .text("Direct Labor Completed Hours");
        
    legend_g.append("rect")
        .attr("y", 15)
        .attr("width", "16")
        .attr("height", "8")
        .style("fill", color("sub_prev_month"))
        .style("stroke", "#404040")
        .style("stroke-width", "1");
    legend_g.append("text")
        .attr("class", "legend")
        .attr("x", 20)
        .attr("y", 15)
        .attr("dy", ".75em")
        .style("text-anchor", "start")
        .text("Subcontracting previous month");
        
    legend_g.append("rect")
        .attr("y", 30)
        .attr("width", "16")
        .attr("height", "8")
        .style("fill", color("orders_rel"))
        .style("stroke", "#404040")
        .style("stroke-width", "1");
    legend_g.append("text")
        .attr("class", "legend")
        .attr("x", 20)
        .attr("y", 30)
        .attr("dy", ".75em")
        .style("text-anchor", "start")
        .text("Orders on Hand: Released");     
        
    legend_g.append("rect")
        .attr("y", 45)
        .attr("width", "16")
        .attr("height", "8")
        .style("fill", color("orders_not_rel"))
        .style("stroke", "#404040")
        .style("stroke-width", "1");
    legend_g.append("text")
        .attr("class", "legend")
        .attr("x", 20)
        .attr("y", 45)
        .attr("dy", ".75em")
        .style("text-anchor", "start")
        .text("Orders on Hand: Not Released");             
    
    legend_g.append("rect")
        .attr("y", 60)
        .attr("width", "16")
        .attr("height", "8")
        .style("fill", color("forecast"))
        .style("stroke", "#404040")
        .style("stroke-width", "1");
    legend_g.append("text")
        .attr("class", "legend")
        .attr("x", 20)
        .attr("y", 60)
        .attr("dy", ".75em")
        .style("text-anchor", "start")
        .text("Sales forecast");     
        
    legend_g.append("rect")
        .attr("y", 80)
        .attr("width", "16")
        .attr("height", "8")
        .style("fill", "#808080")
        .style("stroke", "#404040")
        .style("stroke-width", "1");
    legend_g.append("text")
        .attr("class", "legend")
        .attr("x", 20)
        .attr("y", 80)
        .attr("dy", ".75em")
        .style("text-anchor", "start")
        .text("Base Capacity (In House)");         
        
    legend_g.append("rect")
        .attr("y", 95)
        .attr("width", "16")
        .attr("height", "8")
        .style("fill", "#B0B0B0")
        .style("stroke", "#404040")
        .style("stroke-width", "1");
    legend_g.append("text")
        .attr("class", "legend")
        .attr("x", 20)
        .attr("y", 95)
        .attr("dy", ".75em")
        .style("text-anchor", "start")
        .text("Max. Capacity (In House)");     
        
    legend_g.append("rect")
        .attr("y", 110)
        .attr("width", "16")
        .attr("height", "8")
        .style("fill", "#D0D0D0")
        .style("stroke", "#404040")
        .style("stroke-width", "1");
    legend_g.append("text")
        .attr("class", "legend")
        .attr("x", 20)
        .attr("y", 110)
        .attr("dy", ".75em")
        .style("text-anchor", "start")
        .text("Max. Capacity (incl. subcontracting)");  
        
    var legend_abs_line = d3.svg.line()
           .x(function(d) { return d.x; })
           .y(function(d) { return d.y; })
           .interpolate("linear");
        
    legend_g.append("path")
           .attr("class", "line")
           .style("stroke", "#000000")
           .style("stroke-dasharray", ("5,5"))
           .style("stroke-width", "2")
           .attr("d", legend_abs_line([{"x":0, "y": 135},{"x":16, "y":135}]));
    legend_g.append("text")
        .attr("class", "legend")
        .attr("x", 20)
        .attr("y", 130)
        .attr("dy", ".75em")
        .style("text-anchor", "start")
        .text("Full Absorption Line");  

    var legend_backlog = d3.svg.line()
           .x(function(d) { return d.x; })
           .y(function(d) { return d.y; })
           .interpolate("linear");
        
    legend_g.append("path")
           .attr("class", "line")
           .style("stroke", "#000000")
           //.style("stroke-dasharray", ("5,5"))
           .style("stroke-width", "2")
           .attr("d", legend_abs_line([{"x":0, "y": 150},{"x":16, "y":150}]));
    legend_g.append("text")
        .attr("class", "legend")
        .attr("x", 20)
        .attr("y", 145)
        .attr("dy", ".75em")
        .style("text-anchor", "start")
        .text("Backlog");  
        
    var legend_prevbacklog = d3.svg.line()
           .x(function(d) { return d.x; })
           .y(function(d) { return d.y; })
           .interpolate("linear");
        
    legend_g.append("path")
           .attr("class", "line")
           .style("stroke", "#000000")
           .style("stroke-dasharray", ("3,3"))
           .style("stroke-width", "2")
           .attr("d", legend_abs_line([{"x":0, "y": 165},{"x":16, "y":165}]));
    legend_g.append("text")
        .attr("class", "legend")
        .attr("x", 20)
        .attr("y", 160)
        .attr("dy", ".75em")
        .style("text-anchor", "start")
        .text("Backlog previous year");  

        //set style of axis and its ticks and text
        $(".axis path, .axis line").css({
            fill : 'none',
            stroke : '#000',
            'shape-rendering' : 'crispEdges'
        });
        $(".axis text").css({
            'font-size' : '11px'
        });
        $(".axis > text").css({
            "font-size" : "14px",
            "font-weight" : "bold"
        });
        $(".legend").css({
            'font-size' : '10px'
        });
         $("rect").css({
            "shape-rendering" : "crispEdges"
        });

        /*
         * End: You can remove all the code in this render function between the Start and End comments
         * and replace it with your own implementation code.
         * You can also remove the Start and End comment blocks.
         */
    }


    /*------------------------------------------------------------------------*/

    /*
     * In most cases, you don't need to modify the following code.
     */

    var _util = {/*__FOLD__*/
        mapping : {
            dses : [],
            mses : []
        },
        /**
         * extract dimension sets from data
         * @param data [Crosstable Dataset] crosstable dataset
         * @returns array of dimension sets, and each dimension set is an object of {dimension: "dimension name", data: [members]}.
         * e.g. [{dimension: 'country', data: ['China', 'US', ...]}, {dimension: 'year', data: ['2010', '2011', ...]}, ...]
         */
        extractDimSets : function(data) {
            var dimSet1, dimSet2, res = [];
            if (data.getAnalysisAxisDataByIdx) {
                dimSet1 = data.getAnalysisAxisDataByIdx(0);
                dimSet2 = data.getAnalysisAxisDataByIdx(1);
            } else if (data.dataset && data.dataset.data) {
                data.dataset.data().analysisAxis.forEach(function(g){
                    var resg = [];
                    g.data.forEach(function(d){
                        var length = d.values.length;
                        var result = {};
                        result.data = [];
                        for(var i in d.values){
                            result.data[i] = d.values[i];
                        };
                        result.dimension = d.name;
                        resg.push(result);
                    });
                    res.push(resg);
                });
                return res;
            };

            $.each([dimSet1, dimSet2], function(idx, dimSet) {
                dimSet = dimSet ? dimSet.values : undefined;
                if (!dimSet)
                    return;
                var dims = [], dim;
                for (var i = 0; i < dimSet.length; i++) {
                    dim = {
                        dimension : dimSet[i].col.val,
                        data : []
                    };
                    for (var j = 0; j < dimSet[i].rows.length; j++)
                        dim.data.push(dimSet[i].rows[j].val);
                    dims.push(dim);
                }
                res.push(dims);
            });
            return res;
        },
        /**
         * extract measure sets from data
         * @param data [Crosstable Dataset] crosstable dataset
         * @returns array of measures, and each measure is an object of {measure: "measure name", data: [measure data]}.
         * for example, [[{measure: 'income', data: [555, 666, 777, ...]}, {measure: 'cost', data:[55, 66, 77, ...]}, ...], ...]
         */
        extractMeasureSets : function(data) {

            var measureSet1, measureSet2, measureSet3, reses = [];
            if (data.getMeasureValuesGroupDataByIdx) {
                measureSet1 = data.getMeasureValuesGroupDataByIdx(0);
                measureSet2 = data.getMeasureValuesGroupDataByIdx(1);
                measureSet3 = data.getMeasureValuesGroupDataByIdx(2);
            }
            else if (data.dataset && data.dataset.data) {
                data.dataset.data().measureValuesGroup.forEach(function(g){
                    var resg = [];
                    g.data.forEach(function(d){
                        var length = d.values.length;
                        var result = {};
                        result.data = [];
                        for (var i in d.values) {
                            result.data[i] = d.values[i];
                        };
                        result.measure = d.name;
                        resg.push(result);
                    });
                    reses.push(resg);
                });
                return reses;
            };

            $.each([measureSet1, measureSet2, measureSet3], function(idx, measureSet) {
                measureSet = measureSet ? measureSet.values : undefined;
                if (!measureSet)
                    return;
                var res = [], resItem, resData, measure;
                for (var k = 0; k < measureSet.length; k++) {
                    measure = measureSet[k];
                    resItem = {
                        measure : measure.col,
                        data : []
                    };
                    resData = resItem.data;
                    for (var i = 0; i < measure.rows.length; i++) {
                        resData[i] = [];
                        for (var j = 0; j < measure.rows[i].length; j++) {
                            resData[i].push(measure.rows[i][j].val);
                        }
                    }
                    res.push(resItem);
                }
                reses.push(res);
            });

            return reses;
        },

        /**
         * convert crosstable data to flatten table data
         * @param data [Crosstable Dataset] crosstable dataset
         * @returns array of objects, and each object represents a row of data table:
         * [{"dim set name": [dim1 member, dim2 member, ...], ..., "measure set name": [measure1 value, measure2 value, ...]}, ...]
         * e.g. [{Time: ['2010', 'Jan'], Entity: ['China'], Profit: [555, 444]},  ...]
         *
         * In addition, the array has a meta data property; its name is meta.
         * It is an object with dim set name or measure set name as key,
         * and names of dims and names of measures as value:
         * {"dim set name": [dim1 name, dim2name, ...], ..., "measure set name": [measure1 name, measure2 name, ...], ...}
         * for example, {Time: ['Year', 'Month'], Entity: ['Country'], Profit: ['Gross Profit', 'Net Profit']}
         */
        toFlattenTable : function(data) {
            var dimSets = this.extractDimSets(data), measureSets = this.extractMeasureSets(data), fdata = [], datum, measure0Data, measure, me = this;
            //measureValueGroup is necessary in crosstable dataset
            //please directly call _util.extractDimSets() to get dimension values 
            if (measureSets.length === 0) {
                return;
            }
            var i, j, k, m;
            //fill meta data
            fdata.meta = {};
            $.each(dimSets, function(idx, dset) {
                if (!dset)
                    return;
                var name = me.mapping.dses[idx];
                fdata.meta[name] = dset.map(function(ele) {
                    return ele.dimension;
                });
            });
            $.each(measureSets, function(idx, mset) {
                if (!mset)
                    return;
                var name = me.mapping.mses[idx];
                fdata.meta[name] = mset.map(function(ele) {
                    return ele.measure;
                });
            });
            //convert data from ct to flat
            measure0Data = measureSets[0][0].data;
            for ( i = 0; i < measure0Data.length; i++) {
                for ( j = 0; j < measure0Data[i].length; j++) {
                    datum = {};
                    $.each(dimSets, function(idx, dimSet) {
                        if (!dimSet)
                            return;
                        var name = me.mapping.dses[idx];
                        var val = datum[name] = datum[name] || [];
                        var counter = idx === 0 ? j : i;
                        for ( m = 0; m < dimSet.length; m++) {
                            val.push(dimSet[m].data[counter]);
                        }
                    });
                    $.each(measureSets, function(idx, measureSet) {
                        if (!measureSet)
                            return;
                        var name = me.mapping.mses[idx];
                        var val = datum[name] = datum[name] || [];
                        for ( m = 0; m < measureSet.length; m++) {
                            measure = measureSet[m];
                            val.push(measure.data[i][j]);
                        }
                    });
                    fdata.push(datum);
                }
            }
            return fdata;
        }
    };

    (function() {/*__FOLD__*/
        // Drawing Function used by new created module
        var moduleFunc = {
            _colorPalette : d3.scale.category20().range().concat(d3.scale.category20b().range()).concat(d3.scale.category20c().range()), // color palette used by chart
            _dispatch : d3.dispatch("initialized", "startToInit", 'barData') //event dispatcher
        };

        moduleFunc.dispatch = function(_){
            if(!arguments.length){
                return this._dispatch;
            }
            this._dispatch = _;
            return this;
        };

        //a temp flag used to distinguish new and old module style in manifest

        /*
         * function of drawing chart
         */
        moduleFunc.render = function(selection) {
            //add xml ns for root svg element, so the image element can be exported to canvas
            $(selection.node().parentNode.parentNode).attr("xmlns:xlink", "http://www.w3.org/1999/xlink");

            //save instance variables to local variables because *this* is not referenced to instance in selection.each
            var _data = this._data, _width = this._width, _height = this._height, _colorPalette = this._colorPalette, _properties = this._properties, _dispatch = this._dispatch;
            _dispatch.startToInit();
            selection.each(function() {
                //prepare canvas with width and height of div container
                d3.select(this).selectAll('g.vis').remove();
                var vis = d3.select(this).append('g').attr('class', 'vis').attr('width', _width).attr('height', _height);

                render.call(this, _data, vis, _width, _height, _colorPalette, _properties, _dispatch);

            });
            _dispatch.initialized({
                name : "initialized"
            });
        };

        /*
         * get/set your color palette if you support color palette
         */
        moduleFunc.colorPalette = function(_) {
            if (!arguments.length) {
                return this._colorPalette;
            }
            this._colorPalette = _;
            return this;
        };

        /*flow Definition*/
        /*<<flow*/
        var flowRegisterFunc = function(){
            var flow = sap.viz.extapi.Flow.createFlow({
                id : 'comsaphanacapplanning',
                name : 'Capacity Planning',
                dataModel : 'sap.viz.api.data.CrosstableDataset',
                type : 'BorderSVGFlow'
            });
            var element  = sap.viz.extapi.Flow.createElement({
                id : 'comsaphanacapplanningmodule',
                name : 'Capacity Planning Module',
            });
            element.implement('sap.viz.elements.common.BaseGraphic', moduleFunc);
            /*Feeds Definition*/
            //ds1: Month
            var ds1 = {
                "id": "comsaphanacapplanningmodule.DS1",
                "name": "Date",
                "type": "Dimension",
                "min": 1,
                "max": 2,
                "aaIndex": 1
            };
            _util.mapping.dses.push("Date");
            //ms1: Full Absorption Line, Base Capacity (In House), Maximum Capacity (In House), Maximum Capacity (incl. subcontracting), Completed Hours, Subcontracting previous month, Sales forecast, Direct Labor Completed Hours, Orders on Hand: Not Released, Orders on Hand: Released, Backlog, Backlog previous year
            var ms1 = {
                "id": "comsaphanacapplanningmodule.MS1",
                "name": "Measures",
                "type": "Measure",
                "min": 1,
                "max": Infinity,
                "mgIndex": 1
            };
            _util.mapping.mses.push("Measures");
            element.addFeed(ds1);
            element.addFeed(ms1);
            flow.addElement({
                'element':element,
                'propertyCategory' : 'comsaphanacapplanning'
            });
            sap.viz.extapi.Flow.registerFlow(flow);
        };
        flowRegisterFunc.id = 'comsaphanacapplanning';
         
        /*flow>>*/  
        var flowDefinition = {
          id:flowRegisterFunc.id,
          init:flowRegisterFunc  
        };

        /*<<bundle*/
        var vizExtImpl = {
            viz   : [flowDefinition],
            module: [],
            feeds : []
        };
        var vizExtBundle = sap.bi.framework.declareBundle({
            "id" : "comsaphanacapplanning",
            "loadAfter" : ["sap.viz.aio"],
            "components" : [{
                "id" : "comsaphanacapplanning",
                "provide" : "sap.viz.impls",
                "instance" : vizExtImpl,
                "customProperties" : {
                    "name" : "Capacity Planning",
                    "description" : "Capacity Planning",
                    "icon" : {"path" : ""},
                    "category" : [],
                    "resources" : [{"key":"sap.viz.api.env.Template.loadPaths", "path":"./resources/templates"}]
                }
            }]
       });
       // sap.bi.framework.getService is defined in BundleLoader, which is
       // always available at this timeframe
       // in standalone mode sap.viz.js will force load and active the
       // "sap.viz.aio" bundle
       if (sap.bi.framework.getService("sap.viz.aio", "sap.viz.extapi")) {
           // if in standalone mode, sap.viz.loadBundle will be available,
           // and we load the bundle directly
           sap.bi.framework.getService("sap.viz.aio", "sap.viz.extapi").core.registerBundle(vizExtBundle);
       } else {
           // if loaded by extension framework, return the "sap.viz.impls"
           // provider component via define()
           define(function() {
               return vizExtBundle;
           });
       } 
        /*bundle>>*/ 

        //register the chart so it can be created
    })();

})();
