/*<<dependency*/
define("sap_viz_ext_geomapsleaflet-src/js/render", ["sap_viz_ext_geomapsleaflet-src/js/utils/util"], function(util){
/*dependency>>*/
   var cssLoadStatus =false;
      var centerStatus=false;
      var counter=0;
      
      var render = function(data, container, width, height, colorPalette, properties, dispatch) {
   //prepare canvas with width and height of container
	//prepare canvas with width and height of container
	
    	container.selectAll('svg').remove();
		
        
        //var filePath='C:\LumiraFiles'; //For vizpacker 
        var filePath='../sap/bi/bundles/sap/viz/ext/geomapsleaflet';  //For porductive
        
	
        var dsets = data.meta.dimensions(),

        msets = data.meta.measures();
        
        var mset1 = data.meta.measures(0); 
        // only one measure 'Margin' is used in this sample
        var ms1 = mset1[0];                                                      
        var dset1 = data.meta.dimensions(0);
      	var dimLat, dimLon,shapeName;
		
		if(dset1.length===3){
			if(dset1[0].toLowerCase().substring(0, 3) === 'lat') {dimLat = dset1[0];}
			else if (dset1[1].toLowerCase().substring(0, 3) === 'lat') {dimLat = dset1[1];}
			else if (dset1[2].toLowerCase().substring(0, 3) === 'lat') {dimLat = dset1[2];}
			
			if(dset1[0].toLowerCase().substring(0, 3) === 'lon') {dimLon = dset1[0];}
			else if (dset1[1].toLowerCase().substring(0, 3) === 'lon') {dimLon = dset1[1];}
			else if (dset1[2].toLowerCase().substring(0, 3) === 'lon') {dimLon = dset1[2];}
			
			if(dset1[0].toLowerCase().substring(0, 3) !== 'lon' & dset1[0].toLowerCase().substring(0, 3) !== 'lat') {shapeName = dset1[0];}
			else if (dset1[1].toLowerCase().substring(0, 3) !== 'lon' & dset1[1].toLowerCase().substring(0, 3) !== 'lat'){shapeName = dset1[1];}
			else if (dset1[2].toLowerCase().substring(0, 3) !== 'lon' & dset1[2].toLowerCase().substring(0, 3) !== 'lat'){shapeName = dset1[2];}
		}
		else if(dset1.length===2){
			if(dset1[0].toLowerCase().substring(0, 3) === 'lat') {dimLat = dset1[0];}
			else if (dset1[1].toLowerCase().substring(0, 3) === 'lat') {dimLat = dset1[1];}
			
			if(dset1[0].toLowerCase().substring(0, 3) === 'lon') {dimLon = dset1[0];}
			else if (dset1[1].toLowerCase().substring(0, 3) === 'lon') {dimLon = dset1[1];}
		}
		else if (dset1.length===1){
			if(dset1[0].toLowerCase().substring(0, 3) !== 'lon' & dset1[0].toLowerCase().substring(0, 3) !== 'lat') {shapeName = dset1[0];}
		}
		
        if(cssLoadStatus === false){    
			var element = document.createElement('link');
            element.type = 'text/css';
            element.rel = 'stylesheet';
            element.href = filePath+'/leaflet.css';  
			
			document.body.appendChild(element);
			cssLoadStatus=true;             
		}//end of if
       
	    var fdata = data.slice();
		
		var aggregatedData = fdata.reduce(function(res, obj) {
			if (!(obj[shapeName] in res)){
				res.__array.push(res[obj[shapeName]] = obj);}
			else {
				res[obj[shapeName]][ms1] += obj[ms1];
			}
			return res;
		}, {__array:[]}).__array
					.sort(function(a,b) { return b.bytes - a.bytes; });

        var max2=0;
        aggregatedData.forEach(function(d) { 
            if (d[ms1] > max2) {max2 = d[ms1];}
        });//end of find max

        var min2= max2;

        fdata.forEach(function(d) { 
            if (d[ms1] < min2) {min2 = d[ms1];}
        });//end of fin min
        
		var max=0;
        fdata.forEach(function(d) { 
            if (d[ms1] > max) {max = d[ms1];}
        });//end of find max

        var min= max;

        fdata.forEach(function(d) { 
            if (d[ms1] < min) {min = d[ms1];}
        });//end of fin min
                
		var colors=this.properties().colorPalette;

        var colorScale = d3.scale.linear()
            .domain([min,max])
            .range([colors[1], colors[0]]);

        var colorScale2 = d3.scale.linear()
            .domain([min2,max2])
            .range([colors[3], colors[2]]);

        var radiusScale = d3.scale.linear()
            .domain([min,max])
            .range([1, 10]);

			//Create Map Div
            container.node().innerHTML="";
		    var mapArea = document.createElement('div');
		    mapArea.style.width =container.node().offsetWidth+'px';
		    mapArea.style.height =container.node().offsetHeight+'px';
		    container.node().appendChild(mapArea);
      


        require([
    		filePath+'/leaflet.js',
    		filePath+'/geojson.js'
    		
		], function ( ) {
            
            getScript(filePath+'/basemaps.js', function(){
              createMap(6);
            });
            
        });

function getScript(url, callback) {

   var script = document.createElement('script');
   script.type = 'text/javascript';
   script.src = url;

   script.onreadystatechange = callback;
   script.onload = callback;

   document.getElementsByTagName('head')[0].appendChild(script);
};

		function createMap(zoomLevel) { 
			var latlngArray = [];




			if (typeof defaultTileProvider==='undefined'){
				map = L.map(mapArea);
			}
			else
			{
				map = L.map(mapArea,{layers:[defaultTileProvider]});
			}
 
 
			//Color function for geojson shapes
			function getColor(location){
				var layerColor = '#EFEDEA';//Default color for no data
				var measureValue = '';
				aggregatedData.forEach(function(d, i) {
					if(location === d[shapeName]){
						measureValue = aggregatedData[i][ms1];
						layerColor=colorScale2(measureValue);
					}
				});
					
					return layerColor;
			}
				
			function style(feature) {
				return {
					fillColor: getColor(function(d){return d[ms1];}),
					weight: 2,
					opacity: 1,
					color: 'white',
					dashArray: '2',
					fillOpacity: 0.7
				};
			}
			
			//Function for setting style of shape layer
			function setGeoStyle(layer){
				layer.setStyle(
				{
					fillColor: getColor(layer.feature.properties.name),
					weight: 1.5,
					opacity: 1,
					color: 'white',
					fillOpacity: 0.7
				});
			}
				
			//Popups for shape layer
			function setPopup(layer){
				var measureValue = '';
			
				for (var i=0; i<aggregatedData.length;i++)
				{
					if(aggregatedData[i][shapeName] === layer.feature.properties.name)
					{
						measureValue = aggregatedData[i][ms1];
						break;
					}
				}
				layer.bindPopup('<h2>'+layer.feature.properties.name+'<\/h2><p>'+ms1+": "+measureValue+'<\/p>');
			}

				
			//Embed shapes into the map
			if(typeof shapeName !== 'undefined'){
				var geoLayers = new L.geoJson();
				geoLayers.addData(mapdata);
				geoLayers.addTo(map);
				
				geoLayers.eachLayer(setGeoStyle);
				geoLayers.eachLayer(setPopup);
			}

			//Function to draw markers
            function drawMarkers(){
				if(typeof dimLat !== 'undefined' & typeof dimLon !== 'undefined')
				{
					markerLayer = new L.layerGroup;
					
					fdata.forEach(function(d, i) { 
						var latlng = L.latLng([d[dimLat],d[dimLon]]);		
						latlngArray.push(latlng);
													
						var blueIcon = L.icon({
							iconUrl: filePath+'/images/marker-icon.png',
							iconSize:     [12, 19], // size of the icon
							iconAnchor:   [6, 19], // point of the icon which will correspond to marker's location
						});
						  
						var marker = L.marker(latlng, {icon:blueIcon});

						if (typeof shapeName !=='undefined'){
							var popupText = d[shapeName]+"<br>"+ms1+": "+d[ms1];
						}
						else{
							var popupText = ms1+": "+d[ms1];
						}
						marker.bindPopup(popupText);
						markerLayer.addLayer(marker);
					});
				}
			}		
			
			//Function for finding darker of given color. Used for outline of circles.
			function shadeColor1(color, percent) {  
				var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
				return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
			}
			
			//Function for drawing circles
            function drawCircles(zoomLevel){				
				if(typeof dimLat !== 'undefined' & typeof dimLon !== 'undefined')
				{
					circleLayer = new L.layerGroup;
					
					fdata.forEach(function(d) { 
						var latlng = L.latLng([d[dimLat],d[dimLon]]);		
						latlngArray.push(latlng);
													
						var MarkerOptions = {
							radius: radiusScale(d[ms1])*Math.pow(2, ((zoomLevel-3)>0?(zoomLevel-3):0))/4,
							fillColor: colorScale(d[ms1]),
							color:shadeColor1(colorScale(d[ms1]),2),
							weight: Math.pow(2, ((zoomLevel-3)>0?(zoomLevel-3):0))/5,
							opacity: 0.9,
							fillOpacity: 0.8
						};

						var circle = L.circleMarker(latlng,MarkerOptions );

						if (typeof shapeName !=='undefined'){
							var popupText = d[shapeName]+"<br>"+ms1+": "+d[ms1];
						}
						else{
							var popupText = ms1+": "+d[ms1];
						}
						circle.bindPopup(popupText);
						circleLayer.addLayer(circle);
					});
				}
			}		
            
            drawMarkers();
            
            drawCircles(5);
          
            			
			var overlayMaps = {
				};	
			
			if(typeof shapeName !== 'undefined')
			{			
				overlayMaps = {
				"Shape Layer (Geojson)": geoLayers
				};	
			}
				
			if (typeof dimLat !== 'undefined' & typeof dimLon !== 'undefined' & typeof shapeName !== 'undefined'){
				overlayMaps = {
					"Shapes": geoLayers,
					"Markers": markerLayer,
					"Circles": circleLayer			
				};
			}
			
			if (typeof dimLat !== 'undefined' & typeof dimLon !== 'undefined' & typeof shapeName == 'undefined'){
				overlayMaps = {
					"Circles": circleLayer,
					"Markers": markerLayer
				};
			}

            var bounds;
			if(latlngArray.length>0)
			{
				bounds = new L.LatLngBounds(latlngArray);
			}
			else{
				bounds = geoLayers.getBounds();
			}
            
			map.fitBounds(bounds);
						
			lcontrol=L.control.layers(baseMaps,overlayMaps).addTo(map);

			map.on('zoomend', function() {
				var zoomLevel = map.getZoom();
				var circleStatus= map.hasLayer(circleLayer);

				lcontrol.removeLayer(circleLayer);
				map.removeLayer(circleLayer);
                
				drawCircles(zoomLevel);
				lcontrol.addOverlay(circleLayer, "Circles");				
				if(circleStatus){map.addLayer(circleLayer);}
			});
        }//End of CreateMap function
	}

    return render; 
});