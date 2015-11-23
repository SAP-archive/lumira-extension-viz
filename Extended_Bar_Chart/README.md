Extended Bar Chart or Variable-Width Bar Chart
==============================================

By [Jay Thoden van Velzen](http://scn.sap.com/people/jay.thodenvanvelzen)

![Extended Bar Chart]()

Typically in a bar chart plotted along the X-axis, only the height of the bar/column has meaning. In this chart, not only the height, but also the width of the bar has meaning. In this chart, which was originally produced at the request of a watch maker, the full width of the bar expresses a range in depth, of a particular type, for which they have the same Hg ng/g(dm). (Unfortunately, I don't posess the domain knowledge to explain this further)

This chart could easily be modified to accept other data analysis where variable width bars may be of use. In the JavaScript you'll see that contrary to normal, the data is very closely tied to the chart (and calls data columns by name). This actually makes some sense for charts that are this specialized.

The actual code for this one is not particularly tricky, and even the d3.js is not particularly challenging. What makes it special is that it is in an unusual format you don't see very often.

Data File
---------
A data file is included with 2 different needles (TS3 30m and TS2-5). This will look slightly strange in VizPacker if you load the .profile file, as the rectangles will be plotted on top of each other. The idea is that in Lumira you would filter on "Needle" so only one needle is shown in each chart. This allows for larger single data files that we then build multiple visualizations for that can be placed together in a composition. 

Files
------
* `Extended Bar Chart.lums` - Sample Lumira file
* `extended_bar.csv` - Sample dataset
* `sap.viz.ext.extendedbarchart.zip` - Extension file

Data Binding
------------
<strong>Measures</strong>
* startDepth
* endDepth
* Hg ng/g(dm)

<strong>Dimensions</strong>
* Needle
* needleType

Resources:
----------
* Blog [Two unusual Lumira extensions: Extended Bars and Capacity Planning](http://scn.sap.com/community/lumira/blog/2015/02/03/two-unusual-lumira-extensions-extended-bars-and-capacity-planning)
