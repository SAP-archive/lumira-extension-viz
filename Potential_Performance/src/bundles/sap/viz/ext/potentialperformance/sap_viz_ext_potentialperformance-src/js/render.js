define("sap_viz_ext_potentialperformance-src/js/render", [], function() {
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
		
		//store these column names in variables as they may differ per dataset
		var potentialMetric = data.meta.dimensions()[1];
		var performanceMetric = data.meta.dimensions()[2];
        
        //Added to the beginning of each CSS class to follow best practice
        //prevents class name conflicts with other extensions
        var cssTag = "sap_viz_ext_potentialperformance";

        //total number of employees is the # of records in the dataset
        var totalNumEmployees = data.length;

        //colors of the boxes can be changed here (number of colors should match number of performance metrics)
        //since each color corresponds to a column
        var sectionColor = d3.scale.ordinal()
            .range(["#c6dbef","#9ecae1","#6baed6","#3182bd","#1f70b4"]);
            
        //measures of potential/performance can be changed here
        var potentialMeas = ["Fast Track", "Accelerated", "Growth"]; //list in descending order
        var performanceMeas = ["Insufficient", "Progressing", "Successful", "Outstanding", "Extraordinary"]; //list in ascending order

        //an array of paired performance metric and potential metric names (e.g. "Insufficient/Fast Track")
        //--see cretateCategories() function at the bottom--
        var categoryData = createCategories(performanceMeas, potentialMeas);

        //set up our plot and chart area
        var margin = {
                top: 20,
                right: 40,
                bottom: 30,
                left: 20
            },
            width = this.width() - margin.left - margin.right,
            height = this.height() - margin.top - margin.bottom;

        container.selectAll("div").remove();

        var chart = container.append("div")
            .style({
                "width": width + "px",
                "height": height + "px",
                "margin": "0 auto"
            });
        var plot = chart.append("div").attr("class", cssTag);

        var potentialPerformanceForm = plot.append("div").attr("class", cssTag + "_form");

        renderChart();

        function renderChart() {

            renderYAxis();

            //append a box for each pair of performance/potential metric
            var contentSec = potentialPerformanceForm.selectAll(cssTag + "_content-section")
                .data(categoryData)
                .enter()
                .append("div")
                .attr("class", cssTag + "_content-section")
                .style("background-color", function(d, i) {
                    return sectionColor(i);
                })
                .style({
                	"width": 100/performanceMeas.length + "%",
                	"height": 100/potentialMeas.length + "%"
                });

            contentSec.append("h4")
                .attr("class", cssTag + "section-title")
                .text(function(d) {
                    return d;
                }); //the variable d is the data bound to each section (e.g. the string 'Insufficient/Fast Track')

            //loop thru sections to add list of employees that fit the corresponding category, and percentage of total employees
            var contentTitle = "";
            var percentageText = "";
            var employeeCount = 0;
            var percentEmployees = 0;
            var employeeList;

            contentSec[0].forEach(function(section) {
                section = d3.select(section);

                employeeCount = 0;
                contentTitle = section.select("h4").text();

                //replaces any "/" or " " characters with "-" to create a valid id attribute
                section.attr("id", (contentTitle.replace("/", "-")).replace(" ", "-"));

                percentageText = section.append("p")
                    .attr("class", cssTag + "_percentage-text");
                employeeList = section.append("ul")
                    .attr("class", cssTag + "_employee-list");

                data.forEach(function(d) {
                    //if the performance/potential for this record is the same as the title of the box,
                    //increase employeeCount for this category by one and add the employee's name to the list
                    if (d.Performance + "/" + d.Potential == contentTitle) {
                        employeeCount += 1;

                        employeeList.append("li")
                            .text(d.Employee);
                    }
                });

                percentEmployees = Math.round((employeeCount / totalNumEmployees) * 100);
                percentageText.text(percentEmployees + "%");
            });

            renderXAxis();

            //clicking a box(section) will display just it's data in an enlarged view
            contentSec.on("click", function(d) { //d is the data bound to the clicked box (e.g. "Insufficient/Fast Track")
                var id = ("#" + d.replace("/", "-")).replace(" ", "-");
                var section = d3.select(id);
                //store the percentage text, list of employees, and background color for the clicked box by using its id attribute
                var percentageText = d3.select(id + " ." + cssTag + "_percentage-text").text();
                var employeeList = d3.select(id + " ." + cssTag + "_employee-list").selectAll("li")[0];
                var backgroundColor = section[0][0].style.backgroundColor;

                //clear the screen of all boxes and axes
                contentSec.remove();
                d3.selectAll("." + cssTag + "_axis").remove();
                potentialPerformanceForm.style("margin-left", "10%");

                //transition to display a new enlarged view
                potentialPerformanceForm.append("div")
                    .attr("class", cssTag + "_enlarged")
                    .style({
                        "height": "0%",
                        "width": "0%"
                    })
                    .transition()
                    .style({
                        "height": "100%",
                        "width": "100%",
                        "background-color": backgroundColor //set enlarged view to have same color stored from clicked box
                    })
                    .duration(500);

                var enlargedDetailDiv = d3.select("." + cssTag + "_enlarged");
                enlargedDetailDiv.append("h1")
                    .text(d);

                var leftDiv = enlargedDetailDiv.append("div")
                    .attr("class", cssTag + "_enlarged-detail");

                var rightDiv = enlargedDetailDiv.append("div")
                    .attr("class", cssTag + "_enlarged-detail");

                //add stored percentage text & number of employees of total on the left, and list of employees on the right
                leftDiv.append("p")
                    .text(percentageText)
                    .transition()
                    .duration(700)
                    .style({
                        "font-size": "5em",
                        "font-weight": "bold",
                        "margin-top": "20%"
                    });
                leftDiv.append("p")
                    .style("font-size", "2em")
                    .text("(" + employeeList.length + " of " + totalNumEmployees + " employees in this category)");

                var employeeUl = rightDiv.append("ul")
                    .attr("class", cssTag + "_enlarged-employee-list");
                employeeUl = d3.select("." + cssTag + "_enlarged-employee-list");
                employeeList.forEach(function(employee) {
                    employee = employee.textContent;
                    employeeUl.append("li")
                        .text(employee)
                        .style("font-size", "2em");
                });

                //clicking the enlarged view renders the original chart
                enlargedDetailDiv.on("click", function() {
                    potentialPerformanceForm.style("margin-left", "0");
                    enlargedDetailDiv.remove();
                    renderChart();
                });

            });
        }

        function renderYAxis() {
            var yAxis = plot.append("div")
                .attr("class", cssTag + "_axis")
                .attr("id", cssTag + "_y-axis");

            yAxis.append("h1")
                .text(potentialMetric);

            potentialMeas.forEach(function(potenMeas, i) {
                yAxis.append("h3")
                    .attr("class", cssTag + "_y-axis-label")
                    //CSS Positioning for rotated elements is weird :)
                    .style("top", ((100/potentialMeas.length)/potentialMeas.length) + (i * (100/potentialMeas.length)) + "%")
                    .text(potenMeas);
            });
        }

        function createCategories(performanceArr, potentialArr) {
            var categoryArr = [];
            //pair each potential metric name with each performance metric name (separted by a "/")
            //creates array of titles for each box/category
            potentialArr.forEach(function(potentialMeas) {
                performanceArr.forEach(function(performanceMeas) {
                    categoryArr.push(performanceMeas + "/" + potentialMeas);
                });
            });
            return categoryArr;
        }

        function renderXAxis() {
            var xAxis = plot.append("div")
                .attr("class", cssTag + "_axis")
                .attr("id", cssTag + "_x-axis");

            performanceMeas.forEach(function(perfMeas) {
                xAxis.append("h3")
                    .attr("class", cssTag + "_x-axis-label")
                    .style("width", 100/performanceMeas.length + "%")
                    .text(perfMeas);
            });
            xAxis.append("h1")
                .text(performanceMetric);
        }
    };

    return render;
});