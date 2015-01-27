Forecast with single Confidence Interval Band
=============================================

This chart shows the visualization of actuals and forecast with a single confidence interval. Note that this chart doesn't
perform the forecast itself, but a visualization extension that allows to show the results of such forecast with the appropriate
confidence interval. It is important to include a confidence interval with the forecast to give a sense of how reliable/accurate/precise the forecast really is. You do not want to have your end user misunderstand the forecast and make
important decisions based on it, when the confidence interval could have shown there was a great deal of uncertainty involved 
with the forecast.

Have a look at the included data file for the required format. This has a seasonal aspect to it, which is reflected as well in the forecast.

Use of SVG Path mini language
=============================
The chart doesn't look terribly complex, but I ran into an interesting issue: if you look at the data file, there are a large number of rows for columns that have no data. That is natural for a forecast, as first you'll have actuals, and then you have the forecast and the values for the confidence interval. Normal  d3.svg.line()  doesn't really work, then, because that really expects the dataset to be complete. (You could do it that way, but since null values are interpreted as zeroes, you get a weird "spike" to the 0 on the x-axis right before the forecast/confidence interval begins.) So, I am using the SVG path mini language directly. This means, then, generating a string of coordinates for the lines to be drawn. That looks something like this: M0,0L10,0L10,10L10,0L0,0 which would create a little square.  d3.svg.line()  and  d3.svg.area()  are basically helper functions around this.

Data file
=========
The data file was given to me by a colleague who had seen the forecast chart with 80 and 95% confidence intervals and wondered if we could do the same with just a single confidence interval, and sent me a sample file. Just like with the other chart, the forecast itself would need to be produced in a predictive/statistical tool (AFL PAL, Predictive Analysis, InfiniteInsight, R, SAS, SPSS, etc.) to do the calculations. 
