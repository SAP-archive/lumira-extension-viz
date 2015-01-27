Forecast with 80% and 95% Confidence Intervals - Lumira extension
=================================================================
This chart allows the visualization of actuals and forecast with 80 and 95% confidence intervals. Note that this chart 
doesn't perform the forecast itself, but is a visualization extension that allows to show the results of such forecasting 
with the appropriate confidence intervals. It is important to include confidence intervals in forecast to give a sense of 
how reliable/accurate/precise the forecast really is.

Take a close look at the included data files for the format.

Use of SVG path mini language
============================
The chart doesn't look terribly complex, but I ran into an interesting issue: if you look at the data file, there are a large 
number of rows for columns that have no data. That is natural for a forecast, as first you'll have actuals, and then you have 
the forecast and the values for the confidence intervals. Normal `d3.svg.line()` doesn't really work, then, because that really 
expects the dataset to be complete. So, I am using the SVG path mini language directly. This means, then, generating a string of 
coordinates for the lines to be drawn. That looks something like this: M0,0L10,0L10,10L10,0L0,0 which would create a little 
square. `d3.svg.line()` and `d3.svg.area()` are basically helper functions around this.

Data files
==========
I included four data files, for Brazil, Greece, South Korea and the US, so you can see how the charts differ depending on the 
data set. The data used for this is the WDI from The World Bank: http://data.worldbank.org/data-catalog/world-development-indicators  

To create the data files, I used R to turn the actuals into a time series and ran an auto.arima forecast for 15 years. This analysis could also have been done with the AFL PAL library in HANA, or SAS, or any other tool that can produce such forecasts.

Attention: version impact
=========================
SAP Lumira development progresses quickly, and this extension was originally built in a previous version. The extension works just fine in SAP Lumira 1.21, but VizPacker can't read this profile file anymore and returns undefined. However, you should just be able to copy the render function, upload the data file and name the canvas fields, and use the content of the .profile file to understand how the data should be included.

Resources
=========
* http://scn.sap.com/community/lumira/blog/2015/01/27/sap-lumira-chart-extensions-with-a-predictive-flavor
