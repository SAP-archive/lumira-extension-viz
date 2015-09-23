/*<<dependency*/
define("sap_viz_ext_googlemapsheatmap-src/js/render", ["sap_viz_ext_googlemapsheatmap-src/js/utils/util","async!https://maps.googleapis.com/maps/api/js?v=3&libraries=visualization"], function(util){
/*dependency>>*/ 
      var render = function(data, container, width, height, colorPalette, properties, dispatch) {
		//prepare canvas with width and height of container
		container.selectAll('svg').remove();
    	
        var dsets = data.meta.dimensions(),
            msets = data.meta.measures();
        
        var mset1 = data.meta.measures(0); 
		var dset1 = data.meta.dimensions(0),
         ms1 = mset1[0];   // Find name of measure                                                   
		
        var dimLat, dimLon;
	
		//Try to understand which dimensions are lattitude and longtitude
        //if dimension names start with Lat or Lon they will be treated accordingly.
		//Otherwise, first row will be lattitude and second will be longtitude.
		if (typeof dset1[1] !== 'undefined'){
			
		    if(dset1[0].toLowerCase().substring(0, 3) == 'lat' & dset1[1].toLowerCase().substring(0, 3) == 'lon')
		    {	
		    	dimLat = dset1[0];
		    	dimLon = dset1[1];
		    }
		    else if(dset1[1].toLowerCase().substring(0, 3) == 'lat' & dset1[0].toLowerCase().substring(0, 3) == 'lon')
		    {	
		    	dimLat = dset1[1];
		    	dimLon = dset1[0];
		    }
		    else{
		    	dimLat = dset1[0];
		    	dimLon = dset1[1];
		    }	
	    }
		
		mapDiv = container;
        
		//Slice data array that Lumira sends to extension.
        var fdata = data.slice()		
        
	//load google maps api if it wasnt loaded before.
      //requirejs and async plugin is used in order to load google maps api asynchronously
      //you can check async plugin's developer blog for more information.
      //http://blog.millermedeiros.com/requirejs-2-0-delayed-module-evaluation-and-google-maps/

		/*if(typeof google == 'undefined'){	
		    require(['../sap/bi/bundles/sap/viz/ext/googlemapsheatmap/async.js!https://maps.googleapis.com/maps/api/js?v=3&libraries=visualization',],
			function ( ) {
				initializeHeatMap();
			});
		}
		function initializeHeatMap(){*/

			//Loading API takes some time. If you try to create map before API loaded, you will get error.
			//Thus, check if api has been loaded.
			if (typeof google == 'undefined'){
				setTimeout(drawMap, 2000);
			}
			else{        
				if (typeof google.maps == 'undefined'){
					setTimeout(drawMap, 2000);
				}
				else{ 
					if (typeof google.maps.MapTypeId=='undefined'){
						setTimeout(drawMap, 2000);
					}
					else{ 
                         
						var map = new google.maps.Map(mapDiv.node(), {mapTypeId: google.maps.MapTypeId.ROADMAP});
           
						var bound = new google.maps.LatLngBounds();
						var heatmapArray = [];
			 			
						fdata.forEach(function(d, i) { 
							var latLon = new google.maps.LatLng(d[dimLat], d[dimLon]);
							bound.extend( latLon );//Bounds of map for determining center and zoom level.
				
							//Create an array of points for heatmap	
							heatmapArray.push({
								location : latLon,
								weight: d[ms1]
							});
				
						});

						//Center map according to boundaries of given coordinates.
						map.setCenter(bound.getCenter());
						map.fitBounds(bound); 
		

						//Create heatmap layer. You can change opacity of points with opacity parameter.
						var heatmap = new google.maps.visualization.HeatmapLayer({opacity:0.70}); 
   
						//Set map and data for our heatmap
						heatmap.setData(heatmapArray);  
						heatmap.setMap(map);
					}
				}
			}
		//}
	};
    return render; 
});