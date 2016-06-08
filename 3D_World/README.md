3D World
=================================================
 * By [Vincent Dechandon](scn.sap.com/people/vincentdechandon)

This extension displays a 3D world where you can map your longitude/latitude data, as well as put two indicators on them (size/color).

![3D World](https://github.com/SAP/lumira-extension-viz/blob/master/3D_World/3DWorld.gif)

Files
-----------
* `3DWorld_Sample.lums` - SAP Lumira file
* `3DWorld_DataSample.csv` - Sample dataset
* `vdn.viz.ext.3dworld.zip` - SAP Lumira extension, packaged with SAP WebIDE
* `3DWorld-master-CenteredAboveUSA` - SAP Lumira extension, packaged to center the globe above USA

Data Binding
-------------
<strong>Measures</strong>
* Size - Growth (%)
* Color - Turnover

<strong>Dimensions (Lng/Lat)</strong>
* Longitude
* Latitude

Resources
-----------
* Blog post - [Map your data on a 3D World in Lumira](http://scn.sap.com/community/lumira/blog/2015/11/09/map-your-data-on-a-3d-world)

**Update**
- 12/01/2015 : Next feature to come is infowindow when hovering the points
- 11/19/2015 : Centered the globe above USA upon ask. Sneak the **3DWorld-master-CenteredAboveUSA** package.

**Fix**
- 11/11/2015 : Adding multiple times this extension in one story page now works as exepected

**Current limitations**
- There is no legend for the extension, I've planned to make one tho (or maybe some kind of *infowindow*)
- Even if technically the globe supports an infinity of points, the performance starts to decrease above 250/300 points. The performance decreases even faster as you put several times the extension in a Lumira Story.