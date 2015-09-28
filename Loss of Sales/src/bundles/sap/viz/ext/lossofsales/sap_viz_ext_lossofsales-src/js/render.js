define("sap_viz_ext_lossofsales-src/js/render", [], function() {
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
	var render = function(data, container, width, height, colorPalette, properties, dispatch) {
		
		
		//Removing existing elements
		container.selectAll('svg').remove();
		
		//Append and svg element to the container
		var svg = container.append('svg').attr('width', width).attr('height', height);
      
        var dset0 = data.meta.dimensions(0);
        var mset0 = data.meta.measures(0); 
        var mset1 = data.meta.measures(1); 
        var mset2 = data.meta.measures(2);
        var mset3 = data.meta.measures(3);

        var ds0 = dset0[0];         // products
        var ms0 = mset0[0];         // actualStock
        var ms1 = mset1[0];         // forecastedStock
        var ms2 = mset2[0];         // actualSale
        var ms3 = mset3[0];         // forecastedSale

    /**
     * These are global variables defined for loss_of_sales visualization
     * @param {Object} clickCounter - counter used for text change for rectObjects on 'click' event.
     * @param {float} eventScale - The scale given by d3.event on zoom trigger.
    */    
        var clickCounter = 0;
        var eventScale = 1;

        var t_tip = tooltipDefine();
        var tooltip = t_tip();

         update();



    /**
    * It is the drawing function; appends the column chart on a given _selection.
    * @param {object} config - an object variable storing the specifications of the column chart to be drawn. 
    */
        function customColumnChart(config) {
 
            this.chartW = config.width || 1000,
            this.chartH = config.height || 800,
            this.objHeight = config.objHeight || 20,
            this.dLeft = parseInt(config.dLeft) || 0,
            this.dRight = parseInt(config.dRight) || 0,
            this.rLeft = parseInt(config.rLeft) || 0,
            this.rRight = config.rRight || 100,
            this.MARGIN = config.MARGIN,
            this.orientX = config.orientX || "top",
            this.orientY = config.orientY || "left",
            this.classGroup = config.classGroup || "default",
            this.format = config.format,
            this.demiScale = config.demiScale || 0,
            this.count = config.count || 5;
            
            that = this;
            
            svg = d3.select('sap_viz_ext_lossofsales_legendDiv');   

            this.xScale = d3.scale.linear()
                                    .domain([this.dLeft, this.dRight])
                                    .range([this.rLeft, this.rRight]);                                    
            
            this.yScale = d3.scale.linear()
                                    .domain([0, this.count])    
                                    .range([0, this.chartH]);


            this.xAxis = d3.svg.axis()
                                    .scale(this.xScale)
                                    .orient(this.orientX)
                                    .ticks(5)
                                    //.innerTickSize(5)
                                    //.tickPadding(10)
                                    .tickFormat(this.format);
                                        

            this.draw = function (_data, _selection){

                var xScale = that.xScale ;
                var yScale = that.yScale;
                var chartH = that.chartH;
                var chartW = that.chartW;
                var objHeight = that.objHeight;
                var demiScale = that.demiScale; 
                var on_Click = this.onClick;

                var on_Mouse = that.onMouse;
                var out_Mouse = that.outMouse;
               
                var chart_container = _selection.append("g")
                                        .attr("class",this.classGroup) ;
                                        
                     
                var rectGroup = chart_container.selectAll("g")
                                        .data(_data)
                                        .enter()
                                        .append("g")
                                        .attr("id",function(d,i){
                                                return ("group" + i);
                                            });
                            
                    rectGroup.append("rect")
                                        .attr("x",0)
                                        .attr("y",function(d,i){
                                            return (yScale(i));                   
                                        })
                                        .attr("width",chartW)
                                        .attr("height",objHeight)
                                        .attr("class","sap_viz_ext_lossofsales_backgroundBars");
     
                    rectGroup.append("rect")
                                        .attr("x",function(d){
                                            return xScale(d.x);
                                        })
                                        .attr("y",function(d,i){
                                            return yScale(i);
                                        })
                                        .attr("width",function(d){
                                            return  xScale(d.width);
                                        })
                                        .attr("height",objHeight)
                                        .attr("class","sap_viz_ext_lossofsales_objects")
                                        .attr("id",function(d,i){
                                                return ("rect" + i);
                                        })
                                        .on("mouseover",function(d,i){
           
                                            on_Mouse(d3.select(this),this,d,xScale,demiScale,svg,yScale);
                                            
                                            rectGroup.append("line").attr("class", "sap_viz_ext_lossofsales_tooltipLine")
                                                                                    .attr("style","dashed")
                                                                                    .attr("x1",xScale(d.x))
                                                                                    .attr("y1",0)
                                                                                    .attr("x2",xScale(d.x))
                                                                                    .attr("y2",yScale(i));

                                            rectGroup.append("line").attr("class", "sap_viz_ext_lossofsales_tooltipLine")
                                                                                    .attr("x1",xScale(d.x) + xScale(d.width))
                                                                                    .attr("y1",0)
                                                                                    .attr("x2",xScale(d.x) + xScale(d.width))
                                                                                    .attr("y2",yScale(i));
                                        })
                                        .on("click", function(d){
                                            on_Click(d);
                                        })
                                        .on("mouseout",function(d,i){
                                                         return out_Mouse(d3.select(this));
                                            });
     
                    rectGroup.append("text")
                                        .attr("x", function(d){
                                            return xScale(d.x) + xScale(d.width)/2;
                                        })
                                        .attr("y",function(d,i){
                                            return yScale(i+0.5) + 3;
                                        })
                                        .attr("class",function(d){
                                            if(d.text === 0 && d.value === "sale")
                                                return "sap_viz_ext_lossofsales_zeroSaleValue";
                                            else if(d.text === 0 && d.value === "stock")
                                                return "sap_viz_ext_lossofsales_zeroStockValue";
                                            else 
                                                return "sap_viz_ext_lossofsales_centerValue";
                                            })
                                        .text(function(d,i){
                                            return (textFormatter(d.text0));
                                        })
                                        .attr("font-size",function(d){
                                                if(objHeight < 12)            // check on font-size depending on no. of products 
                                                    return 0;
                                                else if(objHeight < 25)
                                                    return 12;
                                                else
                                                    return 16;
                                            })
                                        .attr("id",function(d,i){
                                                return ("centerValue" + i); 
                                            })
                                        .attr("opacity",function(d){
                                            if(d.text != 0){
                                                var padding = 10;
                                                if(xScale(d.width) < this.getComputedTextLength() + padding){
                                                    this.remove();
                                                    return 0;
                                                    }
                                                }
                                            return "auto";
                                        })
                                        .on("mouseover",function(d,i){
           
                                            var rect_object = d3.select(this.parentNode).select(".sap_viz_ext_lossofsales_objects");
                                            
                                            on_Mouse(rect_object,this,d,xScale,demiScale,svg,yScale);
                                            
                                            rectGroup.append("line").attr("class", "sap_viz_ext_lossofsales_tooltipLine")
                                                                                    .attr("style","dashed")
                                                                                    .attr("x1",xScale(d.x))
                                                                                    .attr("y1",0)
                                                                                    .attr("x2",xScale(d.x))
                                                                                    .attr("y2",yScale(i));

                                            rectGroup.append("line").attr("class", "sap_viz_ext_lossofsales_tooltipLine")
                                                                                    .attr("x1",xScale(d.x) + xScale(d.width))
                                                                                    .attr("y1",0)
                                                                                    .attr("x2",xScale(d.x) + xScale(d.width))
                                                                                    .attr("y2",yScale(i));
                                        })
                                        .on("click", function(d){
                                            on_Click(d);
                                        })
                                        .on("mouseout",function(d,i){
                                                        var object = d3.select(this.parentNode).select(".sap_viz_ext_lossofsales_objects");
                                                        return out_Mouse(object);
                                            });
                                        
                return (chart_container);
            }
                
            this.zoomupdate = function(_data, _selection, objHeight, eventScale) {

                var chartH = this.chartH;
                var chartW = this.chartW;
                var objHeight = this.objHeight;
                var objH = objHeight * eventScale;  
                var demiScale = this.demiScale; 
                var on_Click = this.onClick;
            
                var xScale = this.xScale;
                var yScale = d3.scale.linear()
                                        .domain([0, this.count])
                                        .range([0, chartH * eventScale]);
                    
                var on_Mouse = this.onMouse;
                var out_Mouse = this.outMouse;

                var chart_container = _selection.append("g")
                                        .attr("class",this.classGroup) ;
                      
                var rectGroup = chart_container.selectAll("g")
                                        .data(_data)
                                        .enter()
                                        .append("g")/*
                                        .filter(function(d,i){
                                            var temp = (yScale(i) + d3.event.translate[1]);
                                            return ((temp <= 700));
                                            })    */
                                        .attr("id",function(d,i){
                                                return ("group" + i);
                                            });
                            
                
                    rectGroup.append("rect")
                                        .attr("x", 0)
                                        .attr("y", function(d, i) {
                                            return (yScale(i));
                                        })
                                        .attr("width", chartW)
                                        .attr("height", objH)
                                        .attr("class", "sap_viz_ext_lossofsales_backgroundBars");

                    rectGroup.append("rect")
                                        .attr("x", function(d) {
                                            return xScale(d.x);
                                        })
                                        .attr("y", function(d, i) {
                                            return yScale(i);
                                        })
                                        .attr("width", function(d) {
                                            return xScale(d.width);
                                        })
                                        .attr("height", objH)
                                        .attr("class", "sap_viz_ext_lossofsales_objects")
                                        .attr("id", function(d, i) {
                                            return ("rect" + i);
                                        })
                                        .on("mouseover",function(d,i){

                                            on_Mouse(d3.select(this),this,d,xScale,demiScale,svg,yScale);
                                            
                                            rectGroup.append("line").attr("class", "sap_viz_ext_lossofsales_tooltipLine")
                                                                                    .attr("style","dashed")
                                                                                    .attr("x1",xScale(d.x))
                                                                                    .attr("y1",0)
                                                                                    .attr("x2",xScale(d.x))
                                                                                    .attr("y2",yScale(i));

                                            rectGroup.append("line").attr("class", "sap_viz_ext_lossofsales_tooltipLine")
                                                                                    .attr("x1",xScale(d.x) + xScale(d.width))
                                                                                    .attr("y1",0)
                                                                                    .attr("x2",xScale(d.x) + xScale(d.width))
                                                                                    .attr("y2",yScale(i));
                                        
                                        })
                                        .on("click", function(d){
                                            on_Click(d);
                                        })
                                        .on("mouseout",function(d,i){
                                                            return out_Mouse(d3.select(this));
                                            });
                                        
                    rectGroup.append("text")
                                        .attr("x", function(d){
                                            return xScale(d.x) + xScale(d.width)/2;
                                        })
                                        .attr("y",function(d,i){
                                            return yScale(i+0.5) + 3;
                                        })
                                        .attr("class",function(d){
                                            if(d.text === 0 && d.value === "sale")
                                                return "sap_viz_ext_lossofsales_zeroSaleValue";
                                            else if(d.text === 0 && d.value === "stock")
                                                return "sap_viz_ext_lossofsales_zeroStockValue";
                                            else 
                                                return "sap_viz_ext_lossofsales_centerValue";
                                            })
                                        .text(function(d,i){
                                            if (clickCounter === 0)
                                                return textFormatter(d.text0);
                                            else if (clickCounter === 1)
                                                return textFormatter(d.text1);
                                            else if (clickCounter === 2){
                                                return textFormatter(d.text2);
                                            }
                                        })
                                        .attr("font-size",function(d){
                                        var objH = objHeight * eventScale;
                                                if(objH < 12)            // check on font-size depending on no. of products 
                                                    return 0;
                                                else if(objH < 25)
                                                    return 12;
                                                else
                                                    return 16;
                                            })
                                        .attr("id",function(d,i){
                                                return ("centerValue" + i); 
                                            })
                                        .attr("opacity",function(d){
                                        if(d.text != 0){
                                            var padding = 10;
                                            if(xScale(d.width) < this.getComputedTextLength() + padding){
                                                this.remove();
                                                return 0;
                                                }
                                            }
                                            return "auto";
                                        })
                                        .on("mouseover",function(d,i){
           
                                            var rect_object = d3.select(this.parentNode).select(".sap_viz_ext_lossofsales_objects");
                                            on_Mouse(rect_object,this,d,xScale,demiScale,svg,yScale);
                                            
                                            rectGroup.append("line").attr("class", "sap_viz_ext_lossofsales_tooltipLine")
                                                                                    .attr("style","dashed")
                                                                                    .attr("x1",xScale(d.x))
                                                                                    .attr("y1",0)
                                                                                    .attr("x2",xScale(d.x))
                                                                                    .attr("y2",yScale(i));

                                            rectGroup.append("line").attr("class", "sap_viz_ext_lossofsales_tooltipLine")
                                                                                    .attr("x1",xScale(d.x) + xScale(d.width))
                                                                                    .attr("y1",0)
                                                                                    .attr("x2",xScale(d.x) + xScale(d.width))
                                                                                    .attr("y2",yScale(i));
                                        })
                                        .on("click", function(d){
                                            on_Click(d);
                                        })
                                        .on("mouseout",function(d,i){
                                                        var object = d3.select(this.parentNode).select(".sap_viz_ext_lossofsales_objects");
                                                        return out_Mouse(object);
                                            });
                                        
                return (chart_container);
            }
                
            this.onMouse = function(object,this1,d,xScale,demiScale,svg,yScale) {
                var chartW = that.chartW;
                var chartH = that.chartH;
                var objHeight = that.objHeight;
                var MARGIN = that.MARGIN;

                var x = object.attr("x");
                var rect_width = object.attr("width");
                var rect_height = object.attr("height");
                var objH = objHeight * eventScale;
                                                
                    object.attr("fill", function(d){
                            if(d.value === "sale")
                                return ("url(#gradient1)");
                            else 
                                return ("url(#gradient2)");
                    });
                   
                var classed="sap_viz_ext_lossofsales_top";

                    tooltip.visibility("block");
                
                var tt=tooltip;
                var matrix = this1.getScreenCTM()
                        .translate(+object.attr("x"), +object.attr("y"));
            
                var tt_width = tooltipDimension()[0];
                var tt_height = tooltipDimension()[1];
                    
                var leftPos, topPos;
                var padding_left = 20;
                var padding_top = 12;
                var arrowH = 10;
                    
                    topPos = (window.pageYOffset + matrix.f + parseInt(rect_height) + parseInt(arrowH));
                    leftPos = (window.pageXOffset + matrix.e + parseInt(rect_width/2) - tt_width/2);

                var checkV = chartH - (topPos - MARGIN.top + tt_height);

                if(d.value === "sale")
                    var checkH = chartW - parseInt(x) - parseInt(rect_width/2) - parseInt(tt_width/2);
                else
                    var checkH = parseInt(x) + parseInt(rect_width/2) - parseInt(tt_width/2);
                
                if(checkV < 0){
                    var classed = "sap_viz_ext_lossofsales_bottom";
                    topPos = topPos - tt_height - 3*padding_top - parseInt(rect_height);
                    }
                if(checkH < 0){
                        if(d.value === "sale")
                            leftPos = leftPos + checkH - 10;
                        else
                            leftPos = leftPos - checkH;    
                    }
                    
                tooltip.move([(topPos) + "px",(leftPos)+"px",]);
                tooltip.orientation(classed);   
                that.toolTipPopulate(d);    
            }

            this.toolTipPopulate = function(d){
                    var tt_data="<div class='sap_viz_ext_lossofsales_tt-item sap_viz_ext_lossofsales_tt-combo'>"+(d.item)+"</div>";
                    if(d.value==="sale"){
                        var firstLabel="<div class='sap_viz_ext_lossofsales_firstLabel sap_viz_ext_lossofsales_tt-item sap_viz_ext_lossofsales_tt-bag-val ' > Loss of Sales ";
                        firstLabel=firstLabel+"<span class='sap_viz_ext_lossofsales_tt-item-price'> "+"$"+" "+d.width+"</span></div>";

                        var secondLabel="<div class='sap_viz_ext_lossofsales_secondLabel sap_viz_ext_lossofsales_tt-item sap_viz_ext_lossofsales_tt-bag-val'> Actual Sales";
                        secondLabel=secondLabel+"<span class='sap_viz_ext_lossofsales_tt-item-price'>"+"$"+" "+d.x+"</span></div>";

                        var thirdLabel="<div class='sap_viz_ext_lossofsales_thirdLabel sap_viz_ext_lossofsales_tt-item sap_viz_ext_lossofsales_tt-bag-val'> Possible Sales";
                        thirdLabel=thirdLabel+"<span class='sap_viz_ext_lossofsales_tt-item-price'>"+"$"+" "+(parseInt(d.x)+parseInt(d.width))+"</span></div>";  

                        tt_data = tt_data+firstLabel+secondLabel+thirdLabel;

                    }   
                    else if(d.value==="stock"){
                        tt_data=tt_data+"<div class='sap_viz_ext_lossofsales_firstLabel sap_viz_ext_lossofsales_tt-item sap_viz_ext_lossofsales_tt-bag-val' > Shortage of Quantity";
                        tt_data=tt_data+"<span class='sap_viz_ext_lossofsales_tt-item-price'>"+" "+(parseFloat(maxOfStock(data)) - parseFloat(d.width))+"</span></div>";

                        tt_data=tt_data+"<div class='sap_viz_ext_lossofsales_secondLabel sap_viz_ext_lossofsales_tt-item sap_viz_ext_lossofsales_tt-bag-val'> Actual Quantity";
                        tt_data=tt_data+"<span class='sap_viz_ext_lossofsales_tt-item-price'>"+" "+(parseFloat(d.x) - (parseFloat(maxOfStock(data)) - parseFloat(d.width)))+"</span></div>";

                        tt_data=tt_data+"<div class='sap_viz_ext_lossofsales_thirdLabel sap_viz_ext_lossofsales_tt-item sap_viz_ext_lossofsales_tt-bag-val'> Forecasted Quantity";
                        tt_data=tt_data+"<span class='sap_viz_ext_lossofsales_tt-item-price'>"+" "+parseFloat(d.x)+"</span></div>";
                    }

                if(clickCounter === 0){
                    if(d.value==="sale"){
                        tt_data=tt_data.replace("sap_viz_ext_lossofsales_selected","sap_viz_ext_lossofsales_thirdLabel");
                        tt_data=tt_data.replace("sap_viz_ext_lossofsales_firstLabel","sap_viz_ext_lossofsales_selected");
                    }
                    else if(d.value==="stock"){
                        tt_data=tt_data.replace("sap_viz_ext_lossofsales_selected2","sap_viz_ext_lossofsales_thirdLabel");
                        tt_data=tt_data.replace("sap_viz_ext_lossofsales_firstLabel","sap_viz_ext_lossofsales_selected2");
                    }
                } 
                else if(clickCounter === 1){
                    if(d.value==="sale"){
                        tt_data=tt_data.replace("sap_viz_ext_lossofsales_selected","sap_viz_ext_lossofsales_firstLabel");
                        tt_data=tt_data.replace("sap_viz_ext_lossofsales_secondLabel","sap_viz_ext_lossofsales_selected");
                    }
                    else if(d.value==="stock"){
                        tt_data=tt_data.replace("sap_viz_ext_lossofsales_selected2","sap_viz_ext_lossofsales_firstLabel");
                        tt_data=tt_data.replace("sap_viz_ext_lossofsales_secondLabel","sap_viz_ext_lossofsales_selected2");
                    }
                }
                else if(clickCounter === 2){
                    if(d.value==="sale"){
                        tt_data=tt_data.replace("sap_viz_ext_lossofsales_selected","sap_viz_ext_lossofsales_secondLabel");
                        tt_data=tt_data.replace("sap_viz_ext_lossofsales_thirdLabel","sap_viz_ext_lossofsales_selected");
                    }
                    else if(d.value==="stock"){
                        tt_data=tt_data.replace("sap_viz_ext_lossofsales_selected2","sap_viz_ext_lossofsales_firstLabel");
                        tt_data=tt_data.replace("sap_viz_ext_lossofsales_thirdLabel","sap_viz_ext_lossofsales_selected2");
                    }
                }

                tooltip.fillData(tt_data);
            }

            this.outMouse = function(object){
                d3.selectAll(".sap_viz_ext_lossofsales_tooltipLine").remove();
                d3.selectAll("#sap_viz_ext_lossofsales_t-tip").style("display","none");
                object.attr("fill", "demi");
            }

            this.onClick = function(d){   
                
                clickCounter++;
                if(clickCounter > 2)
                    clickCounter = 0;

                d3.select('.sap_viz_ext_lossofsales_stockDiv').selectAll("text").text(function(d,i){
                                                             if (clickCounter === 0)
                                                                 return textFormatter(d.text0);
                                                             else if (clickCounter === 1)
                                                                 return textFormatter(d.text1);
                                                             else if (clickCounter === 2){
                                                                 return textFormatter(d.text2);
                                                        }
                })

                d3.select('.sap_viz_ext_lossofsales_salesDiv').selectAll("text").text(function(d,i){
                                                             if (clickCounter === 0)
                                                                 return textFormatter(d.text0);
                                                             else if (clickCounter === 1)
                                                                 return textFormatter(d.text1);
                                                             else if (clickCounter === 2){
                                                                 return textFormatter(d.text2);
                                                        }
                })

                var tooltipData = tooltip.getData();
                
                if(clickCounter === 0){
                    if(d.value==="sale"){
                        tooltipData=tooltipData.replace("sap_viz_ext_lossofsales_selected","sap_viz_ext_lossofsales_thirdLabel");
                        tooltipData=tooltipData.replace("sap_viz_ext_lossofsales_firstLabel","sap_viz_ext_lossofsales_selected");
                    }
                    else if(d.value==="stock"){
                        tooltipData=tooltipData.replace("sap_viz_ext_lossofsales_selected2","sap_viz_ext_lossofsales_thirdLabel");
                        tooltipData=tooltipData.replace("sap_viz_ext_lossofsales_firstLabel","sap_viz_ext_lossofsales_selected2");
                    }
                } 
                else if(clickCounter === 1){
                    if(d.value==="sale"){
                        tooltipData=tooltipData.replace("sap_viz_ext_lossofsales_selected","sap_viz_ext_lossofsales_firstLabel");
                        tooltipData=tooltipData.replace("sap_viz_ext_lossofsales_secondLabel","sap_viz_ext_lossofsales_selected");
                    }
                    else if(d.value==="stock"){
                        tooltipData=tooltipData.replace("sap_viz_ext_lossofsales_selected2","sap_viz_ext_lossofsales_firstLabel");
                        tooltipData=tooltipData.replace("sap_viz_ext_lossofsales_secondLabel","sap_viz_ext_lossofsales_selected2");
                    }
                }
                else if(clickCounter === 2){
                    if(d.value==="sale"){
                        tooltipData=tooltipData.replace("sap_viz_ext_lossofsales_selected","sap_viz_ext_lossofsales_secondLabel");
                        tooltipData=tooltipData.replace("sap_viz_ext_lossofsales_thirdLabel","sap_viz_ext_lossofsales_selected");
                    }
                    else if(d.value==="stock"){
                        tooltipData=tooltipData.replace("sap_viz_ext_lossofsales_selected2","sap_viz_ext_lossofsales_secondLabel");
                        tooltipData=tooltipData.replace("sap_viz_ext_lossofsales_thirdLabel","sap_viz_ext_lossofsales_selected2");
                    }
                }


                tooltip.fillData(tooltipData); 
                        
            }        
        }
    /**
    * It is the 'main' function which calls the 'customColumnChart' function.
    */
        function update() {

            var maxStock = maxOfStock(data);
            var maxSales = maxOfSales(data);

            var maps=[];
            var stockData = [];
            var salesData = [];
            

            var fdata = data.map(function(d) {
                maps.push({item:d[ds0], actualStock:d[ms0], forecastedStock:d[ms1], actualSale:d[ms2], forecastedSale:d[ms3]});
            });

            for(var i=0; i<maps.length; i++){
                var w = maxStock - (maps[i].forecastedStock - maps[i].actualStock);
                var text = maps[i].forecastedStock - maps[i].actualStock;

                stockData.push({"item":maps[i].item, "x":maps[i].forecastedStock, "width":w, "text0":text, "text1":maps[i].actualStock,"text2":maps[i].forecastedStock, "value":"stock"});

                
                w = maps[i].forecastedSale - maps[i].actualSale;
                text = maps[i].forecastedSale - maps[i].actualSale;

                salesData.push({"item":maps[i].item, "x":maps[i].actualSale, "width":w, "text0":text, "text1":maps[i].actualSale, "text2":maps[i].forecastedSale, "value":"sale"});
            }


            var MARGIN = {  
                    top: height * 0.2, 
                    left: width * 0.1,   
                    right: width * 0.1
                    };
            if(MARGIN.top < 103){
            	MARGIN.top = 103;
            }
            
            var chartW = (width - MARGIN.left - MARGIN.right) * 0.4;    // .4* width defined by lumira 
            var chartH = height - MARGIN.top;                           // height defined by lumira
            var centerWidth = width * 0.1;
            var chartPad = data.length * 0.1;
            var objHeight = chartH/(data.length + chartPad);
            
            var clip = svg.append("defs").append("svg:clipPath")
		        .attr("id", "clip")
		        .append("svg:rect")
		        .attr("id", "clip-rect")
		        .attr("x", MARGIN.left)
		        .attr("y", MARGIN.top)
		        .attr("width", MARGIN.left+chartW+centerWidth+chartW)
		        .attr("height", height - MARGIN.top);
		        
		    var chartBody = svg.append("g")
		        .attr("clip-path", "url(#clip)")
		        .call(d3.behavior.zoom().scaleExtent([0.2, 5]).on("zoom", redraw));
            
            
            var margin = svg.append("g")
            	.attr('width', MARGIN.left)
            	.attr('height', height - MARGIN.top)
            	.attr("class","sap_viz_ext_lossofsales_marginDiv");
            var stockVis = chartBody.append('g')
            	.attr('width', chartW)
            	.attr('height', height - MARGIN.top)
            	.attr("class","sap_viz_ext_lossofsales_stockDiv")
            	.attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");
            var centerVis = chartBody.append('g')
            	.attr('width', centerWidth)
            	.attr('height', height - MARGIN.top)
            	.attr("class","sap_viz_ext_lossofsales_centerDiv")
            	.attr("transform", "translate(" + (MARGIN.left+chartW) + "," + MARGIN.top + ")");
            var salesVis = chartBody.append('g')
            	.attr('width', chartW)
            	.attr('height', height - MARGIN.top)
            	.attr("class","sap_viz_ext_lossofsales_salesDiv")
            	.attr("transform", "translate(" + (MARGIN.left+chartW+centerWidth) + "," + MARGIN.top + ")");
            var legendDiv = svg.append("g")
	            .attr('width', width)
	            .attr('height', MARGIN.top)
	            .attr("class","sap_viz_ext_lossofsales_legendDiv");


            var xscale = d3.scale.linear()
                                    .domain([0, maxStock])    
                                    .range([0, chartW]);

            var yscale = d3.scale.linear()
                                    .domain([0, stockData.length])    
                                    .range([0, chartH]);

            var configStock = {
                    "width": chartW,
                    "height": chartH,
                    "objHeight": objHeight, 
                    "dLeft": maxStock,
                    "dRight": String(0),
                    "rLeft": String(0),
                    "rRight": chartW,
                    "MARGIN": MARGIN,
                    "orientX": "top",
                    "orientY": "right",
                    "format": textFormatter,
                    "classGroup": "sap_viz_ext_lossofsales_stockObjects",
                    "demiScale": xscale,
                    "count": stockData.length
                    
                };

            var configSales = {
                    "width": chartW,
                    "height": chartH,
                    "objHeight": objHeight,
                    "dLeft": String(0),
                    "dRight": maxSales,
                    "rLeft": String(0),
                    "rRight": chartW,
                    "MARGIN": MARGIN,
                    "orientX": "top",
                    "orientY": "left",
                    "format": textFormatter,
                    "classGroup": "sap_viz_ext_lossofsales_salesObjects",
                    "count": salesData.length
                };
            
            var defs = centerVis.append('defs');
                defs.append('linearGradient')
                                          .attr('x1', "0%").attr('y1', "50%").attr('x2', "100%").attr('y2', "50%")
                                          .attr('id', 'gradient1').call(function(gradient) {
                                                                            gradient.append('stop').attr('offset', '0%').attr('style', 'stop-color:rgb(209,61,61);stop-opacity:1');
                                                                            gradient.append('stop').attr('offset', '20%').attr('style', 'stop-color:rgb(255,81,81);stop-opacity:1');
                                                                            gradient.append('stop').attr('offset', '80%').attr('style', 'stop-color:rgb(255,81,81);stop-opacity:1');
                                                                            gradient.append('stop').attr('offset', '100%').attr('style', 'stop-color: rgb(209,61,61);stop-opacity:1');
                                                                          });

                defs.append('linearGradient')
                                          .attr('x1', "0%").attr('y1', "50%").attr('x2', "100%").attr('y2', "50%")
                                          .attr('id', 'gradient2').call(function(gradient) {
                                                                            gradient.append('stop').attr('offset', '0%').attr('style', 'stop-color:#008AD6;stop-opacity:1');
                                                                            gradient.append('stop').attr('offset', '20%').attr('style', 'stop-color:#41A4F4;stop-opacity:1');
                                                                            gradient.append('stop').attr('offset', '80%').attr('style', 'stop-color:#41A4F4;stop-opacity:1');
                                                                            gradient.append('stop').attr('offset', '100%').attr('style', 'stop-color: #008AD6;stop-opacity:1');
                                                                          });
                    
            
            var side;
            if (width < height)
                side = (.06 * width);
            else
                side = (.07 * height);
            
            var bag = symbolBag(legendDiv, (chartW/2 + MARGIN.left - side/2), 20, side);
            bag.attr("id","sap_viz_ext_lossofsales_left_legend");
           
                bag.append("text")
                            .attr("class","sap_viz_ext_lossofsales_legends")
                            .attr("x",side/2)
                            .attr("y", side + 25)
                            .text("Shortage of Quantity")
                            .attr("id","sap_viz_ext_lossofsales_left_legendText")
                            .style("font-size",function(d){
                                        if (width < height)
                                            return 12;
                                        else
                                            return 14;
                                });


            var dollarSide;
            if (width < height)
                dollarSide = (.07 * width);
            else
                dollarSide = (.08 * height);
            
            var dollar = symbolDollar(legendDiv, (MARGIN.left + chartW + centerWidth + chartW/2 - dollarSide/2), 30, dollarSide);
                
                dollar.attr("id","sap_viz_ext_lossofsales_right_legend");

                dollar.append("text")
                            .attr("class","sap_viz_ext_lossofsales_legends")
                            .attr("x",dollarSide/2)
                            .attr("y", (.6*dollarSide) + 25)
                            .text("Loss of Revenue")
                            .attr("id","sap_viz_ext_lossofsales_right_legendText")
                            .style("font-size",function(d){
                                        if (width < height)
                                            return 12;
                                        else
                                            return 14;
                                });
      
            var customChartStock = new customColumnChart(configStock);
            var stockGraph = customChartStock.draw(stockData, stockVis);
            var customChartSales = new customColumnChart(configSales);
            var salesGraph = customChartSales.draw(salesData, salesVis);

            var axis_stock = legendDiv.append("g").attr("class","sap_viz_ext_lossofsales_xAxis").call(customChartStock.xAxis).attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");
            var axis_sales = legendDiv.append("g").attr("class","sap_viz_ext_lossofsales_xAxis").call(customChartSales.xAxis).attr("transform", "translate(" + (MARGIN.left + centerWidth + chartW) + "," + MARGIN.top + ")");
            // legendDiv.append("rect").attr('width',width).attr('height',MARGIN.top).attr('fill','#044B94').attr('fill-opacity','0.4');
            
            var prodCount = stockData.length;
            var maxCount = parseInt(chartH/25);
            var modF = parseInt(prodCount/maxCount);
                                                    
            var centerLegend = centerVis.selectAll("text")
                                                .data(stockData)
                                                .enter()
                                                .append("text")
                                                .attr("x", centerWidth/2)
                                                .attr("y",function(d,i){
                                                    return (yscale(i+0.5));
                                                    })
                                                .attr("class", "sap_viz_ext_lossofsales_centerLegend")
                                                .attr("id",function(d,i){
                                                            return ("centerText" + i);
                                                    })
                                                .text(function(d,i){
                                                    if (prodCount <= maxCount)
                                                        return (d.item);
                                                    else {
                                                       if(i%modF === 0)
                                                           return(d.item);
                                                    }
                                                });

            var centerRect = centerVis.append("rect").attr("class","sap_viz_ext_lossofsales_pane")
                                                .attr("width",centerWidth)
                                                .attr("height",chartH)
                                                .style("opacity","0");

            var zoom = d3.behavior.zoom();
                zoom = zoom.y(yscale);
                zoom = zoom.scaleExtent([1, (stockData.length/2)*(620/chartH)]).on("zoom", redraw);
            
                centerVis.call(zoom);
            
            

                d3.selectAll(".sap_viz_ext_lossofsales_xAxis path").remove();
                d3.selectAll(".sap_viz_ext_lossofsales_yAxis").remove();


                stockVis.append("line")
                                .attr("class","sap_viz_ext_lossofsales_yAxis")
                                .attr("x1",chartW)
                                .attr("y1",0)
                                .attr("x2",chartW)
                                .attr("y2",chartH);
            
                salesVis.append("line")
                                .attr("class","sap_viz_ext_lossofsales_yAxis")
                                .attr("x1",0)
                                .attr("y1",0)
                                .attr("x2",0)
                                .attr("y2",chartH);             

            function redraw() {

                    eventScale = d3.event.scale;

                var t = d3.event.translate;
                    t[1] = Math.min(5, Math.max((-chartH*eventScale + chartH) + (chartPad*eventScale), t[1]));
                    zoom.translate(t);

                    yscale = d3.scale.linear()
                        .domain([0, stockData.length])
                        .range([0, chartH * d3.event.scale]);

                    d3.selectAll(".sap_viz_ext_lossofsales_yAxis").remove();

                    centerVis.selectAll("text").remove();
                    stockVis.selectAll(".sap_viz_ext_lossofsales_stockObjects").remove();
                    salesVis.selectAll(".sap_viz_ext_lossofsales_salesObjects").remove();

                    customChartStock.zoomupdate(stockData, stockVis, objHeight, eventScale).attr("transform", "translate(" + 0 + "," + d3.event.translate[1] + ")");
                    customChartSales.zoomupdate(salesData, salesVis, objHeight, eventScale).attr("transform", "translate(" + 0 + "," + d3.event.translate[1] + ")");

                var prodCount = stockData.length;
                var maxCount = (chartH*eventScale)/25;
                var mod = parseInt(prodCount/maxCount);
                var objH = objHeight * d3.event.scale;
                var centerLegend = centerVis.selectAll("text")
                                                    .data(stockData)
                                                    .enter()
                                                    .append("text")
                                                    .attr("x", centerWidth/2)
                                                    .attr("y",function(d,i){
                                                        return (yscale(i+0.5));
                                                        })
                                                    .attr("class", "sap_viz_ext_lossofsales_centerLegend")
                                                    .attr("id",function(d,i){
                                                                return ("centerText" + i);
                                                        })
                                                    .text(function(d,i){
                                                        if (prodCount <= maxCount)
                                                            return (d.item);
                                                        else {
                                                           if (objH < 20){
                                                               if(i%mod === 0)
                                                                   return(d.item);
                                                            }
                                                            else
                                                                return (d.item);
                                                        }
                                                    });
                    
                    centerLegend.attr("transform", "translate(" + 0 + "," + d3.event.translate[1] + ")");

                    stockVis.append("line")
                                        .attr("class","sap_viz_ext_lossofsales_yAxis")
                                        .attr("x1",chartW)
                                        .attr("y1",0)
                                        .attr("x2",chartW)
                                        .attr("y2",chartH);
                    
                    salesVis.append("line")
                                        .attr("class","sap_viz_ext_lossofsales_yAxis")
                                        .attr("x1",0)
                                        .attr("y1",0)
                                        .attr("x2",0)
                                        .attr("y2",chartH);
            }
        }        

    /**
    * It defines tooltip which is to be rendered on 'mouseover' event.
    */
        function tooltipDefine () {
            
            var width = "auto", // default width
            height = "auto",
            html="sap_viz_ext_lossofsales_tooltip",
            classed="sap_viz_ext_lossofsales_left",
            x=10,
            y=10,
            position=[x,y],
            disp="none";

            function tooltip() {
                // generate tooltip here, using `width` and `height`
                var  tt=d3.select("body").append("div").attr("id","sap_viz_ext_lossofsales_t-tip").style("display",disp);
                var tooltip=tt.append("div").attr("class","sap_viz_ext_lossofsales_tt-inner").style("text-align","left");
                
                    tooltip.append("div").attr("id","sap_viz_ext_lossofsales_triangle").attr("class",classed);
                    tooltip.append("div").attr("id","sap_viz_ext_lossofsales_tt-body");


                tooltip.visibility=function(value){
                    //if (!arguments.length) return html;
                    d3.selectAll("#sap_viz_ext_lossofsales_t-tip").style("display",value);
                }

                tooltip.orientation=function(value)        {
                    //if (!arguments.length) return html;
                    d3.selectAll("#sap_viz_ext_lossofsales_t-tip #sap_viz_ext_lossofsales_triangle").attr("class",value);
                }

                tooltip.move=function(value) {

                    d3.selectAll("#sap_viz_ext_lossofsales_t-tip").style("top",value[0]).style("left",value[1]);
                };

                tooltip.fillData=function(value) {

                    d3.selectAll("#sap_viz_ext_lossofsales_t-tip #sap_viz_ext_lossofsales_tt-body").html(value);
                };

                tooltip.getData=function() {
                    return(d3.selectAll("#sap_viz_ext_lossofsales_t-tip #sap_viz_ext_lossofsales_tt-body").html());
                };
                return tooltip;
            }


            tooltipDefine.width = function(value) {
                if (!arguments.length) 
                    return width;
                width = value;
                return tooltip;
            };

            tooltipDefine.height = function(value) {
                if (!arguments.length) 
                    return height;
                height = value;
                return tooltip;
            };

            return tooltip;
        } 

    /**
    * It returns dimensions of the tooltip which to be rendered on 'mouseover' event.
    */
        function tooltipDimension() {
            
            var tt_width = 180;
            var tt_height = 20*4;      //lineheight inside tooltip = 20px;
            
            var tt_dim = [tt_width, tt_height];
            return (tt_dim);
        }    

    /**
    * It is the formatter function; formats the center values of the rectObjects in column chart if the values are too large to print.
    * @param {Object} d - data set is passed in
    */
        function textFormatter (value) {
            if (value >= 10000){
                if (value >= 1000000){
                    if (value >= 1000000000){
                        if(value >= 1000000000000){
                            if(value >= 1000000000000000){
                                return value/1000000000000000 + "P";        
                            }
                            return value/1000000000000 + "T";
                        }
                        return value/1000000000 + "B";
                    }
                    return value/1000000 + "M";
                }

                return value/1000 + "K";
            }
            return value;
        }


    /**
    * It is a calculation function which returns the maximum value in stock dataset.
    * @param {Object} data - data set passed in
    */
        function maxOfStock (data) {
            var max = 0;
            for(i=0 ; i<data.length ; i++) {                                                            
                if(parseInt(data[i].forecastedStock) > max)
                    max = parseInt(data[i].forecastedStock);
            }
            return (max);
        }


    /**
    * It is a calculation function which returns the maximum value in sales revenue dataset.
    * @param {Object} data - data set passed in
    */
        function maxOfSales (data) {
            var max = 0;
            for(i=0 ; i<data.length ; i++) {                                                            
                if(parseInt(data[i].forecastedSale) > max)
                    max = parseInt(data[i].forecastedSale);
            }
            return (max);
        }


    /**
    * It is a drawing function which appends the legend symbol of 'shopping bag' on a given _selection.
    * @param {Object} _selection - block to which legend is to be appended
    * @param {float} tLeft - position of the legend from left side
    * @param {float} tTop - position of the legend from top
    * @param {float} side - default side length of the legend
    */
        function symbolBag (selection, tLeft, tTop, side) {
            var color = "#008AD6";
            var lineFunction = d3.svg.line()
                                        .x(function(d) { return d.x; })
                                        .y(function(d) { return d.y; })
                                        .interpolate("linear");
                                          
            if (side < 30){
                side = 30;
            }
            var padding = (.05 * side);  
          
            
            var bag = selection.append("g")
                                        .attr("class", "sap_viz_ext_lossofsales_stockSymbol")
                                        .attr("transform","translate(" + tLeft +", " + tTop + ")");

            bag.append("rect")
                            .attr("x",0)
                            .attr("y",0)
                            .attr("width",side)
                            .attr("height",side)
                            .attr("fill","#dadada");

            bag.append("rect")
                            .attr("x",padding)
                            .attr("y",padding)
                            .attr("width",(.5 * side))
                            .attr("height",(.35 * side))
                            .attr("fill",color);

            bag.append("rect")
                            .attr("x",padding + (.5 * side) + padding)
                            .attr("y",padding)
                            .attr("width",(.35 * side))
                            .attr("height",(.35 * side))
                            .attr("fill",color);

            bag.append("rect")
                            .attr("x",padding)
                            .attr("y",padding + (.35 * side) + padding)
                            .attr("width",(.5 * side))
                            .attr("height",(.5 * side))
                            .attr("fill",color);

            bag.append("rect")
                            .attr("x",padding + (.5 * side) + padding)
                            .attr("y",padding + (.35 * side) + padding)
                            .attr("width",(.35 * side))
                            .attr("height",(.5 * side))
                            .attr("fill",color);


            bag.append("path")
            .attr("d", function(d,i){
                var xval=0,yval=0;
                var dataSet = [ {x:xval,y:yval} ];
                var inc = 1;
                for(var j = xval ; j < xval+side && xval+(3*inc)<xval+side; j=j+6){
                    dataSet.push({x:xval+(3*inc),y:yval-2});
                    inc = inc+1;
                    dataSet.push({x:xval+(3*inc),y:yval});
                    inc = inc+1;
                }
                pathPoints =lineFunction(dataSet);
                return pathPoints;
            })
            .attr("fill", "#dadada");

            var r = side/4  ;
            var p = Math.PI;

            var arc = d3.svg.arc()
                            .innerRadius(r-3)
                            .outerRadius(r)
                            .startAngle((p/2))
                            .endAngle(-p+(p/2));

            bag.append("path")
                            .attr("d",arc)
                            .attr("fill","#dadada")
                            .attr("transform", function(d,i){
                                return "translate("+(side)/2 + "," + "0)";
                            });
            return (bag);
        }


    /**
    * It is a drawing function which appends the dollar symbol of 'dollar bill' on a given _selection.
    * @param {Object} _selection - block to which legend is to be appended
    * @param {float} tLeft - position of the legend from left side
    * @param {float} tTop - position of the legend from top
    * @param {float} side - default side length of the legend
    */
        function symbolDollar (selection, tLeft, tTop, side) {
            var leftMargin = 140;
            var rightMargin = 25;
            var rect = selection.append('g')
                                        .attr("class", "sap_viz_ext_lossofsales_dollar")
                                        .attr("transform","translate(" + tLeft +", " + tTop + ")");

            if(side < 30)
                side = 30;
            
            var height = .6 * side;
            var padding = .071 * side;
            rect.append("rect")
                            .attr("x",0)
                            .attr("y",0)
                            .attr("width",side)
                            .attr("height",height)
                            .attr("fill","#ff5151");

            rect.append("rect")
                            .attr("x",padding)
                            .attr("y",padding)
                            .attr("width",side - 2*padding)
                            .attr("height",height - 2*padding)
                            .attr("fill","white");
            rect.append("rect")
                            .attr("x",2*padding)
                            .attr("y",2*padding)
                            .attr("width",side - 4*padding)
                            .attr("height",height - 4*padding)
                            .attr("fill","#ff5151");

            var radius = (height - 2*padding)/2;
            rect.append("circle")
                            .attr("cx",side/2)
                            .attr("cy",height/2)
                            .attr("r",radius)
                            .attr("stroke","none")
                            .attr("fill","white");
            rect.append("text")
                            .text("$")
                            .attr("x",side/2)
                            .attr("y",height/2 + radius - padding)
                            .attr("font-size", function(d){
                                        return (3*(radius-padding));
                            })
                            .attr("class","sap_viz_ext_lossofsales_currencySymbol");
            return (rect);
        }
		
		
	};

	return render;
});