/*global require, module, _, d3*/

///////////////////////////////////////////////////////////////////////
// Graph module
//   Construct html nodes and links from config.nodes and confg.links.
//   They are colored using "Colors" module.
//     init: initialize module
//     update: update nodes from configuratio object
///////////////////////////////////////////////////////////////////////

module.exports = {
    init: function(config){
        this.config = config;
        
        (function(){
            //// rules when updating links and nodes
            var g = this.config.float_g;
            
            this.config.force.on("tick", function() {
                g.selectAll(".link")
                    .selectAll("line")
                    .attr("dx_", function(d){ return d.target.x - d.source.x;})
                    .attr("dy_", function(d){ return d.target.y - d.source.y;})
                    .attr("len", function(d){
                        var s = d3.select(this);
                        return Math.sqrt(Math.pow(s.attr("dx_"),2) + Math.pow(s.attr("dy_"),2));
                    })
                    .attr("udx_", function(d){
                        var s = d3.select(this);
                        return s.attr("dx_")/s.attr("len");
                    })
                    .attr("udy_", function(d){
                        var s = d3.select(this);
                        return s.attr("dy_")/s.attr("len");
                    })
                    .attr("x1", function(d) {
                        return d.source.x + 70*d3.select(this).attr("udx_");
                    })
                    .attr("y1", function(d) {
                        return d.source.y + 70*d3.select(this).attr("udy_");
                    })
                    .attr("x2", function(d) {
                        return d.target.x - 70*d3.select(this).attr("udx_");
                    })
                    .attr("y2", function(d) {
                        return d.target.y - 70*d3.select(this).attr("udy_");
                    })
                    .attr("marker-end", "url(#arrow)");
                
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
        }.bind(this))();

        return this;
    },
    add: function(){
    },
    update: function(){
        var g = this.config.float_g;
        
        var links = (function(){
            // links :
            // root_g -+
            //         +-g(.link)
            //           +--line
            //           +--rect
            //           +--text
            //
            var link = g.selectAll(".link")
                    .data(this.config.links)
                    .enter()
                    .append("g")
                    .attr("class", "link");
            
            link.append("line");

            var rect = link.append("rect");
            
            link.append("text")
                .text(function(d){return d.display_name;});
            
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
                }
            });

            return link;
        }.bind(this))();

        var nodes = (function(){
            // nodes :
            // root_g -+
            //         +-g(.node)
            //           +--circle
            //           +--text
            //
            var node = g
                    .selectAll(".node")
                    .data(this.config.nodes)
                    .enter()
                    .append("g")
                    .attr("class", "node");

            var sparql_module = this.config.sparqls;
            var graph_module = this;
            
            node.append("circle")
                .attr({r: 70, cx: 0, cy: 0})
                .on("mousedown", function(d){
                    sparql_module.unfold(d, 10, function(){
                        graph_module.update();
                    });
                })
                .on("contextmenu", function(){
                    var pos = d3.mouse(document.body);
                    var selection = d3.select(this);
                    d3.event.preventDefault();
                });
            
            node.append("text")
                .attr({x: 0, y: 0})
                .text(function(d){return d.display_name;});

            return node;
        }.bind(this))();

        this.config.colors.update(nodes, links);
        this.config.force.start();
    }
};
