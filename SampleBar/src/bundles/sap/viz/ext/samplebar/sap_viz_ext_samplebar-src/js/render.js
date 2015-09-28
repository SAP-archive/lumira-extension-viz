define("sap_viz_ext_samplebar-src/js/render", [], function() {
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
		container.selectAll('g').remove();
		var properties = this.properties(),
			width = this.width(),
			height = this.height(),
			colorPalette = this.colorPalette(),
			dispatch = this.dispatch(),
			dates = data.dates,
			entities = data.entities,
			values = data.values;
		//calculate padding for tick text of y axis, and width/height of canvas
		var ymin = d3.min(values, function(d) {
				return d3.min(d);
			}) * 0.9,
			ymax = d3.max(values, function(d) {
				return d3.max(d);
			}) * 1.1;
		var formater = d3.format(',.0f');
		var tmpText = container
			.append('text')
			.attr('font-size', '12px')
			.text(formater(ymin));
		var xPadding = tmpText[0][0].getBBox().width,
			w = width - xPadding,
			h = height - 50;
		tmpText.remove();

		var canvas = container.append('g')
			.attr('class', 'canvas')
			.attr('width', w)
			.attr('height', h)
			.attr('transform', 'translate(' + xPadding + ', 0)');
		var x1 = d3.scale.ordinal().domain(d3.range(entities.length)).rangeBands([0, w], .2);
		var x2 = d3.scale.ordinal().domain(d3.range(dates.length)).rangeBands([0, x1.rangeBand()]);
		var y = d3.scale.linear().domain([0, ymax]).range([h, 30]);
		//create ticks & lines of y axis
		canvas.append('g')
			.attr('class', 'unit')
			.append('text')
			.attr('x', 0)
			.attr('y', 10)
			.attr('fill', '#999')
			.style('font-size', '12px')
			.text(properties.yTitle); //draw y axis title specified in chart option when creating chart in html

		var rules = canvas.selectAll('g.rule') //tick svg group
			.data(y.ticks(10))
			.enter()
			.append('g')
			.attr('transform', function(d) {
				return 'translate(0,' + y(d) + ')';
			});
		rules.append('line') //tick line
		.attr('x1', -xPadding)
			.attr('y1', 0)
			.attr('x2', w)
			.attr('y2', 0)
			.attr('stroke', '#ddd');
		rules.append('text') //tick text
		.attr('class', 'samplebar_rulestext')
			.attr('x', 0)
			.attr('y', 0)
			.attr('dy', -2)
			.attr('fill', '#ddd')
			.attr('text-anchor', 'end')
			.style('font-size', '12px')
			.text(function(d) {
				return formater(d);
			});
		//bars
		var groups = canvas.selectAll('g.main') //entity svg group
			.data(values)
			.enter()
			.append('g')
			.attr('class', 'main')
			.attr('transform', function(d, i) {
				return 'translate(' + x1(i) + ',0)';
			});
		var renderObj = groups.selectAll('rect') //bars of each year
			.data(function(d) {
				return d;
			})
			.enter()
			.append('rect')
			.attr('width', x2.rangeBand() - 1)
			.attr('height', 0)
			.attr('x', function(d, i) {
				return x2.rangeBand() * i;
			})
			.attr('y', h)
			.attr('fill', function(d, i) {
				return colorPalette[i];
			});
		renderObj.attr('height', function(d) {
			return h - y(d);
		})
			.attr('y', function(d) {
				return y(d);
			});
		dispatch.initialized({
			name: 'initialized'
		});

		groups.append('text') //title of each entry
		.attr('class', 'entity')
			.attr('x', x1.rangeBand() / 2)
			.attr('y', h)
			.attr('dy', 20)
			.attr('text-anchor', 'middle')
			.attr('class', 'samplebar_country')
			.style('font-size', '12px')
			.text(function(d, i) {
				return entities[i];
			});
	};

	return render;
});