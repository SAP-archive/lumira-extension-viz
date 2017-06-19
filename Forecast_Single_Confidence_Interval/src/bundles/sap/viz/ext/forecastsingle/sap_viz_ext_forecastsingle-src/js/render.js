define("sap_viz_ext_forecastsingle-src/js/render", [], function() {
	/*
	 * This function is a drawing function; you should put all your drawing logic in it.
	 * it's called in moduleFunc.prototype.render
	 * @param {Object} data - proceessed dataset, check dataMapping.js
	 * @param {Object} container - the target d3.selection element of plot area
	 * @example
	 *   container size:     this.width() or this.height()
	 *   chart properties:   this.properties()
	 *   dimensions info:    data.meta.dimensions()
	 *   measures info:      data.meta.measures()
	 */
	var render = function(data, container) {

    //Best practice: add unique css tag before identifiers to prevent class conflicts
    var cssTag = "sap_viz_ext_forecastsingle_";

    var colors = this.colorPalette();

    container.selectAll("svg").remove();

    var actualData = [];
    var forecastData = [];

    var dimensions = data.meta.dimensions(),
        measures = data.meta.measures();

    //store the dimension and measure names in variables (may vary per dataset)
    var yearMonthString = dimensions[0],
        type = dimensions[1];

    var measure = measures[0],
        lowerBound = measures[1],
        upperBound = measures[2];

    var extraMeasures = [];

    if (measures.length > 3) {
        extraMeasures = measures.slice(3);
    }

    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    };
    var height = this.height();
    var width = this.width();

    var svg = container.append("svg")
        .attr("width", this.width() + margin.left + margin.right)
        .attr("height", this.height() + margin.top + margin.bottom)
        .append("g")
        .attr("id", cssTag + "plot")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //create x & y scales and axes
    var x = d3.time.scale()
        .range([0, this.width() - margin.left - margin.right]);

    var y = d3.scale.linear()
        .range([this.height(), 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var xAxisGrid = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat("")
        .tickSize(-this.height());

    var yAxisGrid = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat("")
        .tickSize(-(this.width() - margin.left - margin.right));

    //construct the forecast area
    var area = d3.svg.area()
        .x(function(d) {
            return x(d[yearMonthString]);
        })
        .y0(function(d) {
            return y(d[lowerBound]);
        })
        .y1(function(d) {
            return y(d[upperBound]);
        })
        .interpolate("monotone");
	
	//converts date strings into Date objects, and also parses integers out of measures
    data.forEach(function(d) {
        d[yearMonthString] = new Date(d[yearMonthString]);
        d[measure] = parseInt(d[measure]);
        if (extraMeasures.length > 0) {
            extraMeasures.forEach(function(meas) {
                d[meas] = parseInt(d[meas]);
            });
        }
    });
    
    //sort data into chronological order
    data.sort(function(a, b) {
    	return dateSortAscending(a[yearMonthString], b[yearMonthString]);
    });
    
    var highest = 0,
        lowest = 0;
    var counter = 0;
	//finds lowest and highest values in measures to create axes that will fit all the data
    data.forEach(function(d) {
        var keys = Object.keys(d);
        keys.forEach(function(key) {
            var val = d[key];
            if ($.inArray(key, measures) > -1) {
                if (isNum(val)) {
                    if (counter == 0) {
                        highest = val;
                        lowest = val;
                    } else {
                        if (val > highest) {
                            highest = val;
                        } else if (val < lowest) {
                            lowest = val;
                        }
                    }
                    counter++;
                }
            }
        });
    });

    //separate data into actuals and forecasts
    data.forEach(function(d) {
        if (d[type]) {
            if (d[type].toUpperCase().includes("ACTUAL")) { //check if "type" of entry contains the string "ACTUAL" to determine 
                actualData.push(d);
            } else {
                forecastData.push(d);
            }
        }
    });

    renderChart(data, forecastData);
    
    /* Helper Functions */
	
    function renderChart(chartData, chartForecastData) {
        if (chartForecastData[0] != undefined) {

            d3.selectAll("#" + cssTag + "plot > *").remove();

            renderFilterMenu(chartForecastData.length);

            x.domain(d3.extent(chartData, function(d) {
                return d[yearMonthString];
            }));
            y.domain([lowest - (lowest * .1), highest + (highest * .1)]); //buffer of 10% so lines don't go to end of axes

            //draw axes
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);


            svg.append("g")
                .attr("class", "axis")
                .call(yAxis);

            svg.append("g")
                .attr("class", "axis grid")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxisGrid);


            svg.append("g")
                .attr("class", "axis grid")
                .call(yAxisGrid);

            //draw actual line, and draw forecast area before forecast line
            //so that the line renders on top (svg elements render in order)
            drawPath(actualData, cssTag + "actual-line", createLine(measure, "monotone"));
            drawPath(chartForecastData, cssTag + "forecast-area", area);

            //add the last actual entry to the beginning of the forecast data array 
            //so that the actual and forecast lines will connect
            var lastActual = actualData[actualData.length - 1];
            chartForecastData.unshift(lastActual);
            drawPath(chartForecastData, cssTag + "forecast-line", createLine(measure, "monotone"));

            chartForecastData.shift(); //& remove it before drawing scatter plots
            drawScatterPlot(actualData, measure, "#03A9F4");
            drawScatterPlot(chartForecastData, measure, "#303F9F");

            if (extraMeasures.length > 0) {
                appendExtraMeasureLines(chartData, chartForecastData, extraMeasures);
            }

            appendTooltip();

        }

    }

    function renderFilterMenu(forecastLength) {
        if (forecastLength >= 6) {
            d3.selectAll("#" + cssTag + "filter-menu").remove();

            var filterMenu = container.append("g")
                .attr("id", cssTag + "filter-menu")
                .attr("transform", "translate(" + (width - margin.right - 10) + ")");


            createFilterMenuItem(filterMenu, 0, 12);
            createFilterMenuItem(filterMenu, -30, 6);
            createFilterMenuItem(filterMenu, -60, 3);
        }
    }

    function createFilterMenuItem(filterMenu, offset, menuItemText) {
        var filteredDataTemp, forecastDataTemp;

        var filterMenuItem = filterMenu.append("g")
            .attr("transform", "translate(" + offset + ")");

        filterMenuItem.append("circle")
            .attr({
                "class": cssTag + "filter-menu-circle",
                r: 10,
                stroke: "black",
                "stroke-width": 1,
                fill: "white"
            }).on("click", function() {
            	if (data.length >= data.length) {
	            	d3.selectAll("." + cssTag + "filter-menu-circle").attr("fill", "white");
	                d3.select(this).attr("fill", "lightgray");
	
	                filteredDataTemp = data.slice(0, data.length - (forecastData.length - menuItemText));
	                forecastDataTemp = forecastData.slice(0, menuItemText);
	
	                renderChart(filteredDataTemp, forecastDataTemp);
            	}
            });

        filterMenuItem.append("text")
            .attr("text-anchor", "middle")
            .text(menuItemText);

    }

    //constructs a line based on the measure for the y-axis and an interpolator for shape
    function createLine(yVal, interpolator) {
        var line = d3.svg.line()
            .x(function(d) {
                return x(d[yearMonthString]);
            })
            .y(function(d) {
                return y(d[yVal]);
            })
            .interpolate(interpolator); //makes line sharp ("linear") or fluid/curvy ("monotone")

        return line;
    }

    //appends a path to the page based on the data array and area or line constructed by createLine()
    function drawPath(datum, cssClass, dType, color) {
        svg.append("path")
            .datum(datum)
            .attr("class", cssClass)
            .attr("d", dType)
            .style("stroke", color);
    }

    //draws dots for each data point with animation and tooltip show/hide on hover
    var dotType = "";

    function drawScatterPlot(dataArr, yVal, color) {
        //check if dot is a forecast (so we know whether to append the upper/lower to its tooltip)
        (dataArr[0][upperBound] == "" || dataArr[0][upperBound] == null) ? dotType = cssTag + "actual-dot": dotType = cssTag + "forecast-dot";

        svg.selectAll("dot")
            .data(dataArr)
            .enter()
            .append("circle")
            .attr("class", dotType)
            .attr("fill", color)
            .attr("r", 4)
            .attr("cx", function(d) {
                return x(d[yearMonthString]);
            })
            .attr("cy", function(d) {
                return y(d[yVal]);
            })
            .on("mouseenter", function(d) {
                d3.select(this).transition().attr("r", 6);
                toggleTooltip(this, d, yVal);
            })
            .on("mouseleave", function() {
                d3.select(this).transition().attr("r", 4);
                toggleTooltip();
            });
    }

    //tooltip to append. Hidden by default, moves position to respective dot on hover
    //append tspans for mutiline svg text

    var tooltipBackground, tooltip, measureText, lowerBoundText, upperBoundText;

    function appendTooltip() {
        tooltipBackground = svg.append("rect")
            .attr("fill", "lightgray")
            .attr("fill-opacity", 0.6)
            .style("display", "none");

        tooltip = svg.append("text")
            .attr("text-anchor", "middle")
            .style("display", "none");

        measureText = tooltip.append("tspan")
            .attr("class", cssTag + "tooltip-text")
            .attr("dy", "0.6em"); //spacing between lines (uses em so spacing is constant across font-size)
        lowerBoundText = tooltip.append("tspan")
            .attr("class", cssTag + "tooltip-text")
            .attr("dy", "1.2em");
        upperBoundText = tooltip.append("tspan")
            .attr("class", cssTag + "tooltip-text")
            .attr("dy", "1.2em");
    }



    var xPos, yPos, boundingBox;

    function toggleTooltip(dot, d, yVal) {
        if (tooltip.style("display") == "none") {
            xPos = x(d[yearMonthString]);

            tooltip.attr("x", xPos);

            d3.selectAll("." + cssTag + "tooltip-text").attr("x", xPos);
            measureText.text(capitalize(yVal) + ": " + d[yVal]);

            //only show lower/upper values for forecast dots
            if (d3.select(dot).attr("class") == cssTag + "forecast-dot" && $.inArray(yVal, extraMeasures) == -1) {
                yPos = y(d[yVal]) - 80;
                tooltip.attr("y", yPos);
                lowerBoundText.style("display", "block");
                upperBoundText.style("display", "block");
            } else {
                yPos = y(d[yVal]) - 34;
                tooltip.attr("y", yPos);
                lowerBoundText.style("display", "none");
                upperBoundText.style("display", "none");
            }

            lowerBoundText.text(capitalize(lowerBound) + ": " + d[lowerBound]);
            upperBoundText.text(capitalize(upperBound) + ": " + d[upperBound]);

            tooltip.style("display", "block");

            boundingBox = tooltip.node().getBBox();
            tooltipBackground.attr({
                x: boundingBox.x,
                y: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height
            }).style("display", "block");

        } else {
            tooltip.style("display", "none");
            tooltipBackground.style("display", "none");
        }
    }

    function appendExtraMeasureLines(filteredData, forecasts, extraMeas) {
        extraMeas.forEach(function(meas, i) {
            drawPath(filteredData, cssTag + "measure-line", createLine(meas, "monotone"), colors[i * 2]);
            drawScatterPlot(actualData, meas, colors[i * 2]);
            drawScatterPlot(forecasts, meas, colors[i * 2]);
        });
    }
    
    function dateSortAscending(date1, date2) {
    	if (date1 < date2) {
    		return -1;
    	}
    	
    	else if (date1 > date2) {
    		return 1;
    	}
    	
    	return 0;
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    //checks if input is a number
    function isNum(str) {
        return !isNaN(str) && (str !== "");
    }

};

	return render;
});