/*global require, module, _, d3*/
var util = require("../../util.js");

///////////////////////////////////////////////////////////////////////
// Colors module
//   Control the style of all nodes and links.
//
///////////////////////////////////////////////////////////////////////

module.exports = {
    init: function(config){
        this.config = config;
        return this;
    },
    update: function(new_nodes, new_links){
        this.updateNodes(new_nodes);
        this.updateLinks(new_links);
    },
    updateNodes: function(new_nodes){
        new_nodes
            .selectAll("circle")
            .attr({
                fill: "rgb(168,219,168)",
                stroke: "#000",
                "stroke-width": 3
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
            });

        new_nodes
            .selectAll("text")
            .attr({
                "text-anchor": "middle",
                "dominant-baseline": "middle",
                "font-size": 15
            });
    },
    updateLinks: function(new_links){
        new_links
            .selectAll("text")
            .attr({
                "text-anchor": "middle",
                "dominant-baseline": "middle",
                "font-size": 15,
                fill: "#000"
            });
        
        new_links
            .selectAll("line")
            .attr({
                stroke:"#000",
                "stroke-width":3
            });

        new_links
            .selectAll("rect")
            .attr({
                stroke: "#000",
                "stroke-width": 3,
                fill: "#fff"
            });
    }
};
