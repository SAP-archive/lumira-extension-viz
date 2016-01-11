/*eslint no-shadow:0 no-loop-func:0*/
define("sap_viz_ext_sunburstsequence-src/js/utils/util", [], function() {
	/*
	 * In most cases, you don't need to modify the following code.
	 */
	var _util = { /*__FOLD__*/
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
				var me = this,
					parser = me._getParser(data);
				rows = parser.call(me, data);
				if (!rows) {
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

		buildNameIdx: function(feeds) {
			if (feeds) {
				this._feeds = feeds;
				this._dimMap = {};
				this._mgMap = {};
				var that = this;
				feeds.forEach(function(feed) {
					if (feed.aaIndex) {
						that._dimMap[feed.name] = feed.aaIndex - 1;
					} else {
						that._mgMap[feed.name] = feed.mgIndex - 1;
					}
				});
			}
		},

		_getParser: function(data) {
			if (data.dataset) {
				var dataset = data.dataset;
				if (dataset.table) {
					return this._flat;
				} else {
					return this._cross;
				}
			}
			return this._cross;
		},

		_flat: function(data) {
			var dataset = data.dataset;
			var ret = dataset.table();
			ret.meta = {
				_dimensionSets: [dataset.dimensions()],
				_measureSets: [dataset.measures()],

				dimensions: function(i, j) {
					if (arguments.length === 2) {
						return this._dimensionSets[0][j];
					}
					return this._dimensionSets[0];
				},

				measures: function(i, j) {
					if (arguments.length === 2) {
						return this._measureSets[0][j];
					}
					return this._measureSets[0];
				}
			};

			return ret;
		},

		_parseMeta: function(meta) {
			if (!meta) {
				return null;
			} else {
				return {
					_dimMap: this._dimMap,
					_mgMap: this._mgMap,
					_meta: {
						measureSets: (function(measureSets) {
							var tmp = [];
							$.each(measureSets, function(idx, ele) {
								tmp[idx] = ele.map(function(d) {
									return d.measure;
								});
							});
							return tmp;
						}(meta.measureSets)),
						dimSets: (function(dimSets) {
							var tmp = [];
							$.each(dimSets, function(idx, ele) {
								tmp[idx] = ele.map(function(d) {
									return d.dimension;
								});
							});
							return tmp;
						}(meta.dimSets))
					},
					measures: function(i, j) {
						if (arguments.length === 0) {
							var ret = [];
							$.each(this._meta.measureSets, function(idx, ms) {
								$.each(ms, function(idx, measure) {
									ret.push(measure);
								});
							});
							return ret;
						} else if (arguments.length === 1) {
							if (this._mgMap && this._mgMap[i] !== undefined) {
								i = this._mgMap[i];
							}
							if (!this._meta.measureSets[i]) {
								throw "MeasureGroup \"" + i + "\" not found!";
							}
							return this._meta.measureSets[i];
						} else {
							return this._meta.measureSets[i][j];
						}
					},
					dimensions: function(i, j) {
						if (arguments.length === 0) {
							var ret = [];
							$.each(this._meta.dimSets, function(idx, ds) {
								$.each(ds, function(idx, dim) {
									ret.push(dim);
								});
							});
							return ret;
						} else if (arguments.length === 1) {
							if (this._dimMap && this._dimMap[i] !== undefined) {
								i = this._dimMap[i];
							}
							if (!this._meta.dimSets[i]) {
								throw "Dimension Set \"" + i + "\" not found!";
							}
							return this._meta.dimSets[i];
						} else {
							return this._meta.dimSets[i][j];
						}
					}
				};
			}
		},

		_extractCtx: function(meta, data, fdata) {
			var ctx = {},
				mvLen = data._mg[0].values[0].rows.length,
				vLen = data._mg[0].values[0].rows[0].length,
				dataCtx = [],
				i, j;

			for (i = 0; i < mvLen; i++) {
				var arr = [];
				for (j = 0; j < vLen; j++) {
					arr.push({});
				}
				dataCtx.push(arr);
			}
			$.each(data._mg, function(idx_mg, mg) {
				$.each(mg.values, function(idx_mv, mgValue) {
					var ctxRows = [];
					ctx[mgValue.col] = ctxRows;
					$.each(mgValue.rows, function(idx_a2, rows) {
						$.each(rows, function(idx_a1, row) {
							ctxRows.push(row.ctx);
							dataCtx[idx_a2][idx_a1][mgValue.col] = row.ctx;
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
			fdata.forEach(function(e, idxFdata) {
				Object.defineProperty(e, "context", {
					enumerable: false,
					get: function() {
						return (function(ctxs) {
							return function(measure) {
								if (ctxs && ctxs[measure]) {
									return {
										ctx: [ctxs[measure].path]
									};
								}
								return {
									ctx: [ctxs[measure]]
								};
							};
						}(dataCtx[Math.floor(idxFdata / vLen)][idxFdata % vLen]));
					}
				});
			});
			meta._ctx = ctx;
			meta.context = function(col, dataIdx) {
				return this._ctx[col][dataIdx];
			};
		},

		_cross: function(data) {
			var ret = this._toFlattenTable(data);
			if (!ret) {
				return null;
			}
			return ret;
		},
		/*
		 * extract dimension sets from data
		 * @param data [Crosstable Dataset] crosstable dataset
		 * @returns array of dimension sets, and each dimension set is an object of {dimension: "dimension name", data: [members]}.
		 * e.g. [{dimension: "country", data: ["China", "US", ...]}, {dimension: "year", data: ["2010", "2011", ...]}, ...]
		 */
		_extractDimSets: function(data) {
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
				var dims = [],
					dim;
				for (var i = 0; i < dimSet.length; i++) {
					dim = {
						dimension: dimSet[i].col.val,
						data: []
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
		_extractMeasureSets: function(data) {
			var measureSet1, measureSet2, measureSet3, reses = [];
			if (data.getMeasureValuesGroupDataByIdx) {
				measureSet1 = data.getMeasureValuesGroupDataByIdx(0);
				measureSet2 = data.getMeasureValuesGroupDataByIdx(1);
				measureSet3 = data.getMeasureValuesGroupDataByIdx(2);
			} else if (data.dataset && data.dataset.data) {
				data.dataset.data().measureValuesGroup.forEach(function(g) {
					var resg = [];
					g.data.forEach(function(d) {
						var result = {};
						result.data = [];
						for (var prop in d.values) {
							if (d.values.hasOwnProperty(prop)) {
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
				var res = [],
					resItem, resData, measure;
				for (var k = 0; k < measureSet.length; k++) {
					measure = measureSet[k];
					resItem = {
						measure: measure.col,
						data: []
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
		_toFlattenTable: function(data) {
			var dimSets = this._extractDimSets(data),
				measureSets = this._extractMeasureSets(data),
				fdata = [],
				meta,
				ctx,
				d;
			//measureValueGroup is necessary in crosstable dataset
			//please directly call _util.extractDimSets() to get dimension values 
			if (measureSets.length === 0) {
				return undefined;
			}
			meta = {
				dimSets: dimSets,
				measureSets: measureSets
			};

			if (data.getAnalysisAxisDataByIdx) {
				fdata = this._toFlatJsonArray(measureSets, dimSets);
				/**Extract data context for MultiAxisDataAdapter*/
				meta = this._parseMeta(meta);
				this._extractCtx(meta, data, fdata);
			} else {
				if (data && data.dataset) {
					d = new sap.viz.api.data.CrosstableDataset();
					d.data(data.dataset.data());
					d.info(data.dataset.info());
				} else if (data) {
					d = data;
				}
				if (sap.viz.extapi.utils && sap.viz.extapi.utils.Data && sap.viz.extapi.utils.Data.getDataContext) {
					ctx = sap.viz.extapi.utils.Data.getDataContext(d);
				}
				fdata = this._toFlatJsonArray(measureSets, dimSets, ctx);
				meta = this._parseMeta(meta);
			}

			//fill meta data. for compatible
			fdata.meta = meta;
			return fdata;
		},

		_toFlatJsonArray: function(measureSets, dimSets, ctx) {
			//convert data from ct to flat
			var fdata = [],
				measure0Data, i, j, m, measure, datumCtx, datum;

			measure0Data = measureSets[0][0].data;
			for (i = 0; i < measure0Data.length; i++) {
				for (j = 0; j < measure0Data[i].length; j++) {
					datum = {};
					datumCtx = {};
					$.each(dimSets, function(idx, dimSet) {
						if (!dimSet) {
							return;
						}
						var counter = idx === 0 ? j : i;
						for (m = 0; m < dimSet.length; m++) {
							datum[dimSet[m].dimension] = dimSet[m].data[counter];
						}
					});
					$.each(measureSets, function(idx, measureSet) {
						if (!measureSet) {
							return;
						}
						for (m = 0; m < measureSet.length; m++) {
							measure = measureSet[m];
							datum[measure.measure] = measure.data[i][j];
							if (ctx) {
								/**currently not support same measure name in different measureGroup*/
								datumCtx[measure.measure] = ctx[idx][m][i][j];
							}
						}
					});
					if (ctx) {
						Object.defineProperty(datum, "context", {
							enumerable: false,
							value: (function(ctxs) {
								return function(measure) {
									if (ctxs && ctxs[measure]) {
										return {
											ctx: [ctxs[measure].path]
										};
									}
									return {
										ctx: [ctxs[measure]]
									};
								};
							}(datumCtx))
						});
					}
					fdata.push(datum);
				}
			}
			return fdata;
		},

		composeSelection: function(measure, val, ele, ctx) {
			var len = 1,
				selectionData = [],
				selectElements = [];

			for (var i = 0; i < len; i++) {
				selectionData.push({
					val: val,
					ctx: ctx
				});
			}

			selectElements.push({
				target: ele,
				data: selectionData
			});
			return selectElements;
		}
	};
	return _util;
});