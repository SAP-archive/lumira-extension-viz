define("sap_viz_ext_sankey-src/js/render", [], function() {
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
		container.selectAll('div').remove();

		//Retrieve chart properties  
		var width = this.width(),
			height = this.height(),
			colorPalette = this.colorPalette(),
			properties = this.properties(),
			dispatch = this.dispatch();

		//Retrieve meta data info
		var meta = data.meta,
			sourceDim = meta.dimensions('Nodes')[0],
			targetDim = meta.dimensions('Nodes')[1],
			valueMeasure = meta.measures('Value')[0];

		window.sap_viz_ext_sankey_sankeyRenderer = function() {
			console.log(JSON.stringify(data));
			var dataTable = new google.visualization.DataTable();
			dataTable.addColumn('string', 'From');
			dataTable.addColumn('string', 'To');
			dataTable.addColumn('number', 'Weight');
			for (var i = 0; i < data.length; i++) {
				dataTable.addRow([data[i][sourceDim], data[i][targetDim], data[i][valueMeasure]]);
			}

			// Sets chart options.
			var options = {
				width: width,
				height: height,
				sankey: {
					node: {
						colors: colorPalette
					},
					link: {
						colors: colorPalette,
						colorMode: 'gradient'
					}
				}
			};

			// Instantiates and draws our chart, passing in some options.
			var chart = new google.visualization.Sankey(container.node());
			chart.draw(dataTable, options);
		};

		require(["https://www.google.com/jsapi"], function() {
			google.load('visualization', '1.1', {
				packages: ['sankey'],
				callback: sap_viz_ext_sankey_sankeyRenderer
			});
		});
	};

	return render;
});