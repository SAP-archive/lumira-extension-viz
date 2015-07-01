/*<<dependency*/
define("sap_viz_ext_footballheatmap-src/js/render", ["sap_viz_ext_footballheatmap-src/js/utils/util"], function(util){
/*dependency>>*/ 

 
   var render = function(data, container, width, height, colorPalette, properties, dispatch) {

		container.selectAll('svg').remove();
        
        
        var dsets = data.meta.dimensions(),
            msets = data.meta.measures();
        
        var mset1 = data.meta.measures(0); 
		var dset1 = data.meta.dimensions(0),
         measureValue = mset1[0],
         xDimension = dset1[0],
         yDimension = dset1[1];
		
       

        //Convert measure into number
        data.forEach(function(d) {
            d[xDimension] = +d[xDimension];
            d[yDimension] = +d[yDimension];
            d[measureValue] = +d[measureValue];
           
        });
        
        
        var canvasWidth = container.node().offsetWidth;
        var canvasHeight = container.node().offsetHeight;
        var fieldWidth, fieldHeight,leftMargin;

        if (canvasWidth/canvasHeight>1.5)
        { 
            fieldWidth = canvasHeight*1.5;
            fieldHeight = canvasHeight;
            leftMargin = (canvasWidth-fieldWidth)/2;
        }
        else{ 
            fieldWidth = canvasWidth;
            fieldHeight = canvasWidth/1.5;
            leftMargin = 0;
        }
     
		var centerRadius= 9.15*fieldHeight/68  ;
		var sideLengthOfPenaltyArc= 5.5*fieldWidth/105;
		
        var xMin= d3.min( data,function(d) { return d[xDimension];});
        var xMax= d3.max( data,function(d) { return d[xDimension];});
        
        var yMin= d3.min( data,function(d) { return d[yDimension];});
        var yMax= d3.max( data,function(d) { return d[yDimension];});

        var maxValue = d3.max( data,function(d) { return d[measureValue];});
		//Calculators for finding place of points on pitch
		var y = d3.scale.linear()
			.range([0,fieldHeight])
			.domain([yMin, yMax]);
        
		var x = d3.scale.linear()
			.range([0,fieldWidth])
			.domain([xMin, xMax]);
        
        var heatData=[];
		
        data.forEach(function(d) {
            var point={x:x(d[xDimension]),y:y(d[yDimension]),value:d[measureValue]};
            heatData.push(point);
        });
        
        require([
          //'C:/LumiraFiles/heatmap2.js',
        '../sap/bi/bundles/sap/viz/ext/footballheatmap/heatmap2.js',
            ], function ( ) {
	        // call google maps API after everything is loaded
	        initializeHeatMap();
        });
		
        function initializeHeatMap(){
			//Main div for including heatmap and football pitch
			container.node().innerHTML="";
			var mainContainer = document.createElement('div');
			mainContainer.style.width =canvasWidth+'px';
			mainContainer.style.height =fieldHeight+'px';
          //  mainContainer.style.left = leftMargin+'px';
            mainContainer.className = 'divGreen';
			container.node().appendChild(mainContainer);
			
			//Div for heatmap
			var heatmapContainer = document.createElement('div');
			heatmapContainer.style.width = fieldWidth+'px';
			heatmapContainer.style.height = fieldHeight+'px';
			//heatmapContainer.style.left = leftMargin+'px';
			heatmapContainer.className = 'divCSS';
			
			//Div for drawing football pitch
			var pitchContainer = document.createElement('div');
			pitchContainer.style.width =fieldWidth+'px';
			pitchContainer.style.height =fieldHeight+'px';
			pitchContainer.style.left = leftMargin+'px';
            pitchContainer.style.strokeWidth= fieldWidth/150;
			pitchContainer.className = 'divCSS';
		   
           			var lineContainer = document.createElement('div');
			lineContainer.style.width =fieldWidth+'px';
			lineContainer.style.height =fieldHeight+'px';
			lineContainer.style.left = leftMargin+'px';
            lineContainer.style.strokeWidth= fieldWidth/150;
			lineContainer.className = 'lines';
           
           //Div for drawing football pitch
			var greenLayer = document.createElement('div');
			greenLayer.style.width =fieldWidth+'px';
			greenLayer.style.height =fieldHeight+'px';
			greenLayer.style.left = leftMargin+'px';
            greenLayer.style.strokeWidth= fieldWidth/150;
			greenLayer.className = 'divCSS';
            
            mainContainer.appendChild(pitchContainer);
			pitchContainer.appendChild(heatmapContainer);
            mainContainer.appendChild(greenLayer);
            mainContainer.appendChild(lineContainer);
			

            var centerRadius= 9.15*fieldHeight/68  ;
           
            var heatmap = h337.create({
  container: heatmapContainer,
  radius: centerRadius*1.5
});

heatmap.setData({
  max: maxValue,
  data: heatData
});


			
			//Calculate angle of penalty arc. 
			var sideLengthOfPenaltyArc= 5.5*fieldWidth/105;
			var arcAngle = Math.asin(sideLengthOfPenaltyArc/centerRadius);

			//svg container for drawing all pitch lines
			var svgContainerLines = d3.select(lineContainer).append("svg")
				.attr("width", fieldWidth)
				.attr("height", fieldHeight);
			
			//Create a svg container for green rectangle (green pitch)
			var svgContainerGreen = d3.select(mainContainer).append("svg")
				.attr("width", canvasWidth)
				.attr("height", canvasHeight);
		 
			//green field
			svgContainerGreen.append("rect")
				.attr("x", leftMargin)
				.attr("y", 0)
				.attr("width",fieldWidth )
				.attr("height", fieldHeight)
				.attr("fill", "#35BA02");
            
             //Draw vertical bars on field
            for (i=1;i<21;i=i+2){
                svgContainerGreen.append("rect")
				    .attr("x", leftMargin+i*fieldWidth/20)
				    .attr("y", 0)
				    .attr("width",fieldWidth/20 )
				    .attr("height", fieldHeight)
				    .attr("fill", "white")
                    .attr("fill-opacity", "0.2");
            }
            
			//Center Circle
			svgContainerLines.append("circle")
				.attr("cx",fieldWidth/2)
				.attr("cy",fieldHeight/2)
				.attr("r", centerRadius);

			//Center dot
			svgContainerLines.append("circle")
				.attr("cx",fieldWidth/2)
				.attr("cy",fieldHeight/2)
				.attr("r", fieldHeight*0.3/68)
				.attr("fill", "white");
			
			//Side Border
			svgContainerLines.append("rect")
				.attr("x", 3)
				.attr("y", 3)
				.attr("width", fieldWidth-6)
				.attr("height", fieldHeight-6);
			 
			 //Center Line
			 svgContainerLines.append("line")
				.attr("x1", fieldWidth/2)
				.attr("y1", 3)
				.attr("x2", fieldWidth/2)
				.attr("y2", fieldHeight-3);
			
			//Left big ractangle
			svgContainerLines.append("rect")
				.attr("x", 3)
				.attr("y", fieldHeight*13.85/68)
				.attr("width", fieldWidth*16.5/105)
				.attr("height", fieldHeight*40.3/68);

			//Left small rectangle
			svgContainerLines.append("rect")
				.attr("x", 3)
				.attr("y", fieldHeight*24.85/68)
				.attr("width", fieldWidth*5.5/105)
				.attr("height", fieldHeight*18.3/68);
			
			//Left goal
			svgContainerLines.append("rect")
				.attr("x",2)
				.attr("y", fieldHeight*30.34/68)
				.attr("width", 2)
				.attr("height", fieldHeight*7.32/68)
				.attr("fill", "white");
			   
			var leftArc = d3.svg.arc()
				.innerRadius(centerRadius)
				.outerRadius(centerRadius)
				.startAngle(arcAngle ) //converting from degs to radians
				.endAngle(Math.PI-arcAngle) //just radians

			svgContainerLines.append("path")
				.attr("d", leftArc)
				.attr("transform", "translate("+(fieldWidth*11/105+3)+","+fieldHeight/2+")")

			//Left dot
			svgContainerLines.append("circle")
				.attr("cx",fieldWidth*11/105+3)
				.attr("cy",fieldHeight/2)
				.attr("r", fieldHeight*0.2/68)
				.attr("fill", "white");
		
			//Right big ractangle
			svgContainerLines.append("rect")
				.attr("x", fieldWidth-3-fieldWidth*16.5/105)
				.attr("y", fieldHeight*13.85/68)
				.attr("width", fieldWidth*16.5/105)
				.attr("height", fieldHeight*40.3/68);

			//Right small rectangle
			svgContainerLines.append("rect")
				.attr("x", fieldWidth-3-fieldWidth*5.5/105)
				.attr("y", fieldHeight*24.85/68)
				.attr("width", fieldWidth*5.5/105)
				.attr("height", fieldHeight*18.3/68);
								
			//Right goal
			svgContainerLines.append("rect")
				.attr("x",fieldWidth-4.5)
				.attr("y", fieldHeight*30.34/68)
				.attr("width", 2)
				.attr("height", fieldHeight*7.32/68)
				.attr("fill", "white");
			
			//Right dot
			svgContainerLines.append("circle")
				.attr("cx",fieldWidth-3-fieldWidth*11/105)
				.attr("cy",fieldHeight/2)
				.attr("r", fieldHeight*0.2/68)
				.attr("fill", "white");
			
			var rightArc = d3.svg.arc()
				.innerRadius(centerRadius)
				.outerRadius(centerRadius)
				.startAngle(Math.PI+arcAngle)
				.endAngle(2*Math.PI-arcAngle) ;
	  
			svgContainerLines.append("path")
				.attr("d", rightArc)
				.attr("transform", "translate("+Math.round(fieldWidth-3-fieldWidth*11/105)+","+fieldHeight/2+")");

			var centerRadius= 9.15*fieldHeight/68  ;
			var sideLengthOfPenaltyArc= 5.5*fieldWidth/105;		   

        }
    };

    return render; 
});