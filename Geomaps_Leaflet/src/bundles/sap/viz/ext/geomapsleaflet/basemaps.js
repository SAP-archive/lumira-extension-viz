//You can add map tiles which you want to below list.
//Please dont forget to update basemaps variable at bottom.
//You can find list and preview of map providers at http://leaflet-extras.github.io/leaflet-providers/preview/
//For questions you can send and e-mail to mustafa.aydogdu@yahoo.com
	

	
//****************************** OSM ***********************************
window.layerOSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});
//------------------------------------------------------------------------------


//****************************** Esri_WorldStreetMap ***********************************	   
window.Esri_WorldStreetMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});
//------------------------------------------------------------------------------


//****************************** MapQuestOpen_OSM ***********************************
window.MapQuestOpen_OSM = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
	attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
	subdomains: '1234'
});
//------------------------------------------------------------------------------


//****************************** OpenMapSurfer_Roads ***********************************
window.OpenMapSurfer_Roads = L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
});
//------------------------------------------------------------------------------


//****************************** MapBox ***********************************
window.MapBox = L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
	'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
	'Imagery © <a href="http://mapbox.com">Mapbox</a>',
	id: 'examples.map-i86l3621'
});
//------------------------------------------------------------------------------


//****************************** OpenTopoMap ***********************************
window.OpenTopoMap = L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 16,
	attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
//------------------------------------------------------------------------------

//****************************** HERE Maps ***********************************
window.HERE_normalDay = L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/normal.day/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
	attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
	subdomains: '1234',
	mapID: 'newest',
	app_id: 'Y8m9dK2brESDPGJPdrvs',
	app_code: 'dq2MYIvjAotR8tHvY8Q_Dg',
	base: 'base',
	maxZoom: 20
});
//------------------------------------------------------------------------------

//*******WMS*****WMS********Sample WMS Service. Options may be different for your WMS server *******WMS*********
window.wms = L.tileLayer.wms("http://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer", {
            layers: 0
        });

		
		
//---------------------- Update Map list-------------------------------
//Only the below list of map services out of above list, will be shown on map selection.
window.baseMaps = {
	"OSM": layerOSM
	,"ESRI": Esri_WorldStreetMap
	,"HERE Maps": HERE_normalDay
	,"Open Maps Surfer (Roads)": OpenMapSurfer_Roads
	,"Map Quest": MapQuestOpen_OSM
	,"MapBox" : MapBox
	,"Open Topology Map": OpenTopoMap
//	,"WMS Service": wms	//Uncomment this line if you want to use your custome WMS service

};
//----------------------- Update Map List ------------------------------

//If You want a tile provider to be selected by default when map i s first loaded,
//then assing a map provider to defaultTileProvider. Sample is provided below.

//window.defaultTileProvider;
window.defaultTileProvider=HERE_normalDay;	

