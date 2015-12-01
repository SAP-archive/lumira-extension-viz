define("sap_viz_ext_swotanalysis-src/js/render", [], function() {
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
		// TODO: add your own visualization implementation code below ...
		console.log(data);
		var cateEnvir = data.meta.dimensions(0);
		var description = data.meta.dimensions(1);
		// var swatcontent = data.meta.dimensions('Description');
		var measure =  data.meta.measures(0);
		console.log(cateEnvir);
		console.log(description);
		
		var sectioncolor = ["#BDD673","#91C1E8","#E07A5E",'#D8AFD6'];
		var priority_order = ["Strengths", "Weaknesses", "Opportunities", "Threats"];
		
		var categoryData = d3.nest()
	          .key(function(d){ return d[cateEnvir[0]] || d.Category; })
	          .sortKeys(function(a,b) { return priority_order.indexOf(a) - priority_order.indexOf(b); })
	          .entries(data); 
	          
		var envirData = d3.nest()
	          .key(function(d){return d[cateEnvir[1]] || d.Environment;})
	          .key(function(d){return d[cateEnvir[0]] || d.Category;})
	          .entries(data); 
	          
	    var cateTitle = categoryData.map(function(d){  return d.key;  }),
			envirTitle = envirData.map(function(d){  return d.key;  });
		console.log(cateTitle);
		console.log(envirTitle);
		
		clearEmpty(categoryData);
		clearEmpty(envirData);
		console.log(categoryData);
		console.log(envirData);
		
		var margin = {	top: 20,	right: 40,	bottom: 30,	left: 20 },
			width = this.width() - margin.left - margin.right,
			height = this.height() - margin.top - margin.bottom;
		
		container.selectAll("div").remove(); //First remove any existing <p> element  
		
		var svg = container
		    .style("width", width + margin.left + margin.right)
			.style("height", height + margin.top + margin.bottom);
		
		var swot_form = svg.append("div").attr("class", "swotanlyContainer");
				
		var content_sec = swot_form.selectAll("div.contentSection")
				.data(categoryData)
				.enter()
				.append("div")
				.attr("class", "contentSection")
				// .style("background-color", function(d,i){
				// 	return sectioncolor[i];
				// })
				.style("background-color", "white")
				.attr("id", function(d){
					return d.key;
				});
				
		content_sec.append("div")
				.attr("class", "capitalLet float_right")
				.text(function(d){
					return d.key.split("")[0];
				 });
				
		content_sec.append("p")
				.attr("class", "blueTitle")
				.text(function(d){
					return d.key;
				 });
		console.log(content_sec);
		
		var content_desp = content_sec.append("ul")
		 		.attr("class", "description")
		 		.selectAll("li")
		 		.data(function(d){ 
		 			var validArray = [];
		 			for(var i in d.values){
		 				if(d.values[i][measure]){ validArray.push(d.values[i]); }
		 			}
		 			return validArray;
		 		})
		 		.enter()
		 		.append("li")
    			.text(function(d) { return d[description[0]]|| d.Description; });
    	
    	var title = svg.append("div")
			.attr("class", "mainTitle")
			.selectAll("div.mainTitle")
			.data(envirData)
			.enter()
			.append("div")
			.attr("class", "envirSec")
			.style("top", function(d,i){
				var secHeight = 100,
					titleHeight = d3.select(this).node().getBoundingClientRect().height/2;
				if(i<1){
					secHeight = d3.select('div.contentSection#' + cateTitle[i]).node().getBoundingClientRect().height/2;
				}else{
					secHeight = d3.select('div.contentSection#' + cateTitle[0]).node().getBoundingClientRect().height +  d3.select('div.contentSection#' + cateTitle[i*2]).node().getBoundingClientRect().height/2;
				}
				return secHeight-titleHeight + 'px';
			})
			.append("p")
			.attr("class", "envirTitle")
			.text(function(d){	return d.key.split(" ")[0];});

	};
	
	function clearEmpty(data){
		for (var i in data){
			if(data[i].key === ""){
				data.splice(i, 1);
			}
		} // clear useless data group
		return data;
	}
	return render;
});