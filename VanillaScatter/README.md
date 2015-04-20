Vanilla Scatter chart
=======================
In this chart, we show a two measures can be mapped against each other on the X and Y axis, using a dimension as a color code.  A standard chart that you can use as a jumping-off point to build a more customized chart.  The code is adapted from Mike Bostock's scatter plot at http://bl.ocks.org/mbostock/3887118

VizPacker has limited flexibiity to change the order and assignment of measures and dimensions.  Please check against the included .jpg files if you are having trouble with your visualization. A common issue is having only one point per legend color code, when you lack a dimension which uniquely separates the rows.


Data file
---------
The data file is the same as the file presented in the original: http://bl.ocks.org/mbostock/3887118.  A second data set (eruption times for Old Faithful, plus a randomly-generated day of week as a Dimension) is also included.
Use a number column as dimension, and it comes out just like Mike Bostock's. Use the text "species" column as dimension, and it plots just the three points, one for each iris species.

Prior version/current version
-----------------------------
Profile file and zip were generated in Lumira 1.23.

Resources
---------
* Blog [Extension for a standard Scatter Plot and a custom Scatter Plot](http://scn.sap.com/community/lumira/blog/2015/04/20/extension-for-a-standard-scatter-plot-and-a-custom-scatter)
* Screenshot_WithoutUniqueDimension : if no numeric dimensions are selected, each color code is consolidated and appears as a single dot in the chart.
* Screenshot_UniqueDimension_ID: Adding an arbitrary numeric dimension (the row id) splits out the rows into individual dots