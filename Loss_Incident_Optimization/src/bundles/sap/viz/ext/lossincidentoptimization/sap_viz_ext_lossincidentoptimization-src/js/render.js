define("sap_viz_ext_lossincidentoptimization-src/js/render", [], function() {
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
		// TODO: add your own visualization implementation code below ...
	// Margin object, contains margin from 4 sides
	
		var width = this.width();
		var height = this.height();
		
        var margin = {
            top: 80,
            right: 20,
            bottom: 5,
            left: 20
        };
        //remove previous svg
        container.selectAll('svg').remove();

        //remove previously rendered tooltip divisions ( usefull when resizing)
        container.selectAll('#sap_viz_ext_lossincidentoptimization_t-tip_lio').remove();

        //prepare svg canvas with width and height of container
        var vis = container.append('svg').attr("width", (width + margin.left + margin.right))
            .attr("height", (margin.top + margin.bottom + height)).attr("x", margin.left);


        var sliderContainer = container.append('svg').attr("width", (width + margin.left)).attr("height", 80).append("g").attr("transform", "translate(" + 80 + ",0)");

        //Extract dimensions and measures from the dataset.
        var dset0 = data.meta.dimensions(0);
        var mset0 = data.meta.measures(0);
        var dset1 = data.meta.dimensions(1);

        var ds0 = dset0[0]; //Date
        var ds1 = dset1[0]; //Time
        var ms1 = mset0[0]; //Claim



        var dataSet = [];
        var durationSet = [];
        var dateList = [];

        //Regular Expressions to check to Valid Time (in HH:MM format)
        var regExGoodTime = /(^((2[0-3])|([01]?[0-9])):[0-5][0-9]$)/;
        //Regular Expressions to check to Valid Time (in HHMMss format)
        var regExGoodTime2 = /^((2[0-3])|([01]?[0-9]))[0-5][0-9][0-5][0-9]$/;

        //function to test valid date
        function validDate(input) {
            var date = new Date(input);
            // var year = date.getFullYear();
            // var month = date.getMonth() + 1;
            // var day = date.getDate();
            input = input.split('/');
            return date.getMonth() + 1 === +input[0] && date.getDate() === +input[1] && date.getFullYear() === +input[2];
        }

        //set default boolean flag to true
        var validtime = true;

        data.map(function(d) {
            if (!(d[ms1] === null || d[ms1] === undefined || d[ms1]=="null") && d[ds1] !== null && d[ds0] !== null) {
                var obj = {};
                obj.Claim = d[ms1];
                obj.Date = d[ds0];
                obj.Time = d[ds1];

                //if time is in HHMMss format convert it to HH:MM
                if ((regExGoodTime2.test(obj.Time))) {
                    obj.Time = (obj.Time.substr(0, 2)) + ":" + (obj.Time.substr(2, 2));

                }


                //Test for valid HH:MM time
                if (!(regExGoodTime.test(obj.Time))) {
                    validtime = false;
                }
                
                
                	
                dataSet.push(obj);
            }
        });

        if (validtime === false) {
            sliderContainer.append("text").attr("font-size", 30).attr("y", 20).attr("x", width / 4).text("INVALID TIME, please enter time in HH:mm or H:mm or HHMMss format ( 24 hour format)").attr("fill", "brown");
        }

        // filter object contains values of both filters or sliders
        var filter = {
            Duration: 1,
            Granularity: 1
        };


        if (dataSet[0].Date != "0" && dataSet[0].Time != "0" && validtime == true) {
            var sortedDataSet = sortDataSet(dataSet);

            if (sortedDataSet.length > 0) {
                reusableDataset = dataLogic(sortedDataSet);
                plotDataset = plot(reusableDataset, 1, 1);
                prepare(plotDataset);
            }
        }




        /**
         * Function to get nth date from that of current given date in MM/DD/YYYY
         * @param {String} currentdate
         * @param {number} n
         * @return {String} Nth date from current given date
         */

        function getNthDate(currentdate, n) {
            var dateParts = currentdate.split("\/");
            var y = parseInt(dateParts[2]);

            var m = parseInt(dateParts[0]);

            var d = parseInt(dateParts[1]);

            var dayAfter = new Date(y, m - 1, d + n);
            var mon = dayAfter.getMonth() + 1;
            var day = dayAfter.getDate();

            if ((dayAfter.getMonth() + 1).toString().length == 1) {
                mon = "0" + (dayAfter.getMonth() + 1).toString();
            }

            if ((dayAfter.getDate()).toString().length == 1) {
                day = "0" + (dayAfter.getDate()).toString();
            }

            return (mon + "/" + day + "/" + dayAfter.getFullYear());

        }


        /*
         * Find number of days between two dates
         *
         * @param{String} date1,date2
         * return {number} no. of days in between two given dates
         */

        function dateDifference(date1, date2) {
            var _date1 = new Date(date1);
            var _date2 = new Date(date2);
            var timeDiff = Math.abs(_date2.getTime() - _date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return diffDays;
        }

        /**
         * Performs a binary search on the host array. This method can either be
         * called with a specified scope like this:
         * binaryIndexOf.call(someArray, searchElement);
         *
         * @param {*} searchElement The item to search for within the array.
         * @return {Number} The index of the element which defaults to -1 when not found.
         */
        function binaryIndexOf(searchElement) {
            'use strict';
            searchElement = new Date(searchElement);
            var minIndex = 0;
            var maxIndex = this.length - 1;
            var currentIndex;
            var currentElement;
            var resultIndex;

            while (minIndex <= maxIndex) {
                resultIndex = currentIndex = (minIndex + maxIndex) / 2 | 0;
                currentElement = new Date(this[currentIndex]);

                if (currentElement < searchElement) {
                    minIndex = currentIndex + 1;
                } else if (currentElement > searchElement) {
                    maxIndex = currentIndex - 1;
                } else {
                    return currentIndex;
                }
            }

            return~ maxIndex;
        }

        /**
         * Validate the given date as MM/DD/YYYY or YYYYMMDD and then sort the dataset according to dates
         *
         * @param {Array} dataset the Dataset to be sorted
         * @return {Array} Sorted Dataset
         */
        function sortDataSet(dataset) {
            var arr = [];
            var flag = true;
            var d, m, y;


            for (var i = 0; i < dataset.length; i++) {

                arr = (dataset[i].Date).split("\/");
                if (arr.length === 1) {
                    m = dataset[i].Date.substr(4, 2);
                    d = dataset[i].Date.substr(6, 2);
                    y = dataset[i].Date.substr(0, 4);

                } else {
                    y = arr[2];
                    m = arr[0];
                    d = arr[1];
                    if (arr[0].length == 1) {
                        m = "0" + m;
                    }
                    if (arr[1].length == 1) {
                        d = "0" + d;
                    }
                }

                dataset[i].Date = m + "/" + d + "/" + y;



                // ReGex to check for Valid Date
                if (!validDate(dataset[i].Date)) {
                    sliderContainer.append("text").attr("font-size", 20).attr("y", 20).attr("x", width / 4).text("INVALID DATE : Please enter date in mm/dd/YYYY").attr("fill", "brown");
                    flag = false;
                    break;
                }

            };


            return (flag === true) ? dataset.sort(compareDates) : [];
        }

        /**
         * Comparator to be used with the Array.sort() prototype.
         *
         * @param {String} a,b the dates to be compared
         * @return {Number} 1,0,-1 depending on result of comparision.
         */
        function compareDates(a, b) {
            var date1 = (a.Date).split("\/");
            var date2 = (b.Date).split("\/");

            if ((date1[2] + date1[0] + date1[1]) > (date2[2] + date2[0] + date2[1])) return 1;
            else if ((date1[2] + date1[0] + date1[1]) < (date2[2] + date2[0] + date2[1])) return -1;
            else return 0;
        }

        /* Stand Alone Tooltip implementation.
         Usage var tooltipObj=new tooltip();
         tooltipObj.t_tip();
        */
        function tooltip() {
            var width = "auto", // default width
                height = "auto",
                html = "tooltip",
                classed = "left",
                x = 10,
                y = 10,
                position = [x, y],
                disp = "none";
            // default height

            function tooltip() {
                // generate tooltip here, using `width` and `height`
                var tt = d3.select("body").append("div").attr("id", "sap_viz_ext_lossincidentoptimization_t-tip_lio").style("display", disp);
                var tooltip = tt.append("div").attr("class", "sap_viz_ext_lossincidentoptimization_tt-inner_lio").style("text-align", "left");
                tooltip.append("div").attr("id", "sap_viz_ext_lossincidentoptimization_triangle").attr("class", classed);
                tooltip.append("div").attr("id", "sap_viz_ext_lossincidentoptimization_tt-body");

                tooltip.visibility = function(value) {
                    //if (!arguments.length) return html;
                    d3.selectAll("#sap_viz_ext_lossincidentoptimization_t-tip_lio").style("display", value);
                }
                tooltip.orientation = function(value) {
                    //if (!arguments.length) return html;
                    d3.selectAll("#sap_viz_ext_lossincidentoptimization_t-tip_lio #sap_viz_ext_lossincidentoptimization_triangle").attr("class", value);
                }
                tooltip.move = function(value) {

                    d3.selectAll("#sap_viz_ext_lossincidentoptimization_t-tip_lio").style("top", value[0]).style("left", value[1]);

                };
                tooltip.fillData = function(value) {

                    d3.selectAll("#sap_viz_ext_lossincidentoptimization_t-tip_lio #sap_viz_ext_lossincidentoptimization_tt-body").html(value);

                };
                /* tooltip.html=function(value){
                if (!arguments.length) return html;
                html = value;
                return tooltip;
            } */
                return tooltip;
            }


            tooltip.width = function(value) {
                if (!arguments.length) return width;
                width = value;
                return tooltip;
            };

            tooltip.height = function(value) {
                if (!arguments.length) return height;
                height = value;
                return tooltip;
            };

            return tooltip;
        }


        /*
        Calculate maximum how many bars to be shown on the screen. the bestview factor is used to leave out 
        ticks on an ordinal scale.
        */

        function ResponsiveRenderCoefficient(value) {

            var bestviewfactor;

            if (height >= 1000) bestviewfactor = 40;
            else if (height >= 800 && height < 1000) bestviewfactor = 30;
            else if (height >= 600 && height < 800) bestviewfactor = 25;
            else if (height >= 400 && height < 600) bestviewfactor = 15;
            else if (height >= 250 && height < 400) bestviewfactor = 7;
            else bestviewfactor = 5;


            return Math.ceil(value / bestviewfactor);

        }

        /**
         * Format Claim Value (on x axis and tooltip to be more sanitized with suffixes)
         *
         * @param {number} value
         * @return {string} value formatted to use the suffix
         */
        function claimFormatter(value) {
            if (value >= 10000) {
                if (value >= 1000000) {
                    if (value >= 1000000000) {
                        if (value >= 1000000000000) {
                            if (value >= 1000000000000000) {
                                return value / 1000000000000000 + "P";
                            }
                            return value / 1000000000000 + "T";
                        }
                        return value / 1000000000 + "B";
                    }
                    return value / 1000000 + "M";
                }

                return value / 1000 + "K";
            }
            return value;
        }

        var t_tip = new tooltip();
        var ltooltip = t_tip();

        function BarChart(config) {

            var margin = config.margin || {
                top: 20,
                right: 20,
                bottom: 40,
                left: 40
            };
            this.width = parseInt(config.width) || 960,
            this.height = parseInt(config.height) || 500,
            this.config = config;

            var measure = config.measure,
                dimension = config.dimension;


            this.class_chart = config.chart;

            var svg, chart_container;

            var chartW = (this.width) * 0.7 - margin.left - margin.right,
                chartH = this.height - margin.top - margin.bottom - 80;

            var y1 = d3.scale.ordinal()
                .rangeBands([0, chartH], 0.4);

            var x1 = d3.scale.linear()
                .range([0, chartW]);


            var y2 = d3.scale.ordinal()
                .rangeBands([0, chartH], 0.4);

            var y3 = d3.scale.linear()
                .range([0, chartH]);

            var xAxis = d3.svg.axis()
                .scale(x1)
                .orient("bottom").tickFormat(claimFormatter);

            var yAxis = d3.svg.axis()
                .scale(y1)
                .orient("right").tickSize(0, 0).tickPadding(8);


            var yAxis2 = d3.svg.axis()
                .scale(y2)
                .orient("left").tickSize(0, 0).tickPadding(8);

            chart_container = vis
                .attr("id", "svg")
                .append('g').attr("class", "vis")
                .attr("transform", "translate(" + (margin.left + config.labelarea) + "," + (50 + config.topPosition) + ")");

            var eventscale = 1;


            var barchartcontainer = chart_container.append("g").attr("id", "BarChartContainer");
            barchartcontainer.append("rect").attr("width", chartW).attr("height", chartH).attr("fill", "transparent");
            var clip = barchartcontainer.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("id", "clip-rect")
                .attr("x", "0")
                .attr("y", "0")
                .attr("width", chartW + config.labelarea + margin.left)
                .attr("height", chartH + margin.bottom + 50).attr("transform", "translate(" + (-1 * (margin.left + config.labelarea)) + "," + -1 * (5) + ")");

            var missbarFactor = 1;



            this.update = function(_data) {
                clean();

                // Create a zoom function by using the d3.behaviour.zoom prototype
                var zoom = d3.behavior.zoom()
                    .scaleExtent([1, Math.ceil(_data.length / 2)])
                    .on("zoom", redraw);


                xaxis_container = chart_container.append("g");
                yaxis_container = barchartcontainer.append("g").attr("transform", "translate(-250,0)");
                yaxis_container2 = barchartcontainer.append("g").attr("transform", "translate(-0.5,0)");

                y1.domain(_data.map(function(d) {
                    return d[dimension];
                }));


                x1.domain([0, d3.max(_data, function(d) {
                    return d[measure];
                })]);

                y2.domain(_data.map(function(d) {
                    return d.label2;
                }));

                missbarFactor = ResponsiveRenderCoefficient(_data.length);

                yAxis2.tickFormat(function(d, i) {
                    return i % missbarFactor ? null : d;
                });

                yAxis.tickFormat(function(d, i) {
                    return i % missbarFactor ? null : d;
                });

                eventscale = 1;

                y1.rangeBands([0, chartH * eventscale], .2);
                y2.rangeBands([0, chartH * eventscale], .2);


                var max_claim_label = d3.max(_data, function(d) {
                    return d[measure];
                });
                xaxis_container
                    .attr("class", "sap_viz_ext_lossincidentoptimization_xlio sap_viz_ext_lossincidentoptimization_lioaxis")
                    .attr("transform", "translate(0," + (-20) + ")")
                    .call(xAxis)
                    .selectAll("text")
                    .attr("y", -7)
                    .attr("x", 0)
                    .attr("dy", ".35em")
                    .style("text-anchor", "middle");

                yaxis_container
                    .attr("class", "sap_viz_ext_lossincidentoptimization_ylio sap_viz_ext_lossincidentoptimization_lioaxis")
                    .call(yAxis);

                yaxis_container2
                    .attr("class", "sap_viz_ext_lossincidentoptimization_y2lio sap_viz_ext_lossincidentoptimization_lioaxis")
                    .call(yAxis2);

                var backgroundbar = barchartcontainer.selectAll(".sap_viz_ext_lossincidentoptimization_liobackgroundbar")
                    .data(_data)
                    .enter()
                    .append("rect")
                    .attr("class", "sap_viz_ext_lossincidentoptimization_liobackgroundbar")
                    .attr("x", 0)
                    .attr("width", chartW)
                    .attr("y", function(d) {
                        return y1(d[dimension]);
                    })
                    .attr("height", (y1.rangeBand()))
                    .attr("transform", "scale(1," + eventscale + ")");


                var bars = barchartcontainer.selectAll(".sap_viz_ext_lossincidentoptimization_liobar")
                    .data(_data)
                    .enter()
                    .append("rect")
                    .attr("class", function(d) {
                        if (d[measure] == max_claim_label) return "sap_viz_ext_lossincidentoptimization_maxbar";
                        else return "sap_viz_ext_lossincidentoptimization_liobar";
                    })
                    .attr("x", 0)
                    .attr("width", function(d) {
                        return x1(d[measure]);
                    })
                    .attr("y", function(d) {
                        return y1(d[dimension]);
                    })
                    .attr("height", (y1.rangeBand()))
                    .attr("transform", "scale(1," + eventscale + ")")
                    .on("mousemove", function(d) {

                        var obj = d;
                        var coordinate = [0, 0];
                        var leftPos = event.clientX + 20;
                        var topPos = event.clientY - 60;


                        ltooltip.visibility("block");
                        var ltt = ltooltip;

                        var matrix = this.getScreenCTM()
                            .translate(+this.getAttribute("x"), +this.getAttribute("y"));


                        var classed = "";

                        ltooltip.orientation(classed);
                        var tt_data = "<div class='sap_viz_ext_lossincidentoptimization_tt-item_lio sap_viz_ext_lossincidentoptimization_tt-combo_lio'>" + obj.label_tooltip_duration + "<span class='sap_viz_ext_lossincidentoptimization_tt-item-name_lio'>" + obj.label_tooltip_granularity + " to " + obj.label_tooltip_granularity + "</span>" + "</div>";
                        var item_data = "";

                        item_data = item_data + "<div class='sap_viz_ext_lossincidentoptimization_tt-item_lio'>";
                        item_data = item_data + "<span class='sap_viz_ext_lossincidentoptimization_tt-item-name-claim'>$ " + (obj.claim) + "</span>";
                        tt_data += item_data;

                        ltooltip.fillData(tt_data);

                        ltooltip.move([topPos + "px", leftPos + "px", ]);

                    })
                    .on("mouseout", function(d) {
                        ltooltip.visibility("none");
                    });


                barchartcontainer.attr("clip-path", "url(#clip)").call(zoom);

                var eventscale_prev, missbarFactorR = missbarFactor;

                function redraw() {
                    missbarFactor_prev = missbarFactor;
                    eventscale_prev = eventscale;
                    eventscale = d3.event.scale;

                    missbarFactor = Math.ceil(missbarFactorR / eventscale);

                    var t = d3.event.translate;
                    t[1] = Math.min(0, Math.max((-chartH * eventscale + chartH), t[1]));
                    y1.rangeBands([0, chartH * eventscale], .2);
                    y2.rangeBands([0, chartH * eventscale], .2);

                    bars.attr("transform", "translate(0," + t[1] + ")scale(1," + eventscale + ")");
                    backgroundbar.attr("transform", "translate(0," + t[1] + ")scale(1," + eventscale + ")");

                    yAxis.tickFormat(function(d, i) {
                        return i % missbarFactor ? null : d;
                    });

                    yAxis2.tickFormat(function(d, i) {
                        return i % missbarFactor ? null : d;

                    });
                    chart_container.select("g.sap_viz_ext_lossincidentoptimization_ylio").call(yAxis).attr("transform", "translate(-250 ," + t[1] + ")");

                    chart_container.select("g.sap_viz_ext_lossincidentoptimization_y2lio").call(yAxis2).attr("transform", "translate(-0.5 ," + t[1] + ")");

                }
            }
            var clean = function() {

                container.selectAll(".sap_viz_ext_lossincidentoptimization_liobar").remove();
                container.selectAll(".sap_viz_ext_lossincidentoptimization_liobackgroundbar").remove();
                container.selectAll(".sap_viz_ext_lossincidentoptimization_maxbar").remove();
                container.selectAll("g.sap_viz_ext_lossincidentoptimization_xlio").remove();
                container.selectAll("g.sap_viz_ext_lossincidentoptimization_y2lio").remove();
                container.selectAll("g.sap_viz_ext_lossincidentoptimization_ylio").remove();

            }
        }

        function Slider(config) {
            /* Set default properties of slider */
            var sliderProperties = {
                dataset: [],
                sliderwidth: 336,
                filterset: [],
                itemwidth: 50,
                chart: null
            };

            this.config = config;

            var measure = config.measure,
                dimension = config.dimension;




            /* Filters dataset based on current position of slider, and passes filtered dataset to update function.
             * @param {number} val
             */


            var filterrun = function(val) {

                if (sliderProperties.filterset[val] != filter[sliderProperties.filterVal]) {
                    filter[sliderProperties.filterVal] = sliderProperties.filterset[val];
                    data = plot(reusableDataset, filter.Duration, filter.Granularity);
                    sliderProperties.chart.update(data);
                }
            }


            /*
            Function to remove Null values from Filterset

            @return {Array} arr

            */


            function removeNull() {

                var arr = [],
                    j = 0;
                for (var i = 0; i < sliderProperties.filterset.length; i++) {
                    if (sliderProperties.filterset[i] != "null") {
                        arr[j] = sliderProperties.filterset[i];
                        j++;
                    }
                };

                return arr;

            }




            /* Function called when the onDrag event is triggered.
             * @param {Element} d
             */


            this.dragMove = function(d) {



                d.x = Math.max(0, Math.min(sliderProperties.sliderwidth, d3.event.x));

                var sel = d3.select(this)
                    .attr("transform", "translate(" + d.x + "," + 20 + ")");

                var flr = (Math.round(d.x / sliderProperties.itemwidth));

                if (sliderProperties.filterVal == "Duration") {
                    if ((flr + 1) * 24 < 100)
                        container.selectAll(".sap_viz_ext_lossincidentoptimization_thumbtext_duration").text((flr + 1) * 24).attr("x", 8);
                    else
                        container.selectAll(".sap_viz_ext_lossincidentoptimization_thumbtext_duration").text((flr + 1) * 24).attr("x", 4);
                } else {
                    var granularityset = [1, 2, 3, 4, 6, 8, 12, 24];
                    if (granularityset[flr] < 10)
                        container.selectAll(".sap_viz_ext_lossincidentoptimization_thumbtext_granularity").text(granularityset[flr]).attr("x", 12);
                    else
                        container.selectAll(".sap_viz_ext_lossincidentoptimization_thumbtext_granularity").text(granularityset[flr]).attr("x", 8);
                }


                filterrun(flr);



            }

            /* Called when the drag event stops.
              Sets opacity of the slider thumb back to 1
            */

            this.dragEnd = function(d) {

                var x1 = d.x;
                d.y = 20;

                var y1 = d.y;
                x1 = (Math.round(x1 / sliderProperties.itemwidth)) * sliderProperties.itemwidth;

                d3.select(this)
                    .attr("opacity", sliderProperties.initialOpacity)
                    .attr("transform", "translate(" + (x1 - 16) + "," + y1 + ")");

                d.x = x1 - 16;

            }



            /* Set various slider properties and render the slider
             * @param {Object} dataset
             * @param {Object} chart
             */

            this.makeslider = function(dataset, chart) {
                sliderProperties.sliderwidth = this.config.sliderwidth || 280;
                sliderProperties.sliderheight = this.config.sliderheight || 50;
                sliderProperties.sliderAxisheight = this.config.sliderAxisheight || 5;
                sliderProperties.sliderYcoordinate = this.config.sliderYcoordinate || 30;
                sliderProperties.thumbRadius = this.config.thumbRadius || 12;
                sliderProperties.dataset = dataset;
                sliderProperties.chart = chart;
                sliderProperties.filterset = this.config.filterset;
                sliderProperties.filterset = removeNull();
                sliderProperties.filterVal = this.config.filterVal;
                sliderProperties.itemwidth = (sliderProperties.sliderwidth) / (sliderProperties.filterset.length - 1);
                sliderProperties.initialOpacity = this.config.initialOpacity || 1;
                sliderProperties.transitionOpacity = this.config.transitionOpacity || 0.6;

                var slidergroup = sliderContainer.append('g').attr("class", "sap_viz_ext_lossincidentoptimization_slider").attr("transform", "translate(" + (this.config.SliderLeftposition) + ",0)");

                var drag = d3.behavior.drag()
                    .origin(Object)
                    .on("drag", this.dragMove)
                    .on('dragend', this.dragEnd);

                var g = slidergroup.selectAll('g .sap_viz_ext_lossincidentoptimization_slider')
                    .data([{
                        x: -16,
                        y: 20
                    }])
                    .enter()
                    .append('g')
                    .attr("height", sliderProperties.sliderheight)
                    .attr("width", sliderProperties.sliderwidth)
                    .attr("class", "sap_viz_ext_lossincidentoptimization_slider");



                setElements(g, drag);
            }

            /* Set elements of the Slider like thumb and slider axis
             * @param {element} g
             * @param {function} drag
             */
            function setElements(g, drag) {

                var multiplier = (sliderProperties.filterVal == "Duration") ? 24 : 1;

                var defs = g.append('defs');

                defs.append('linearGradient')
                    .attr('x1', "0%").attr('y1', "0%").attr('x2', "0%").attr('y2', "100%")
                    .attr('id', 'gradient').call(function(gradient) {
                        gradient.append('stop').attr('offset', '0%').attr('style', 'stop-color:#e4e4e4;stop-opacity:1');
                        gradient.append('stop').attr('offset', '15%').attr('style', 'stop-color: #f6f6f6;stop-opacity:1');
                    });

                var slideraxis = g.append('rect').attr('y', sliderProperties.sliderYcoordinate)
                    .attr("class", "sap_viz_ext_lossincidentoptimization_sliderAxis_lio")
                    .attr("height", sliderProperties.sliderAxisheight)
                    .attr("width", sliderProperties.sliderwidth + 100).attr("x", -50).attr("fill", "url(#gradient)");

                var filter = defs.append("filter")
                    .attr("id", "dropshadow")

                filter.append("feGaussianBlur")
                    .attr("in", "SourceAlpha")
                    .attr("stdDeviation", 1.5)
                    .attr("result", "blur");
                filter.append("feOffset")
                    .attr("in", "blur")
                    .attr("dx", 1)
                    .attr("dy", 1)
                    .attr("result", "offsetBlur");

                var feMerge = filter.append("feMerge");

                feMerge.append("feMergeNode")
                    .attr("in", "offsetBlur")
                feMerge.append("feMergeNode")
                    .attr("in", "SourceGraphic");


                g.append("text").attr("x", -50).attr("y", 15).attr("fill", "#666666").attr("font-size", 15).text(sliderProperties.filterVal + " (in Hours)");

                g.selectAll(".sap_viz_ext_lossincidentoptimization_ticktext")
                    .data(sliderProperties.filterset)
                    .enter()
                    .append("text")
                    .attr("class", "sap_viz_ext_lossincidentoptimization_ticktext")
                    .attr("x", function(d, i) {
                        return (sliderProperties.itemwidth * i - 1);
                    })
                    .attr("y", "45").attr("fill", "#bfbfbf").attr("font-size", 12)
                    .text(function(d, i) {
                        if (sliderProperties.filterset.length > 9)

                        {
                            if (sliderProperties.filterVal == "Duration" && (i == 0 || i == sliderProperties.filterset.length - 1)) return (d * multiplier);
                            else
                                return "";
                        } else return d * multiplier;
                    })
                    .attr("text-anchor", "middle");


                var thumb = g.append("g").attr("transform", "translate(-16,20)").attr("filter", "url(#dropshadow)");
                thumb.classed(sliderProperties.filterVal, true);
                thumb.append("rect")
                    .attr("rx", 2)
                    .attr("width", function ()  {

					if (config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99)
						return 30
						if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999)
							return 38 
							else
								return 46
								       
				})
                    .attr("height", 46)
                    .attr("fill", "#fafafa")
                    .attr("stroke", config.strokeColor)
                    .attr("stroke-width", 1);

                if (sliderProperties.filterVal == "Duration") {
                    thumb.append("text").attr("class", "sap_viz_ext_lossincidentoptimization_thumbtext_duration").attr("x",function ()  {

					             if(config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99)
					return 8
					if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999)
						return 10
						else
							return 12
							       
				}).attr("y", 26).attr("font-size", 14).attr("fill", "#444444").text("24");
                } else thumb.append("text").attr("x", function ()  {

					             if(config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99)
					return 12
					if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999)
						return 14 
						else
							return 16
							       
				}).attr("y", 26).attr("fill", "#444444").attr("class", "sap_viz_ext_lossincidentoptimization_thumbtext_granularity").attr("font-size", 14).text("1");

                thumb.append("rect")
                    .attr("width",function ()  {

					             if(config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99)
					return 30
					if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999)
						return 38 
						else
							return 46
							       
				})
                    .attr("height", 4)
                    .attr("fill", config.strokeColor)
                    .attr("stroke", config.strokeColor)
                    .attr("stroke-width", 1);

                thumb.append("line")
                    .attr("x1",function ()  {

					             if(config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99)
					return 13
					if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999)
						return 15 
						else
							return 17
							       
				})
                    .attr("x2",function ()  {

					             if(config.filterset[config.filterset.length - 1] > 0 && config.filterset[config.filterset.length - 1] < 99)
					return 13
					if (config.filterset[config.filterset.length - 1] > 99 && config.filterset[config.filterset.length - 1] < 999)
						return 15 
						else
							return 1
							       
				})
                    .attr("y1", 40)
                    .attr("y2", 36)
                    .attr("stroke", "grey")
                    .attr("stroke-width", 1);

                thumb.append("line")
                    .attr("x1", 17)
                    .attr("x2", 17)
                    .attr("y1", 40)
                    .attr("y2", 36)
                    .attr("stroke", "grey")
                    .attr("stroke-width", 1)
                thumb.call(drag);
            }
        }

        function prepare(dataset) {
            var BarConfig = {
                measure: "claim",
                dimension: "label",
                width: width,
                height: height,
                margin: margin,
                labelarea: 225,
                topPosition: 90
            };

            var customchart1 = new BarChart(BarConfig);
            customchart1.update(dataset);

            var DurationSliderConfig = {
                measure: "claim",
                dimension: "label",
                filterset: durationSet,
                filterVal: "Duration",
                width: 0.439 * width,
                height: 0.1210 * height,
                sliderwidth: 0.185 * width,
                sliderAxisheight: 26,
                sliderheight: 46,
                sliderYcoordinate: 30,
                thumbRadius: 7,
                initialOpacity: 1,
                transitionOpacity: 0.6,
                SliderLeftposition: 0,
                strokeColor: "#009de0"
            };

            var GranularitySliderConfig = {
                measure: "claim",
                dimension: "label",
                filterset: [1, 2, 3, 4, 6, 8, 12, 24],
                filterVal: "Granularity",
                width: 0.439 * width,
                height: 0.1210 * height,
                sliderwidth: 0.185 * width,
                sliderAxisheight: 26,
                sliderheight: 46,
                sliderYcoordinate: 30,
                thumbRadius: 7,
                initialOpacity: 1,
                transitionOpacity: 0.6,
                SliderLeftposition: (0.185 * width + 170),
                strokeColor: "#f39200"
            };





            var GranularitySlider = new Slider(GranularitySliderConfig);
            GranularitySlider.makeslider(dataset, customchart1);

            var DurationSlider = new Slider(DurationSliderConfig);
            DurationSlider.makeslider(dataset, customchart1);
        }


        /**
         * DataLogic to generate the Reusable Dataset which aggregates a rolling some of claims till the last date.
         *
         * @param {array} rawData
         * @return {array} plotDataset
         */
        function dataLogic(rawData) {


            var dataSet = {};
            var plotDataset = [];
            var prevSum = 0;

            for (var i = 0; i < rawData.length; i++) {

                if (dataSet[rawData[i].Date] == undefined) {

                    if (i - 1 >= 0) {
                        prevSum = dataSet[rawData[i - 1].Date][23];
                        var l = Object.keys(dataSet).length
                        var keys = Object.keys(dataSet);
                        plotDataset.push({
                            "Date": keys[l - 1],
                            "Items": dataSet[rawData[i - 1].Date]
                        });

                    }

                    var items = new Array(24);
                    for (var j = 0; j < 24; j++) {
                        items[j] = prevSum;
                    }

                    dataSet[rawData[i].Date] = items;
                }

                var claim = parseInt(rawData[i].Claim);

                var time = '0';
                for (var k = 0; rawData[i].Time[k] != ':'; k++)
                    time += rawData[i].Time[k];

                var index = parseInt(time);

                for (var k = index; k < 24; k++)
                    dataSet[rawData[i].Date][k] += (claim);

            }

            var l = Object.keys(dataSet).length;
            keys = Object.keys(dataSet);
            plotDataset.push({
                "Date": keys[l - 1],
                "Items": dataSet[rawData[i - 1].Date]
            });

            dataSet = [];

            dateList = keys;


            plotDataset[0].Items.unshift(0);

            for (var i = 1; i < plotDataset.length; i++) {

                plotDataset[i].Items.unshift(plotDataset[i - 1].Items[24]);
            };


            return plotDataset;

        };


        /**
         * Generate a dataset to be consumed by the Barchart class ( in format of Date range and Claim value )
         * for given values of Duration and Granularity
         * @param {number} q ( Granularity)
         *  @param {number} p(Duration)
         * @return {array} plotDataset
         */
        function plot(plotDataset, p, q) {

            var n = dateDifference((plotDataset[(plotDataset.length - 1)].Date), plotDataset[0].Date);

            n++;

            for (var i = 1; i <= n; i++) {
                durationSet.push(i);
            };


            var count = 0;
            var counterspace = 0;

            var finaldata = [];

            for (var i = 0; i <= n - p; ++i) {

                for (var j = 0; j < 24; j = j + q) {

                    var sum = 0;
                    var obj = {};
                    var label = "";
                    var label2 = "";

                    var start_date = getNthDate(plotDataset[0].Date, i);

                    var start_date_label = start_date;
                    var end_date = getNthDate(plotDataset[0].Date, i + p);
                    var end_date_label = end_date;
                    var start_index = binaryIndexOf.call(dateList, start_date);
                    var end_index = binaryIndexOf.call(dateList, end_date);
                    var start_claim = 0;
                    var end_claim = 0;
                    var label_tooltip;

                    if (i < (n - p)) {
                        if (!(start_index < 0 && end_index < 0)) {

                            if (start_index < 0) {
                                start_index = (start_index * -1) - 1;
                                start_date = dateList[start_index];
                                start_claim = plotDataset[start_index].Items[24];
                            } else {

                                start_date = dateList[start_index];
                                start_claim = plotDataset[start_index].Items[j];
                            }

                            if (end_index < 0) {
                                end_index = (end_index * -1) - 1;
                                end_date = dateList[end_index];
                                end_claim = plotDataset[end_index].Items[24];
                            } else {
                                end_date = dateList[end_index];
                                end_claim = plotDataset[end_index].Items[j];
                            }
                            label = start_date_label + " to " + end_date_label;
                            label2 = j + "h to " + j + "h";

                            for (var k = 0; k < counterspace; k++) {
                                label = label + " ";
                                label2 = label2 + " ";
                            };

                            sum = end_claim - start_claim;
                            label_tooltip_duration = start_date_label + " to " + end_date_label;
                            label_tooltip_granularity = j + "h";

                            obj.label_tooltip_granularity = label_tooltip_granularity;
                            obj.label_tooltip_duration = label_tooltip_duration;
                            obj.claim = sum;

                            obj.label = label;
                            obj.label2 = label2;
                            finaldata.push(obj);
                            ++counterspace;



                        }
                    } else if ((i == (n - p)) && j == 0) {

                        if (start_index < 0) {
                            start_index = (start_index * -1) - 1;
                            start_date = dateList[start_index];
                            start_claim = plotDataset[start_index].Items[24];
                        } else {

                            start_date = dateList[start_index];
                            start_claim = plotDataset[start_index].Items[j];
                        }

                        end_date = getNthDate(plotDataset[0].Date, i + p - 1);

                        end_index = binaryIndexOf.call(dateList, end_date);

                        end_claim = plotDataset[end_index].Items[24];

                        label = start_date + " to " + end_date_label;
                        label2 = j + "h to " + j + "h";

                        for (var k = 0; k < counterspace; k++) {
                            label = label + " ";
                            label2 = label2 + " ";
                        }

                        label_tooltip_duration = start_date_label + " to " + end_date_label;
                        obj.label_tooltip_granularity = label_tooltip_granularity;
                        obj.label_tooltip_duration = label_tooltip_duration;

                        sum = end_claim - start_claim;
                        obj.claim = sum;
                        obj.label = label;
                        obj.label2 = label2;
                        finaldata.push(obj);

                    }

                }
            }

            return finaldata;
        };


    };

    return render;

});