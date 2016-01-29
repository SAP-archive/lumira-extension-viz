define(["./metadata"], function(getMetadata) {
	return function() {
		var ExtensionChart = sap.viz.extapi.core.BaseChart.extend();
		var metadata = getMetadata();

		ExtensionChart.metadata = metadata;

		var baseDataFunc = ExtensionChart.prototype.data;

		ExtensionChart.prototype.data = function(data) {
			if (arguments.length > 0) {
				this._parseData(data); // in case thers isn't any data
			}
			return baseDataFunc.apply(this, arguments);
		};

		ExtensionChart.prototype._parseData = function(_data) {
			var bindings = this.bindings();
			var scores = [];
			var dimensions;
			
			bindings.forEach(function(binding) {
				if (binding.feed === "sap.viz.ext.hrztmeanptbar.PlotModule.MS1") {
					scores = binding.source;
				} else if (binding.feed === "sap.viz.ext.hrztmeanptbar.PlotModule.DS1") {
					dimensions = binding.source;
				}
			});
			console.log(bindings);
			
			this._dims = dimensions;
			this._scores = scores;
			
			_data.forEach(function(d) {
	        	d["DependTotal"] = (function(){
	        		var deptotal = 0;
	        		for(var i = 0; i < scores.length ; i++){
	        			deptotal += d[scores[i]];
	        		}
	        		return deptotal;
	        	})();
	    	});
	    	var cateName = this._dims[0];
			var _nest_data = d3.nest()
				.key(function(d) { return d[cateName]; })
				.entries(_data);
				
			_nest_data.forEach(function(d) {
	        	d["mean_Depend"] = (function(){
	        		var allmodeldep = 0;
	        		for(var i = 0; i < d.values.length ; i++){
	        			allmodeldep += d.values[i]["DependTotal"];
	        		}
	        		return allmodeldep/d.values.length;
	        	})();
	        	d["min_Depend"] = d3.min(d.values, function(obj) {  return obj["DependTotal"];  });
	        	d["max_Depend"] = d3.max(d.values, function(obj) {  return obj["DependTotal"];  });
	    	});
	    	
	    	_nest_data.sort(function(a,b){ 
	    		if (a["mean_Depend"] > b["mean_Depend"]) {   return -1; }
				if (a["mean_Depend"] < b["mean_Depend"]) {   return 1; }
				return 0;
	    	});
	    	
	    	var brandDependTotal = 0;
			var _minVal = d3.min(_data, function(d) {  brandDependTotal += d["DependTotal"]; return d["DependTotal"];  });
			var _maxVal = d3.max(_data, function(d) {  return d["DependTotal"];  });
			
			_nest_data["BrandDependMean"] =  brandDependTotal / _data.length;
			
			this.min_val = _minVal;
			this.max_val = _maxVal;
			this.nest_data = _nest_data;
		};
		
		ExtensionChart.prototype.render = function(builtInComponents, changes) {
			var container = this.container();
			container.selectAll('svg').remove();
			
			var svg = container.append('svg');
			var size = this.size(),
				width = size.width,
				height = size.height;
			
			svg.attr("width", width).attr("height", height).attr("class", "sap_viz_ext_vermeanptbar");

			var properties = this.properties().plotArea,
				colorPalette = properties.colorPalette;
			
			this.margin = {  top: 50, right: 10,	bottom: 10,	left: 30};
			this.plotWidth = width - this.margin.left - this.margin.right;
			this.plotHeight = height - this.margin.top - this.margin.bottom;
			this.percentTittle = "% Better or Worse than Average";
			
			console.log("Min Val: " + this.min_val + "; Max Val: " + this.max_val);
			console.log(this.nest_data);
			
			var dataset = this.nest_data;
			
			var MeanPointBar = new DrawMeanPtBar(dataset, svg, this);
			var yAxisWidth = MeanPointBar.DrawAxis(this.plotWidth, this.plotHeight, this.max_val);
			MeanPointBar.DrawBrandBar();
			MeanPointBar.UpdateAxis(this.plotWidth - yAxisWidth, this.plotHeight, yAxisWidth);
			MeanPointBar.UpdateBrandBar(this.plotWidth - yAxisWidth);
		};
		
		function DrawMeanPtBar(newdataset, svg, that){
			var x = d3.scale.linear(),
				y = d3.scale.ordinal(),
				yBrandList;
			console.log("W: " + that.plotWidth + ", and H: " + that.plotHeight);
				
			var xAxisContainer = svg.append("g").attr("class", "x sap_viz_ext_vermeanptbar_axis"),
				yAxisContainer = svg.append("g").attr("class", "y sap_viz_ext_vermeanptbar_axis"),
				xAxisHintContainer = svg.append("g").attr("class", "x sap_viz_ext_vermeanptbar_axis_hint"),
				xAxisFullHeight, xAxis, yAxis,
				yAxisWid = 0 ;
			
			this.DrawAxis = function(_plotWidth, _plotHeight, maxVal){
				console.log(newdataset);
				x.rangeRound([0, _plotWidth]);
				y.rangeRoundBands([0, _plotHeight], .3);
				var xMeanVal = newdataset["BrandDependMean"].toFixed(0);
				
				x.domain([that.min_val, that.max_val]).nice();
				y.domain(newdataset.map(function(d) { 
					return d.key +" ("+ d.values.length +")"; 
				}));
				yBrandList = y.domain();
				
				xAxis = d3.svg.axis().scale(x).orient("top")
							.ticks(11)
							.tickFormat(function(d) { 
								var offPercent = (d - xMeanVal ) / (x.domain()[1] - xMeanVal) * 100;
							//	var offPercent = (d - xMeanVal ) / (maxVal - xMeanVal) * 100;
								return Math.floor(offPercent) + "%"; 
							});
				xAxisFullHeight = d3.svg.axis().scale(x).orient("bottom")
							.ticks(11)
							.tickSize(_plotHeight);

				yAxis = d3.svg.axis().scale(y).orient("left");
				
				xAxisHintContainer.call(xAxisFullHeight);
				xAxisHintContainer.attr("transform", "translate(" + that.margin.left + "," + that.margin.top + ")");
		    	xAxisContainer.call(xAxis);
				xAxisContainer.attr("transform", "translate(" + that.margin.left + "," + that.margin.top + ")");
				
		    	yAxisContainer.call(yAxis);
		    	yAxisContainer.attr("transform", "translate(" + that.margin.left + "," + that.margin.top + ")");
		    	
		    	yAxisWid = svg.select(".y.sap_viz_ext_vermeanptbar_axis").node().getBBox().width;
		    	
		    	return yAxisWid;
			};
			//.node().getBBox().width;
			
			var brandList = svg.append("g").attr("class", "sap_viz_ext_vermeanptbar_brandList"),
				brandBar;
			
			this.DrawBrandBar = function(){
				brandBar = brandList.selectAll(".sap_viz_ext_vermeanptbar_brandBar")
		    		.data(newdataset)
		    		.enter()
		    		.append("g")
		    		.attr("class", "sap_viz_ext_vermeanptbar_brandBar")
		    		.attr("transform", function(d,i) { return "translate(0," + y(yBrandList[i]) + ")"; });
				
				brandBar.append("rect")
					.attr("class", "sap_viz_ext_vermeanptbar_brandRect")
					.attr("width", that.plotWidth)
					.attr("height", y.rangeBand())
					.attr("x", "1")
					.attr("y", 0 )
					.attr("fill-opacity", "0.5")
					.style("fill", "#F5F5F5");
		          //.attr("class", function(d,index) { return index%2==0 ? "even" : "uneven"; });
		          
				brandBar.append("rect")
					.attr("class", "sap_viz_ext_hrztmeanptbar_depRangeScore")
					.attr("width", function(d){ return x(d["max_Depend"]) - x(d["min_Depend"]); })
					.attr("height", y.rangeBand())
					.attr("x", function(d){ return x(d["min_Depend"]); })
					.attr("y", 0 )
					.attr("fill-opacity", "0.9")
					.style("fill", "#086fad");
					// .style("fill", function(d){ return color(d.key); });
				
				brandBar.append("circle")
					.attr("class", "sap_viz_ext_vermeanptbar_depMeanPoint")
					.attr("r", y.rangeBand()*.8/2)
					.attr("cx", function(d) { return x(d["mean_Depend"]); })
		    		.attr("cy", y.rangeBand()/2)
					.style("fill", "#FFE066");
				
			}; // DrawBrandBar()
			
			brandList.attr("transform", "translate("+ that.margin.left + "," + that.margin.top + ")");
			
			this.UpdateAxis = function(_plotWidth, _plotHeight, AxisOffset){
				x.rangeRound([0, _plotWidth]);
				y.rangeRoundBands([0, _plotHeight], .3);
				
				xAxis.scale(x);
				yAxis.scale(y);
				xAxisFullHeight.scale(x);
				
				xAxisContainer.call(xAxis);
				xAxisHintContainer.call(xAxisFullHeight);
				yAxisContainer.call(yAxis);
				
				var hintTittle = xAxisContainer.append("g").attr("width", _plotWidth);
	
				hintTittle.append("text")
					.attr("class", "x_axis_percentTittle")
					.attr("dy", "-2em")
					.attr("dx", "50%")
					.attr("fill", "#333")
					.text(that.percentTittle);
				
				//d3.select(".sap_viz_ext_vermeanptbar")
				svg.select("g.sap_viz_ext_vermeanptbar_brandList")
					.attr("transform", "translate(" + AxisOffset + "," + that.margin.top + ")");
				
				xAxisContainer.attr("transform", "translate(" + AxisOffset + "," + that.margin.top + ")");
				xAxisHintContainer.attr("transform", "translate(" + AxisOffset + "," + that.margin.top + ")");
		    	yAxisContainer.attr("transform", "translate(" + AxisOffset + "," + that.margin.top + ")");
			};
			
			this.UpdateBrandBar = function(_plotWidth){
				var dims = that._dims,
					color = that._colors,
					data = that.data;
				console.log(color);
				var brandBarRect = brandBar.selectAll(".sap_viz_ext_vermeanptbar_brandRect");
				var brandBarItem = brandBar.selectAll(".sap_viz_ext_hrztmeanptbar_depRangeScore");
				var brandBarPoint = brandBar.selectAll(".sap_viz_ext_vermeanptbar_depMeanPoint");
				
				brandBarRect.attr("width", _plotWidth);
				brandBarItem.attr("width", function(d){ return x(d["max_Depend"]) - x(d["min_Depend"]); })
					.attr("x", function(d){ return x(d["min_Depend"]); });
				brandBarPoint.attr("cx", function(d) { return x(d["mean_Depend"]); });
				
				color.domain(data.map(function(d) {
					return d[dims[2]]; 
				}));
				console.log(color.domain());
			};
		} // DrawMeanPtBar()
		
		ExtensionChart.prototype.setToolTip = function(svg){
			
		};

		return ExtensionChart;
	};
});