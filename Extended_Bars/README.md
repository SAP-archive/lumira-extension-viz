Extended Bar Chart or Variable-Width Bar Chart
==============================================
Typically in a bar chart plotted along the X-axis, only the height of the bar/column has meaning. In this chart, not only the height, but also the width of the bar has meaning. In this chart, which was originally produced at the request of a watch maker, the full width of the bar expresses a range in depth, of a particular type, for which they have the same Hg ng/g(dm). (Unfortunately, I don't posess the domain knowledge to explain this further)

This chart could easily be modified to accept other data analysis where variable width bars may be of use. In the JavaScript you'll see that contrary to normal, the data is very closely tied to the chart (and calls data columns by name). This actually makes some sense for charts that are this specialized.

The actual code for this one is not particularly tricky, and even the d3.js is not particularly challenging. What makes it special is that it is in an unusual format you don't see very often.

Data File
---------
A data file is included with 2 different needles (TS3 30m and TS2-5). This will look slightly strange in VizPacker if you load the .profile file, as the rectangles will be plotted on top of each other. The idea is that in Lumira you would filter on "Needle" so only one needle is shown in each chart. This allows for larger single data files that we then build multiple visualizations for that can be placed together in a composition. 

Prior version/Current version
-----------------------------
The extension was originally built in a prior version of VizPacker, but before publishing here, the code was updated and corrected in VizPacker/Lumira 1.21.

The main difference here is that in prior VizPacker versions, we may have flattened the table with the (old) built-in `_util.toFlattenTable(data)`. This is no longer necessary, as the data passed into the render function now tries as much as possible to give you the same as `d3.csv()` does, obviously with the added `meta` element. My flattened dataset was called `fdata`, and I now could simply rename every occurence of `fdata` back to `data`, and make sure the properties were identified correctly. This only affects VizPacker, by the way, old extensions keep working in newer Lumira versions. If you built your extensions with VizPacker/Lumira 1.17 or higher, you're unlikely to run into this issue.

I included the original JavaScript -bundle.js file as well, as that makes for easier reading of the code online. However, to avoid having to make the adjustment yourself in VizPacker, I would recommend you use the .profile file and generate the extension for Lumira from there.

Resources:
----------
* Blog [Two unusual Lumira extensions: Extended Bars and Capacity Planning](http://scn.sap.com/community/lumira/blog/2015/02/03/two-unusual-lumira-extensions-extended-bars-and-capacity-planning)
