/*global require, module, _, d3*/
var util = require("../util.js");

module.exports = {
    init: function(config){
        this.config = config;
        var code = require("../sparqls/construct_graph.js");
        
        this.exec(this.config.end_point, code, {
            typename: "<" + this.config.typename + ">",
            offset: 0,
            number: 1
        }, function(err, arr){
            var center = arr[0];
            var center_node_uri = center.sample_uri;
            
            this.config.nodes.push({
                display_name: util.getLastWordOfURI(center_node_uri),
                uri: center_node_uri,
                name: util.getLastWordOfURI(center_node_uri),
                x: window.innerWidth/2,
                y: window.innerHeight/2,
                unfolded: true
            });
            
            this.unfold(this.config.nodes[0], 10, function(){
                this.config.graph.update();
                this.config.force.start();
            }.bind(this));
            
        }.bind(this));
        
        return this;
    },
    exec: function(uri, code, args, callback){
        var compiled = _.template(code)(args);
        util.sendQuery(uri, compiled, callback);
    },
    unfold: function(center, limit, callback){
        var code = require("../sparqls/res_obj.js");
        var nodes = this.config.nodes;
        var links = this.config.links;
        var center_node_uri = center.uri;
        var force = this.config.force;
        center.unfolded = true;
        
        this.exec(this.config.end_point, require("../sparqls/res_obj.js"), {
            nodename: "<" + center_node_uri + ">"
        }, function(err, arr){
            var d_theta = (2*Math.PI)/arr.length;

            if(arr.length > limit){
                var more = arr.slice(limit, arr.length);
                arr = arr.slice(0, limit);
                arr.push({obj_label: "", obj: "more", res_label: "", res: "_"});
            }
            
            _.each(arr, function(row, i){
                var node = {
                    display_name: (row.obj_label == "" ? util.getLastWordOfURI(row.obj) : row.obj_label),
                    name: row.obj_label,
                    uri: row.obj,
                    x: center.x+100*Math.cos(i*d_theta),
                    y: center.y+100*Math.sin(i*d_theta),
                    unfolded: false
                };

                var link = {
                    display_name: (row.res_label == "" ? util.getLastWordOfURI(row.res) : row.res_label),
                    name: row.res_label,
                    uri: row.res,
                    source: center,
                    target: node
                };

                _.each([node, link], function(obj){
                    if(obj.display_name.length > 10)
                        obj.display_name = obj.display_name.slice(0, 10) + "...";
                });

                nodes.push(node);
                links.push(link);
            });

            if(typeof callback != "undefined")
                callback();
        });

    },
    fetch: function(){
        /*
        d3.select("#deploy_button")
            .on("mouseover", function(){
                d3.select(this).style("background-color", "#d9d9d9");
            })
            .on("mouseleave", function(){
                d3.select(this).style("background-color", "#f7f7f7");
            })
            .on("mousedown", function(){
                var code = require("../sparqls/fetch.js");
                var typename = "<" + d3.select("#categories")[0][0].value + ">";
                
                var links = this.config.force.links();
                
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
         */
    }
};
