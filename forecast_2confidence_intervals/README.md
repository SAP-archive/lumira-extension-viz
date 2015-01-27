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



