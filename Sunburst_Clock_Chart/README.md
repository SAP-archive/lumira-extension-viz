Sunburst Clock
=================================================
By [Xin Wen](http://scn.sap.com/people/wendy.xin.wen)<br>

![Sunburst Clock_Legend](https://github.com/SAP/lumira-extension-viz/blob/master/Sunburst_Clock_Chart/images/Sunburst_Clock_Legend.png)
Sunburst Clock Chart with legend

![Sunburst Clock](https://github.com/SAP/lumira-extension-viz/blob/master/Sunburst_Clock_Chart/images/Sunburst_Clock_basic.png)
Sunburst Clock Chart without legend

Files
-----------
* `SunburstClock.lums` - SAP Lumira .lums file
* `SunbrustClock_sampledata.csv` - Sample dataset
* `sap.viz.ext.sunbrustclock.zip` - SAP Lumira extension, exported from SAP Lumira vizPacker
* `sap.viz.ext.sunbrustclockswitch.zip` - SAP Lumira extension with custom property, exported from SAP Lumira vizPacker

Data Binding
---------------
<strong>Door Status Duration</strong>
* DoorStatus_seconds

<strong>Status, DoorID, Date and Time</strong>
* Status 
* EndpointSerialNumber
* Date
* LocalTime(2)

- You have to add filter for **EndpointSerialNumber** & **Date** to limit data to one day/door
![Sunburst Clock_tooltip](https://github.com/SAP/lumira-extension-viz/blob/master/Sunburst_Clock_Chart/images/Sunburst_Clock_filters.png)

Resources
-----------
* Blog Post - [Sunburst Clock Chart - Customize to particular data set](http://scn.sap.com/community/lumira/blog/2016/01/19/sunburst-clock-chart--customize-to-particular-data-set)