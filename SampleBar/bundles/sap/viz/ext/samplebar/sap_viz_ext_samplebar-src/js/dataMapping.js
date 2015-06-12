define("sap_viz_ext_samplebar-src/js/dataMapping", [], function(){
    var processData = function(data, feeds, done) {
        var dates, entities, rawValues, values, ret;
        //fetch data from crosstable model to data array of dimensions and measures
		if (data.getAnalysisAxisDataByIdx) {
			var rawDates = data.getAnalysisAxisDataByIdx(1).values[0].rows;
			dates = [];
			//date dimension
			for (var i = 0; i < rawDates.length; i++) {
				dates.push(rawDates[i].val);
			}
			var rawEntities = data.getAnalysisAxisDataByIdx(0).values[0].rows;
			entities = [];
			//entity dimension
			for (i = 0; i < rawEntities.length; i++) {
				entities.push(rawEntities[i].val);
			}
			rawValues = data.getMeasureValuesGroupDataByIdx(0).values[0].rows;
			values = [];
			//measure values
			for (i = 0; i < rawValues.length; i++) {
				for (var j = 0; j < rawValues[i].length; j++) {
					if (!values[j]) {
						values[j] = [];
					}
					values[j].push(rawValues[i][j].val);
				}
			}
		} else {
			dates = data.dataset.data().analysisAxis[1].data[0].values;
			entities = data.dataset.data().analysisAxis[0].data[0].values;
			rawValues = data.dataset.data().measureValuesGroup[0].data[0].values;
			values = [];
			for (i = 0; i < rawValues.length; i++) {
				for (j = 0; j < rawValues[i].length; j++) {
					if (!values[j]) {
						values[j] = [];
					}
					values[j].push(rawValues[i][j]);
				}
			}
		}
		ret = {
		    dates: dates,
		    entities: entities,
		    values: values
		};
        return done(null, ret);
    };
    return processData;
});