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
        
        //console.log(JSON.stringify(fdata));
        
       

        var margin = {
            top : 20,
            right : 20,
            bottom : 20,
            left : 40
        }, plotWidth = width - margin.left - margin.right, plotHeight = height - margin.top - margin.bottom;
        //transform plot area
        vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        
        //create x and y scales, domains, and axes
        var x = d3.scale.linear().range([0, plotWidth], 0);
        x.domain([d3.min(fdata, function(d) { return +d.TimePeriod; }),
                d3.max(fdata, function(d) { return +d.TimePeriod; })]);
       
        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5).tickFormat(d3.format("0000"));
        

        var y = d3.scale.linear().range([plotHeight, 0]);
        y.domain([0, d3.max(fdata, function(d) {
            var maxActuals =0, maxForecast =0, maxConf = 0;
            if(d.Actuals!="") maxActuals = +d.Actuals;
            if(d.Forecast!="") maxForecast = +d.Forecast;
            if(d.ConfidenceIntervals[3]!="") maxConf = +d.ConfidenceIntervals[3];
            return Math.max(maxActuals, maxForecast, maxConf)+1;
        })]);
        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
        
        
        // begin actuals
        var pendown = false;
        var dpath = "";
        for(i=0; i<fdata.length-1; i++) {
            if(fdata[i].Actuals!=""){
                if(!pendown){
                    dpath += "M";
                    pendown=true;
                }else{
                    dpath += "L";
                }
                dpath+=x(+fdata[i].TimePeriod);
                dpath = dpath + "," + y(+fdata[i].Actuals);          
            }
        }
        
        vis.append("g")
            .append("path")
            .attr("class", "actuals")
            .attr("d", dpath);
            
        //end actuals
        
        //start conf95p
        pendown = false;
        dpath = "";
        for(i=0; i<fdata.length; i++) {
            if(+fdata[i].ConfidenceIntervals[2]!=0){
                if(!pendown){
                    dpath += "M";
                    pendown=true;
                }else{
                    dpath += "L";
                }
                dpath += x(+fdata[i].TimePeriod);
                dpath = dpath + "," + y(+fdata[i].ConfidenceIntervals[2]);
            }
        }
        for(i=fdata.length-1; i>=0; i--) {
            if(+fdata[i].ConfidenceIntervals[3]!=0){
                dpath += "L";
                dpath += x(+fdata[i].TimePeriod);
                dpath = dpath + "," + y(+fdata[i].ConfidenceIntervals[3]);
            }
        }
        dpath+= "Z";
        
        //console.log(dpath);
        vis.append("g")
            .append("path")
            .attr("class", "conf95p")
            .attr("d", dpath);
            
        //end conf95p 
        //start conf80p
        pendown = false;
        dpath = "";
        for(i=0; i<fdata.length; i++) {
            if(+fdata[i].ConfidenceIntervals[0]!=0){
                if(!pendown){
                    dpath += "M";
                    pendown=true;
                }else{
                    dpath += "L";
                }
                dpath += x(+fdata[i].TimePeriod);
                dpath = dpath + "," + y(+fdata[i].ConfidenceIntervals[0]);
            }
        }
        for(i=fdata.length-1; i>=0; i--) {
            if(+fdata[i].ConfidenceIntervals[1]!=0){
                dpath += "L";
                dpath += x(+fdata[i].TimePeriod);
                dpath = dpath + "," + y(+fdata[i].ConfidenceIntervals[1]);
            }
        }
        dpath+= "Z";
        
        //console.log(dpath);
        vis.append("g")
            .append("path")
            .attr("class", "conf80p")
            .attr("d", dpath);
            
        //end conf80p 
        
            
        //begin forecast    
        pendown = false;
        dpath = "";
        for(i=0; i<fdata.length; i++) {
            if(fdata[i].Forecast!=""){
                if(!pendown){
                    dpath += "M";
                    pendown=true;
                }else{
                    dpath += "L";
                }
                dpath+=x(+fdata[i].TimePeriod);
                dpath = dpath + "," + y(+fdata[i].Forecast);          
            }
        }
        //console.log(dpath); 
        vis.append("g")
            .append("path")
            .attr("class", "forecast")
            .attr("d", dpath);
        //end forecast

        //draw x axis
        vis.append("g").attr("class", "x axis").attr("transform", "translate(0," + plotHeight + ")").call(xAxis);


        //draw y axis
        vis.append("g").attr("class", "y axis").call(yAxis);

        

        //set style of axis and its ticks and text
        $(".axis path, .axis line").css({
            fill : 'none',
            stroke : '#B0B0B0',
            'shape-rendering' : 'crispEdges'
        });
        $(".axis text").css({
            'font-size' : '12px',
            'font-family' : 'sans-serif'
        });
        $(".axis > text").css({
            "font-size" : "16px",
            "font-weight" : "bold"
        });
        
        $(".actuals").css({
            fill : 'none',
            stroke : '#4040A0',
            'stroke-width' : 2
        });
        
        $(".forecast").css({
            fill : 'none',
            stroke : '#0000FF',
            'stroke-width' : 2
        });
        
        $(".conf80p").css({
            fill : '#A0A0A0',
            stroke : '#A0A0A0',
            'stroke-width' : 0
        });
        
        $(".conf95p").css({
            fill : '#C0C0C0',
            stroke : '#C0C0C0',
            'stroke-width' : 0
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
                id : 'comsaphanasvcforecast',
                name : 'HANA Svcs Forecast w Confidence',
                dataModel : 'sap.viz.api.data.CrosstableDataset',
                type : 'BorderSVGFlow'
            });
            var element  = sap.viz.extapi.Flow.createElement({
                id : 'comsaphanasvcsforecastmodule',
                name : 'HANA Svcs Forecast w Confidence Module',
            });
            element.implement('sap.viz.elements.common.BaseGraphic', moduleFunc);
            /*Feeds Definition*/
            //ds1: Year
            var ds1 = {
                "id": "comsaphanasvcsforecastmodule.DS1",
                "name": "TimePeriod",
                "type": "Dimension",
                "min": 1,
                "max": 2,
                "aaIndex": 1
            };
            _util.mapping.dses.push("TimePeriod");
            //ms1: Actuals
            var ms1 = {
                "id": "comsaphanasvcsforecastmodule.MS1",
                "name": "Actuals",
                "type": "Measure",
                "min": 1,
                "max": Infinity,
                "mgIndex": 1
            };
            _util.mapping.mses.push("Actuals");
            //ms2: Forecast
            var ms2 = {
                "id": "comsaphanasvcsforecastmodule.MS2",
                "name": "Forecast",
                "type": "Measure",
                "min": 1,
                "max": Infinity,
                "mgIndex": 2
            };
            _util.mapping.mses.push("Forecast");
            //ms3: Lo.80, Hi.80, Lo.95, Hi.95
            var ms3 = {
                "id": "comsaphanasvcsforecastmodule.MS3",
                "name": "ConfidenceIntervals",
                "type": "Measure",
                "min": 1,
                "max": Infinity,
                "mgIndex": 3
            };
            _util.mapping.mses.push("ConfidenceIntervals");
            element.addFeed(ds1);
            element.addFeed(ms1);
            element.addFeed(ms2);
            element.addFeed(ms3);
            flow.addElement({
                'element':element,
                'propertyCategory' : 'comsaphanasvcforecast'
            });
            sap.viz.extapi.Flow.registerFlow(flow);
        };
        flowRegisterFunc.id = 'comsaphanasvcforecast';
         
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
            "id" : "comsaphanasvcforecast",
            "loadAfter" : ["sap.viz.aio"],
            "components" : [{
                "id" : "comsaphanasvcforecast",
                "provide" : "sap.viz.impls",
                "instance" : vizExtImpl,
                "customProperties" : {
                    "name" : "HANA Svcs Forecast w Confidence",
                    "description" : "HANA Svcs Forecast w Confidence",
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
