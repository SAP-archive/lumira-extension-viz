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

        var dsName = _util.mapping.dses[0]; //use first dimension set as data source of x axis

        var margin = {
            top : 20,
            right : 20,
            bottom : 40,
            left : 40
        }, plotWidth = width - margin.left - margin.right, plotHeight = height - margin.top - margin.bottom;
        //transform plot area
        vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        console.log(JSON.stringify(fdata));
        
        
        
        //create x and y scales, domains, and axes
        
        
         var x = d3.scale.ordinal().rangeRoundBands([0, plotWidth], 0);
        x.domain(fdata.map(function(d) { return d['Time Dimension'][0]; }));
       
        var xAxis = d3.svg.axis().scale(x).orient("bottom");


        var y = d3.scale.linear().range([plotHeight, 0]);
        y.domain([0, d3.max(fdata, function(d) {
            //console.log(d['Seasonal Adjusted'][0]);
            return +d['Seasonally Adjusted'][0];
        })]);
        var yAxis = d3.svg.axis().scale(y).orient("left");

        //draw x axis
        vis.append("g").attr("class", "x axis").attr("transform", "translate(0," + plotHeight + ")").call(xAxis)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-55)"});

        //draw y axis
        vis.append("g").attr("class", "yaxis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end").text("Weight");

        var canvas = vis.append("g");
        //draw Seasonal Adjusted
        //console.log(JSON.stringify(fdata));
        var actuals = d3.svg.line()
            .x(function(d) {return x(d['Time Dimension'][0]); })
            .y(function(d) {return y(+d['Seasonally Adjusted'][0]); });
            
        canvas.append("path").attr("class", "actuals").attr("d", actuals(fdata)); 
        
        // begin actuals
        var pendown = false;
        var dpath = "";
        for(i=0; i<fdata.length-1; i++) {
            if(fdata[i]['Fitted'][0]){
                if(!pendown){
                    dpath += "M";
                    pendown=true;
                }else{
                    dpath += "L";
                }
                dpath+=x(fdata[i]['Time Dimension'][0]);
                //console.log(dates[i] + "\t" + x(dates[i]));
                dpath = dpath + "," + y(+fdata[i]['Fitted'][0]);
            }
        }
        
        canvas.append("g")
            .append("path")
            .attr("class", "fitted")
            .attr("d", dpath);
            
        //end actuals
       

        //set style of axis and its ticks and text
        $(".axis path, .axis line").css({
            fill : 'none',
            stroke : '#000',
            'shape-rendering' : 'crispEdges'
        });
        $(".yaxis path, .yaxis line").css({
            fill : 'none',
            stroke : '#000',
            'shape-rendering' : 'crispEdges'
        });
        $(".axis text").css({
            'font-size' : '8px'
        });
        
        $(".yaxis text").css({
            'font-size' : '12px'
        });
        $(".axis > text").css({
            "font-size" : "12px",
            "font-weight" : "bold"
        });
        
        $(".actuals").css({
            stroke : '#0000FF',
            fill : 'none'
        });
        $(".fitted").css({
            stroke : '#FF0000',
            'stroke-width' : 1.5,
            fill : 'none'
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
                id : 'comsaphanasvcshw',
                name : 'Holt Winters',
                dataModel : 'sap.viz.api.data.CrosstableDataset',
                type : 'BorderSVGFlow'
            });
            var element  = sap.viz.extapi.Flow.createElement({
                id : 'comsaphanasvcshwmodule',
                name : 'Holt Winters Module',
            });
            element.implement('sap.viz.elements.common.BaseGraphic', moduleFunc);
            /*Feeds Definition*/
            //ds1: Year-Week
            var ds1 = {
                "id": "comsaphanasvcshwmodule.DS1",
                "name": "Time Dimension",
                "type": "Dimension",
                "min": 1,
                "max": 2,
                "aaIndex": 1
            };
            _util.mapping.dses.push("Time Dimension");
            //ms1: seasonally adjusted
            var ms1 = {
                "id": "comsaphanasvcshwmodule.MS1",
                "name": "Seasonally Adjusted",
                "type": "Measure",
                "min": 1,
                "max": Infinity,
                "mgIndex": 1
            };
            _util.mapping.mses.push("Seasonally Adjusted");
            //ms2: HW fitted, HW fitted level
            var ms2 = {
                "id": "comsaphanasvcshwmodule.MS2",
                "name": "Fitted",
                "type": "Measure",
                "min": 1,
                "max": Infinity,
                "mgIndex": 2
            };
            _util.mapping.mses.push("Fitted");
            element.addFeed(ds1);
            element.addFeed(ms1);
            element.addFeed(ms2);
            flow.addElement({
                'element':element,
                'propertyCategory' : 'comsaphanasvcshw'
            });
            sap.viz.extapi.Flow.registerFlow(flow);
        };
        flowRegisterFunc.id = 'comsaphanasvcshw';
         
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
            "id" : "comsaphanasvcshw",
            "loadAfter" : ["sap.viz.aio"],
            "components" : [{
                "id" : "comsaphanasvcshw",
                "provide" : "sap.viz.impls",
                "instance" : vizExtImpl,
                "customProperties" : {
                    "name" : "Holt Winters",
                    "description" : "Holt Winters",
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
