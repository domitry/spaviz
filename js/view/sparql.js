/*global require, module, _, d3, Promise*/
var util = require("../util.js");

module.exports = {
    init: function(config){
        this.config = config;
        
	if(_.isUndefined(config.center_urls)){
	    var word = config.word;
	    var mode = config.search_mode;
	    
	    return new Promise(function(resolve, reject){
		Promise.all(_.map(config.end_points, function(name){
		    var ep = require("../endpoints.js")[name];
		    return this.search(ep.uri, ep.mode, word, mode);
		}.bind(this))).then(function(urls){
		    this.config.center_urls = urls;
		    this.init_nodes();
		    resolve();
		}.bind(this));
	    }.bind(this));
	}else{
	    return new Promise(function(resolve, reject){
		this.init_nodes();
		resolve();
	    }.bind(this));
	}
    },
    init_nodes: function(){
        var code = require("../sparqls/construct_graph.js");
	var n = this.config.center_urls.length;
	var d_x = window.innerWidth/n;
	var offset = d_x/2;

	_.each(this.config.center_urls, function(urls, i){
	    var url = urls.url;
	    var end_point_url = urls.end_point_url;
            this.exec(end_point_url, code, {
		typename: "<" + url + ">",
		offset: 0,
		number: 1
            }, function(err, arr){
		var center = arr[0];
		var center_node_uri = center.sample_uri;
		
		this.config.nodes.push({
                    display_name: util.getLastWordOfURI(center_node_uri),
                    uri: center_node_uri,
                    name: util.getLastWordOfURI(center_node_uri),
                    x: Math.floor(offset+d_x*i),
                    y: Math.floor(window.innerHeight/2 + (Math.random()-0.5)*window.innerHeight/3),
                    unfolded: true,
		    end_point: end_point_url
		});
		
		this.unfold(end_point_url, this.config.nodes[0], 10, function(){
                    this.config.graph.update();
                    this.config.force.start();
		    window.start = this.config.force.start;
		}.bind(this));
		
            }.bind(this));
	}.bind(this));
    },
    search: function(end_point, end_point_mode, word, mode){
	return new Promise(function(resolve, reject){
	    switch(mode){
	    case "type":
		var code = (end_point_mode == "bif" 
			    ? require("../sparqls/search_bif.js")
			    : require("../sparqls/search.js"));
		
		this.exec(end_point, code, {
		    keyword: "\"" + this.config.keyword + "\""
		}, function(err, arr){
		    var target_url = arr[0].c;
		    resolve({
			url: target_url,
			end_point_url: end_point
		    });
		});
		break;
	    case "immediate":
	    default:
		alert("Not Implemented.");
		break;
	    }
	}.bind(this));
    },
    exec: function(end_point, code, args, callback){
        var compiled = _.template(code)(args);
        util.sendQuery(end_point, compiled, callback);
    },
    unfold: function(end_point, center, limit, callback){
        var code = require("../sparqls/res_obj.js");
        var nodes = this.config.nodes;
        var links = this.config.links;
        var center_node_uri = center.uri;
        var force = this.config.force;
        center.unfolded = true;
        
        this.exec(end_point, require("../sparqls/res_obj.js"), {
            nodename: "<" + center_node_uri + ">"
        }, function(err, arr){
            if(arr.length > limit){
                var more = arr.slice(limit, arr.length);
                arr = arr.slice(0, limit);
                arr.push({obj_label: "", obj: "more", res_label: "", res: "_"});
            }

            var d_theta = (2*Math.PI)/arr.length;
            
            _.each(arr, function(row, i){
                var node = {
                    display_name: (row.obj_label == "" ? util.getLastWordOfURI(row.obj) : row.obj_label),
                    name: row.obj_label,
                    uri: row.obj,
                    x: Math.floor(center.x+100*Math.cos(i*d_theta)),
                    y: Math.floor(center.y+100*Math.sin(i*d_theta)),
                    unfolded: false,
		    end_point: end_point
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

    }
};
