/*<<dependency*/
define("vdn_viz_ext_3dworld-src/js/utils/util", [], function(){
/*dependency>>*/
    /*
     * In most cases, you don't need to modify the following code.
     */
    var _util = {/*__FOLD__*/
        /*
         * Converts data to flatten table format. Accepts MultiAxisDataAdapter, CrosstableDataset and FlattableDataset as data input.
         * Invocation example:
         * _util.toTable(data, [mapper], callback);
         * data : data input
         * mapper[optional] : a mapper that maps each data to another format.
         * eg. mapper = function(d, [meta]){...}
         * callback : accepts the error message and output data to generate visualization.
         * eg. callback = function(err, data, [meta]){...}
         */
        toTable: function(data, f1, f2) {
            var cb = f2 || f1,
                mapper = f2 ? f1 : undefined,
                rows;
            try {
                var me = this, parser = me._getParser(data);
                rows = parser.call(me, data);
                if(!rows) {
                    rows = [];
                }
                me._meta = rows.meta;
            
                if (mapper) {
                    rows = rows.map(function(d) {
                        return mapper(d, me._meta);
                    });
                    rows.meta = me._meta;
                }
            } catch (err) {
                return cb(err, null, null);
            } 
            if (cb) {
                return cb(null, rows, me._meta);
            } else {
                return rows;
            }
             
        },

        buildNameIdx : function(feeds) {
            if(feeds) {
                this._feeds = feeds;
                this._dimMap = {};
                this._mgMap = {};
                var that = this;
                feeds.forEach(function(feed) {
                    if(feed.aaIndex) {
                        that._dimMap[feed.name] = feed.aaIndex - 1;
                    } else {
                        that._mgMap[feed.name] = feed.mgIndex - 1;
                    }
                });
            }
        },

        _getParser : function(data) {
            if(data.dataset) {
                var dataset = data.dataset;
                if(dataset.table) {
                    return this._flat;
                } else {
                    return this._cross;
                }
            }
            return this._cross;
        },

        _flat : function(data) {
            var dataset = data.dataset;
            var ret = dataset.table();
            ret.meta = {
                _dimensionSets : [dataset.dimensions()],
                _measureSets : [dataset.measures()],

                dimensions : function(i, j) {
                    if(arguments.length === 2) {
                        return this._dimensionSets[0][j];                        
                    }
                    return this._dimensionSets[0];
                },

                measures : function(i, j) {
                    if(arguments.length === 2) {
                        return this._measureSets[0][j];
                    }
                    return this._measureSets[0];
                }
            };

            return ret;
        },

        _parseMeta : function(meta) {
            if(!meta) {
                return null;
            } else {
                return {
                    _dimMap : this._dimMap,
                    _mgMap : this._mgMap,
                    _meta : {
                        measureSets : (function(measureSets) {
                            var tmp = [];
                            $.each(measureSets, function(idx, ele) {
                                tmp[idx] = ele.map(function(d) {
                                    return d.measure;
                                });
                            });
                            return tmp;
                        }(meta.measureSets)),
                        dimSets : (function(dimSets) {
                            var tmp = [];
                            $.each(dimSets, function(idx, ele) {
                                tmp[idx] = ele.map(function(d) {
                                    return d.dimension;
                                });
                            });
                            return tmp;
                        }(meta.dimSets))
                    },
					feeds : function() {
						
					},
                    measures : function(i, j) {
                        if(arguments.length === 0) {
                            var ret = [];
                            $.each(this._meta.measureSets, function(idx, ms) {
                                $.each(ms, function(idx, measure) {
                                    ret.push(measure);
                                });
                            });
                            return ret;
                        } else if(arguments.length === 1) {
                            if(this._mgMap && this._mgMap[i] !== undefined) {
                                i = this._mgMap[i];  
                            }
                            if(!this._meta.measureSets[i]) {
                                return [];
                            }
                            return this._meta.measureSets[i];
                        } else {
                            return this._meta.measureSets[i][j];
                        }
                    },
                    dimensions : function(i, j) {
                         if(arguments.length === 0) {
                            var ret = [];
                            $.each(this._meta.dimSets, function(idx, ds) {
                                $.each(ds, function(idx, dim) {
                                    ret.push(dim);
                                });
                            });
                            return ret;
                        } else if(arguments.length === 1) {
                            if(this._dimMap && this._dimMap[i] !== undefined) {
                                i = this._dimMap[i];  
                            }
                            if(!this._meta.dimSets[i]) {
                                return [];
                            }
                            return this._meta.dimSets[i];
                        } else {
                            return this._meta.dimSets[i][j];
                        }
                    }
                };
            }
        },

        _extractCtx: function(meta, data) {
            var ctx = {};
            $.each(data._mg, function(idx, mg) {
                $.each(mg.values, function(idx, mgValues) {
                    var ctxRows = [];
                    ctx[mgValues.col] = ctxRows;
                    $.each(mgValues.rows, function(idx, rows) {
                        $.each(rows, function(idx, row) {
                            ctxRows.push(row.ctx);
                        });
                    });
                });
            });
            $.each(data._aa, function(idx, aa) {
                $.each(aa.values, function(idx, axis) {
                    var ctxRows = [];
                    ctx[axis.col.val] = ctxRows;
                    $.each(axis.rows, function(idx, row) {
                        ctxRows.push(row.ctx);
                    });
                });
            });
            meta._ctx = ctx;
            meta.context = function(col, dataIdx) {
                return this._ctx[col][dataIdx];
            };
        },
		
		/*
			Custom function to retrieves feed ids currently in use
		*/
		_setMetaFeeds : function(feeds) {
			var ids = {}, 
				len, _id;
			if (feeds && feeds.length) {
				len = feeds.length;
				for (var i = 0; i < len; ++i) {
					_id = feeds[i].feedId.split(".");
					_id = _id[_id.length - 1];
					ids[_id] = _id;
				}
			}
			return function(id) {
				if (id) {
					return ids[id];
				}
				return ids;
			};	
		},

        _cross : function(data) {
            var ret =  this._toFlattenTable(data);
            if( !ret ) {
                return null;
            }
            ret.meta = this._parseMeta(ret.meta);
			ret.meta._feeds_ = this._setMetaFeeds(data.feeding);
            //Extract data context for MultiAxisDataAdapter
            if(data.getAnalysisAxisDataByIdx) {
                this._extractCtx(ret.meta, data);
            }
            return ret;
        },
        /*
         * extract dimension sets from data
         * @param data [Crosstable Dataset] crosstable dataset
         * @returns array of dimension sets, and each dimension set is an object of {dimension: "dimension name", data: [members]}.
         * e.g. [{dimension: "country", data: ["China", "US", ...]}, {dimension: "year", data: ["2010", "2011", ...]}, ...]
         */
        _extractDimSets : function(data) {
            var dimSet1, dimSet2, res = [];
            if (data.getAnalysisAxisDataByIdx) {
                dimSet1 = data.getAnalysisAxisDataByIdx(0);
                dimSet2 = data.getAnalysisAxisDataByIdx(1);
            } else if (data.dataset && data.dataset.data) {
                var analysisAxis = data.dataset.data().analysisAxis;
                if (analysisAxis) {
                    analysisAxis.forEach(function(g) {
                        var resg = [];
                        g.data.forEach(function(d) {
                            var result = {};
                            result.data = [];
                            for (var prop in d.values) {
                                if (d.values.hasOwnProperty(prop)) {
                                    result.data[prop] = d.values[prop];
                                }
                            }
                            result.dimension = d.name;
                            resg.push(result);
                        });
                        res.push(resg);
                    });
                }
                return res;
            }

            $.each([dimSet1, dimSet2], function(idx, dimSet) {
                dimSet = dimSet ? dimSet.values : undefined;
                if (!dimSet) {
                    return;
                }
                var dims = [], dim;
                for (var i = 0; i < dimSet.length; i++) {
                    dim = {
                        dimension : dimSet[i].col.val,
                        data : []
                    };
                    for (var j = 0; j < dimSet[i].rows.length; j++) {
                        dim.data.push(dimSet[i].rows[j].val);
                    }
                    dims.push(dim);
                }
                res.push(dims);
            });
            return res;
        },

        /*
         * extract measure sets from data
         * @param data [Crosstable Dataset] crosstable dataset
         * @returns array of measures, and each measure is an object of {measure: "measure name", data: [measure data]}.
         * for example, [[{measure: "income", data: [555, 666, 777, ...]}, {measure: "cost", data:[55, 66, 77, ...]}, ...], ...]
         */
        _extractMeasureSets : function(data) {
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
                        var result = {};
                        result.data = [];
                        for(var prop in d.values){
                            if(d.values.hasOwnProperty(prop)) {
                                 result.data[prop] = d.values[prop];
                            }
                        }
                        result.measure = d.name;
                        resg.push(result);
                    });
                    reses.push(resg);
                });
                return reses;
            }

            $.each([measureSet1, measureSet2, measureSet3], function(idx, measureSet) {
                measureSet = measureSet ? measureSet.values : undefined;
                if (!measureSet) {
                    return;
                }
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

        /*
         * convert crosstable data to flatten table data
         * @param data [Crosstable Dataset] crosstable dataset or MultiAxisDataAdapter
         * @returns array of objects, and each object represents a row of data table:
         * [{"dimension name1" : value1, "dimension name2" : value2, "measure name1" : value3}, ....{"dimension name1" : valueN1, "dimension name2" : valueN2, "measure name1" : valueN3} ]
         *
         * This method returns an extra meta data in data.meta, which includes all dimension and measure sets.
         */
        _toFlattenTable : function(data) {
            var dimSets = this._extractDimSets(data), measureSets = this._extractMeasureSets(data), fdata = [];
            //measureValueGroup is necessary in crosstable dataset
            //please directly call _util.extractDimSets() to get dimension values 
            if (measureSets.length === 0) { 
                console.warn("no measures"); //GGO: return data even if no measures
                //return null;
            }
            fdata = this._toFlatJsonArray(measureSets, dimSets);
            //fill meta data
            fdata.meta = {
                dimSets : dimSets,
                measureSets : measureSets
            };

            return fdata;
        },

        _toFlatJsonArray : function(measureSets, dimSets) {
            //convert data from ct to flat
            var fdata = [], measure0Data, datum, measure, i, j, k;

            var handleDimensionSet = function(idx, dimSet) {
                if (!dimSet) {
                    return;
                }
                var counter = idx === 0 ? j : i;
                for (k = 0; k < dimSet.length; k++) {
                    datum[dimSet[k].dimension] = dimSet[k].data[counter];
                }
            };
            var handleMeasureSet = function(idx, measureSet) {
                if (!measureSet) {
                    return;
                }
                for (k = 0; k < measureSet.length; k++) {
                    measure = measureSet[k];
                    datum[measure.measure] = measure.data[i][j];
                }
            };
            
            if(measureSets.length>0)
            {
                measure0Data = measureSets[0][0].data;
                for (i = 0; i < measure0Data.length; i++) {
                    for (j = 0; j < measure0Data[i].length; j++) {
                        datum = {};
                        $.each(dimSets, handleDimensionSet);
                        $.each(measureSets, handleMeasureSet);
                        fdata.push(datum);
                    }
                }
            }
            else
            {
                // GGO: case when measureSets is empty
                $.each(dimSets, function(idx, dimSet) {
                    if (!dimSet || !dimSet[0] || !dimSet[0].data) return;
                    for (a = 0; a < dimSet[0].data.length; a++) { // @galigeo : only way I found for the moment to guess how many iterations we need
                        var obj = {};
                        for (var b = 0; b < dimSet.length; b++) {
                            obj[dimSet[b].dimension] = dimSet[b].data[a]
                        }
                        fdata.push(obj);
                    }
                });
            }
            return fdata;
        },

        fireSelectDataEvent : function(dispatch, colName, data, i){
            // this event only works for lumira extension, in which the data model is MultiAxisDataAdapter
            if(this._meta.context) {
                dispatch.selectData({
                    name:"selectData",
                    data:_util.composeSelection(colName, data, this._meta,  i)
                });                
            }
        },

        composeSelection : function(colName, data, meta, index){
            // will add multiple selection support in the future
            var len = 1, returnValue = [], selectionObject = {}, selectionData = [];
            for (var i = 0; i < len; i++) {
                selectionData.push({
                    val: data,
                    ctx: this._meta.context(colName, index)
                });
            }
            selectionObject.data = selectionData;
            returnValue.push(selectionObject);
            return returnValue;
        }
    };
    return _util;
})