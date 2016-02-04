Scroll & Zoom Time-line Bar Chart
=======================
By [Xin Wen](http://scn.sap.com/people/wendy.xin.wen)

![Scroll & Zoom Time-line Bar](https://github.com/SAP/lumira-extension-viz/blob/master/Scrollable_Timeline_Chart/Scrollable%20Timeline%20Bar.gif)

![New legend version without scroll bar](https://github.com/SAP/lumira-extension-viz/blob/master/Scroll_Timeline_Chart/Timeline%20Bar_legend.png)
(New legend version without scroll bar)

This extension has a vertical scrolling bar to fit for more content, and show no more than eight items in one screen. It also has a scaling controller to zoom time-line chart in the horizontal direction. 

This project use part of code from [D3 Gantt](http://dk8996.github.io/Gantt-Chart/) to create time-line chart.

Files
------
* `Scroll Timeline Bar.lums` - Sample Lumira file
* `Scroll Timeline Bar.csv` - Sample dataset
* `sap.viz.ext.timelinescrollbar1.0.2.zip` - Extension file

 New legend version without scroll bar
* `Timeline Bar_legend.lums` - Sample Lumira file
* `Timeline Bar_legend.csv` - Sample dataset
* `sap.viz.ext.timelinelegend.1.0.2.zip` - Extension file


Data Binding
------------
`<strong>Measures</strong>`
* Duration

`<strong>Dimensions</strong>`
* Start Date
* End Date
* Phase or TaskName
* Status

Resources
---------
* Blog : [Scroll Timeline Chart - foreignObject(SVG) and brush component](http://scn.sap.com/community/lumira/blog/2016/02/04/scroll-timeline-chart--foreignobjectsvg-and-brush-component)
