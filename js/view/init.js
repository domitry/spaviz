/*global require, module, _, d3*/
var util = require("../util.js");

module.exports = function(config_){
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
    force.stop();

    var config = {
        end_points: config_.end_points,
	center_urls: config_.center_urls,
	keyword: config_.keyword,
	search_mode: config_.search_mode,
        float_g: float_g,
        force: force,
        nodes: [],
        links: []
    };
    
    _.extend(config, {
        graph: require("./graph.js"),
        sparqls: require("./sparql.js"),
        colors: require("./colors.js")
        //ui: require("./ui.js")
    });

    config.graph.init(config);
    config.sparqls.init(config).then(function(){
	//config.graph.update();
	//config.force.start();
	config.colors.init(config);
	force.nodes(config.nodes);
	force.links(config.links);
    });
};
