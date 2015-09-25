/*global require, module, _, d3*/

function appendButton(parent, str, callback){
    var svg = parent.append("svg")
        .attr({
            width: 150,
            height: 150
        });
    svg.append("circle")
        .attr({
            cx: 75,
            cy: 75,
            r: 72,
            fill: "#0B486B",
            "stroke-width": 4,
            stroke: "#000"
        })
        .style("cursor", "pointer")
        .on("mouseup", callback);

    svg.append("text")
        .attr({
            x: 75,
            y: 75,
            "text-anchor": "middle",
            "dominant-baseline": "middle",
            "font-size": 30
        })
        .style("cursor", "pointer")
        .on("mouseup", callback)
        .text(str);
    return svg;
}

module.exports = {
    begin: function(){
        //// set options of selector ////
        var endpoints = require("../../endpoints.js");
        _.each(endpoints, function(obj, name){
            d3.select("#endpoints")
                .append("option")
                .attr("value", name)
                .text(name);
        });
        
        //// set background here ////
        (function(){
            var svg = d3.select("#st_bg").select("svg");
            var force = d3.layout.force()
                    .charge(400)
                    .linkDistance(500)
                    .size([600, 600]);

            var nodes = [{x: 600, y: 0},
                         {x: 0, y: 300},
                         {x: 350, y: 150}];
            
            var links = [{
                source: 0,
                target: 1
            },{
                source: 1,
                target: 2
            },{
                source: 2,
                target: 0
            }];

            force
                .nodes(nodes)
                .links(links)
                .start();

            var link = svg.selectAll(".link")
                    .data(links)
                    .enter()
                    .append("line")
                    .attr({
                        "class":"link",
                        "stroke": "#79BD9A"
                    })
                    .style({
                        "stroke-width": 1
                    });

            var node = svg.selectAll(".node")
                    .data(nodes)
                    .enter()
                    .append("circle")
                    .attr("class", "node")
                    .attr("r", 30)
                    .style("fill", "rgb(168,219,168)");

            force.on("tick", function() {
                link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                node.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
            });
        })();

        //// set buttons ////
        (function(){
            var switchPhase = function(appear, disappear){
                disappear.style("display", "none");
                appear.style("display", "block");
            };

            appendButton(d3.select("#phase1"), "START", function(){
                switchPhase(d3.select("#phase2"), d3.select("#phase1"));
            });

            appendButton(d3.select("#phase2"), "BACK", function(){
                switchPhase(d3.select("#phase1"), d3.select("#phase2"));
            });

            appendButton(d3.select("#phase2"), "NEXT", function(){
                var util = require("../../util.js");
                var keyword = d3.select("#keyword_box")[0][0].value;
                var selected = d3.select("#endpoints")[0][0].value;
                var uri = endpoints[selected].uri;

                var code = (function(){
                    if(endpoints[selected].mode == "bif"){
                        return require("../../sparqls/search_bif.js");
                    }else{
                        return require("../../sparqls/search.js");
                    }
                })();

                var compiled = _.template(code)({keyword: "\"" + keyword + "\""});
                
                util.sendQuery(uri, compiled, function(err, arr){
                    if(err){
                        switchPhase(d3.select("#error"), d3.select("#loading"));
                    }else{
                        switchPhase(d3.select("#phase3"), d3.select("#loading"));
                        d3.select("#categories").selectAll("*").remove();
                        _.each(arr, function(obj){
                            d3.select("#categories")
                                .append("option")
                                .attr("value", obj.c)
                                .text(obj.c);
                        });
                    }
                });
                
                switchPhase(d3.select("#loading"), d3.select("#phase2"));
            });
            
            appendButton(d3.select("#loading"), "BACK", function(){
                switchPhase(d3.select("#phase2"), d3.select("#loading"));
            });

            appendButton(d3.select("#phase3"), "BACK", function(){
                switchPhase(d3.select("#phase2"), d3.select("#phase3"));
            });

            appendButton(d3.select("#error"), "BACK", function(){
                switchPhase(d3.select("#phase2"), d3.select("#error"));
            });

            appendButton(d3.select("#phase3"), "NEXT", function(){
                var selected = d3.select("#categories")[0][0].value;
                d3.select("#start").style("display", "none");
                require("../viz/init.js")();
            });
        })();
    }
};
