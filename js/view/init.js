/*global require, module, _, d3*/
var util = require("../../util.js");

module.exports = function(){
    // initialize #viz
    d3.select("#viz").style("display", "block");
    
    var svg = d3.select("#viz").select("svg");
    var float_g = (function(){
        var root_g = svg.append("g");

        var zoom = d3.behavior.zoom()
                .scaleExtent([0.1, 10])
                .on("zoom", zoomed);
        
        // define the arrow mark
        svg.append("defs").append("marker")
            .attr({
                id: "arrow",
                viewBox: '0 0 10 10',
                refX: 8,
                refY: 5,
                markerWidth: 8,
                markerHeight: 8,
                orient: "auto"
            })
            .append('path')
            .attr({
                d: 'M10 5 0 0 0 10Z',
                stroke: 'none',
                fill: 'black'
            });
        
        root_g.call(zoom);
        
        // dammy rectanble for zooming and panning
        var dammy_rect = root_g.append("rect")
                .attr({
                    x: 0,
                    y: 0,
                    width: window.innerWidth,
                    height: window.innerHeight,
                    fill: "none"
                })
                .style("pointer-events", "all");

        d3.select(window).on("resize", function(){
            dammy_rect.attr({
                width: window.innerWidth,
                height: window.innerHeight
            });
        });

        var float_g = root_g.append("g");
        
        function zoomed(){
            float_g
                .attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        return float_g;
    })();

    var force = d3.layout.force()
            .charge(-800)
            .linkDistance(300)
            .gravity(0.0)
            .size([window.innerWidth, window.innerHeight]);

    var config = {
        end_point: (function(){
            var selected = d3.select("#endpoints")[0][0].value;
            return require("../../endpoints.js")[selected].uri;
        })(),
        typename: d3.select("#categories")[0][0].value,
        float_g: float_g,
        force: force,
        nodes: [],
        links: []
    };
    
    _.extend(config, {
        graph: require("./graph.js").init(config),
        sparqls: require("./sparql.js").init(config),
        colors: require("./colors.js").init(config)
        //ui: require("./ui.js").init(config)
    });

    force.nodes(config.nodes);
    force.links(config.links);
};
