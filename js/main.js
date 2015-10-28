/*global require, module, _, d3*/
var init_viz = require("./view/init.js");
var init_form = require("./init_form.js");

window.onload = function(){
    var search = window.location.search;
    search = search.slice(1, search.length);

    if(search == ""){
	// show a simple visualization on the background
	var default_config = {
	    end_points: ["dbpedia"],
	    word: "Protein",
	    center_urls: [
		{url: "http://dbpedia.org/class/yago/Proteins",
		 end_point_url: "http://dbpedia.org/sparql"}
	    ]
	};
	
	init_viz(default_config);
	init_form();
    }else{
	var queries = _.reduce(search.split("&"), function(memo, word){
	    var kv = word.split("=");
	    memo[kv[0]] = kv[1];
	    return memo;
	}, {});

	init_viz({
	    end_points: ["dbpedia"],
	    keyword: queries.keyword,
	    search_mode: "type"
	});
	
	switch(queries.mode){
	    case "search":
	    break;
	    case "tutorial":
	    break;
	    default:
	    d3.select("body")
		.append("h1")
		.text("Error: Invalid mode");
	    d3.select("body")
		.append("p")
		.text("Check if the url is valid.");
	}
    }
};
