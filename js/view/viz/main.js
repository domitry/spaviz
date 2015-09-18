/*global require, module, _, d3*/

module.exports = function(config){
    d3.select("#viz").style("display", "block");
    var util = require("../../util.js");
    var svg = d3.select("#viz").select("svg");
    var parent_g = svg.append("g");
    var zoom = d3.behavior.zoom()
            .scaleExtent([0.1, 10])
            .on("zoom", zoomed);

    parent_g.call(zoom);

    parent_g.append("rect")
        .attr({
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight,
            fill: "none"
        })
        .style("pointer-events", "all");

    var g = parent_g.append("g");

    function zoomed(){
        g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    var uri = (function(){
        var selected = d3.select("#endpoints")[0][0].value;
        return require("../../endpoints.js")[selected].uri;
    })();
    
    var compiled = (function(){
        var code = require("../../sparqls/construct_graph.js");
        var typename = d3.select("#categories")[0][0].value;

        return _.template(code)({
            typename: "<" + typename + ">",
            offset: 0,
            number: 1
        });
    })();

    // Pick the first query whose rdf:type is the specified one
    util.sendQuery(uri, compiled, function(err, arr){
        _.each(arr, function(obj){
            addProperties(obj.sample_uri);
        });
    });

    // data: {hoge: function(){}, nya: function(){},...}
    function createMenu(pos, data){
        var root = svg.append("g");
        var y = 0, x = 0;
        _.each(data, function(callback, name){
            root
                .append("g")
                .on("mousedown", function(){
                    callback();
                    root.remove();
                })
                .append("rect")
                .attr({
                    x: x,
                    y: y,
                    width: 300,
                    height: 25,
                    fill: "#636363",
                    stroke: "#000",
                    "stroke-width": 2
                });

            root.append("text")
                .attr({
                    x: 150,
                    y: y+12.5,
                    "text-anchor": "middle",
                    "dominant-baseline": "middle",
                    "font-size": 15,
                    fill: "white"
                })
                .text(name);
            y+=25;
        });

        root.attr("transform", function(){
            return " translate(" + pos[0] + "," + pos[1]  + ")";
        });

        root.on("mouseleave", function(){
            root.remove();
        });
    }

    var path4query = [];
    function addNode2Path(node){
        path4query.push(node);
        console.log(path4query);
        var text = _.map(path4query, function(node){
            return node.name;
        }).join(" > ");
        d3.select("#viz_footer_text").text(text);
    }
    
    // Add circles around the specified node
    function addProperties(center){
        var code = require("../../sparqls/res_obj.js");
        var nodes, center_node_uri;
        
        if(typeof center == "object"){
            center_node_uri = center.uri;
            nodes = [];
        }else if(typeof center == "string"){
            center_node_uri = center;
            center = {
                uri: center_node_uri,
                name: util.getLastWordOfURI(center_node_uri),
                x: window.innerWidth/2,
                y: window.innerHeight/2,
                deployed: true,
                origin: true
            };
            nodes = [center];
            ///// dirty.
            addNode2Path(center);
        }

        var compiled = _.template(code)({
            nodename: "<" + center_node_uri + ">"
        });

        util.sendQuery(uri, compiled, function(err, arr){
            var links = [];
            var d_theta = (2*Math.PI)/arr.length;
            
            _.each(arr, function(row, i){
                var node = {
                    name: (row.obj_label == "" ? util.getLastWordOfURI(row.obj) : row.obj_label),
                    uri: row.obj,
                    x: center.x+100*Math.cos(i*d_theta),
                    y: center.y+100*Math.sin(i*d_theta),
                    deployed: false
                };
                nodes.push(node);
                links.push({
                    source: center,
                    target: node,
                    uri: row.res,
                    name: row.res_label
                });
            });
            
            addNodes(nodes, links);
        });
    }

    var force = d3.layout.force()
            .charge(-800)
            .linkDistance(300)
            .gravity(0.0)
            .size([window.innerWidth, window.innerHeight]);

    function addNodes(n_nodes, n_links){
        var nodes = force.nodes().concat(n_nodes);
        force.nodes(nodes);
        var links = force.links().concat(n_links);
        force.links(links);

        console.log(nodes);

        var link = g.selectAll(".link")
                .data(links)
                .enter()
                .append("g")
                .attr("class", "link");

        link.append("line")
            .attr("stroke","#000")
            .attr("stroke-width",3);

        var rect = link.append("rect");

        link.append("text")
            .attr({
                "text-anchor": "middle",
                "dominant-baseline": "middle",
                "font-size": 15
            })
            .text(function(d){
                if(d.name=="")return util.getLastWordOfURI(d.uri);
                else return d.name;
            });

        rect.attr({
            width: function(d){
                var parent = d3.select(this.parentNode);
                var bbox = parent.select("text").node().getBBox();
                return bbox.width + 20;
            },
            height: function(d){
                var parent = d3.select(this.parentNode);
                var bbox = parent.select("text").node().getBBox();
                return bbox.height + 20;
            },
            stroke: "#000",
            "stroke-width": 3,
            fill: "#fff"
        });
        
        var node = g
                .selectAll(".node")
                .data(nodes)
                .enter()
                .append("g")
                .attr("class", "node");
        
        node.append("circle")
            .attr({
                "stroke": "#000",
                "stroke-width": 3,
                "r": 70,
                "cx": 0,
                "cy": 0,
                "fill": function(d){
                    if(d.origin)return "#de2d26";
                    return "rgb(168,219,168)";
                }
            })
            .on("mouseover", function(){
                var node = d3.select(this);
                var col = node.attr("fill");
                node.attr("fill", d3.rgb(col).darker())
                    .attr("original_color", col);
            })
            .on("mouseout", function(){
                var node = d3.select(this);
                node.attr("fill", node.attr("original_color"));
            })
            .on("mousedown", function(d){
                if(!d.deployed){
                    d.deployed = true;
                    addProperties(d);
                }
            })
            .on("contextmenu", function(){
                var pos = d3.mouse(document.body);
                var selection = d3.select(this);
                
                createMenu(pos, {
                    "Mark as an intermidiate point": function(){
                        selection.attr("fill", "#fc9272");
                        addNode2Path(selection.data()[0]);
                    },
                    "New END POINT": function(){
                        console.log("nya");
                    }
                });
                d3.event.preventDefault();
            });

        node.append("text")
            .attr({
                "text-anchor": "middle",
                "dominant-baseline": "middle",
                "font-size": 15,
                "x": 0,
                "y": 0
            })
            .text(function(d){
                return d.name;
            });
        
        force.on("tick", function() {
            g.selectAll(".link")
                .selectAll("line")
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            g.selectAll(".link")
                .selectAll("text")
                .attr({
                    "x": function(d){return (d.source.x + d.target.x)/2;},
                    "y": function(d){return (d.source.y + d.target.y)/2;}
                });

            g.selectAll(".link")
                .selectAll("rect")
                .attr({
                    "x": function(d){
                        var x = (d.source.x + d.target.x)/2;
                        var width = d3.select(this).attr("width");
                        return x-width/2;
                    },
                    "y": function(d){
                        var y = (d.source.y + d.target.y)/2;
                        var height = d3.select(this).attr("height");
                        return y-height/2;
                    }
                });

            g.selectAll(".node")
                .attr("transform", function(d){
                    return "translate(" + d.x + "," + d.y + ")";
                });
        });

        d3.select("#deploy_button")
            .on("mouseover", function(){
                d3.select(this).style("background-color", "#d9d9d9");
            })
            .on("mouseleave", function(){
                d3.select(this).style("background-color", "#f7f7f7");
            })
            .on("mousedown", function(){
                var code = require("../../sparqls/fetch.js");
                var typename = "<" + d3.select("#categories")[0][0].value + ">";
                
                var links = force.links();

                var pairs = (function(){
                    var arr = [];
                    for(var i=0; i<path4query.length-1; i++)
                        arr.push([path4query[i], path4query[i+1]]);
                    return arr;
                })();

                var alphabet = "a".charCodeAt(0);
                var orders = _.map(pairs, function(pair){
                    var prev=pair[0], curr=pair[1];
                    var l = _.select(links, function(link){
                        return (link.source == prev && link.target == curr);
                    })[0];
                    
                    var var0 = "?" + String.fromCharCode(alphabet);
                    var var1 = "?" + String.fromCharCode(alphabet+1);

                    alphabet++;
                    return [var0, "<" + l.uri + ">" , var1].join(" ");
                });
                
                var queries = orders.join(".\n");
                var last_alphabet = "?" + String.fromCharCode(alphabet);

                var compiled = _.template(code)({
                    last_alphabet: last_alphabet,
                    queries: queries,
                    typename: typename
                });
                
                util.sendQuery(uri, compiled, function(err, arr){
                    var text = JSON.stringify(arr);
                    var blob = new window.Blob([text], {type: "text/plain"});
                    var a=document.createElement("a");
                    a.href=window.URL.createObjectURL(blob);
                    a.target = "_blank";
                    a.download='output.json';
                    a.click();
                });
            });
        force.start();
    }
};
