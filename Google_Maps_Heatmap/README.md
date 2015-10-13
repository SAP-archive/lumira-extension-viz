Google Maps Heatmap - SAP Lumira visualization extension
=================================================
By [Mustafa Aydogdu](hscn.sap.com/people/mustafa.aydogdu)

 * Based on the [Google Maps JavaScript API v3](https://developers.google.com/maps/documentation/javascript/tutorial)
 * [Async.js] (https://github.com/millermedeiros/requirejs-plugins/tree/master/src) plugin for RequireJS is used in order to load Google Maps JS API

Files
-----------
* `Google Maps Heatmap.lums` - SAP Lumira file
* `googlemaps_heatmap_earthquakes.csv` - Sample dataset
* `sap.viz.ext.googlemapsheatmap.zip` - SAP Lumira extension
* `sap.viz.ext.googlemapsheatmap.profile` - Load the extension back into SAP Lumira vizPacker. Async.js file must be located under "C:/LumiraFiles/" folder to run extension in vizPacker. Location of Async.js in render.js must be updated after packing extension.

Data Binding
-------------------------------------------
<strong>Measures (Measure)</strong>
* Magnitude_Sum

<strong>Dimensions (Latitude and Longitude)</strong>
* Latitude
* Longitude
* Country (optional)
* Deaths (optional)
* Injuries (optional)
* Year (optional)

Resources
-----------
* Blog post - [Analyzing Global Earthquakes on Lumira with Google Heatmap Extension] (http://scn.sap.com/community/lumira/blog/2014/12/04/analyzin-world-earthquakes-on-google-heatmap-extension-for-lumira)

Remarks
-----------
* Extension requires internet connection in order to load Google Maps. If you are using proxy, you may have trouble to load map. 
