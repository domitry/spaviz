/*global require, module, _, d3*/
var init = require("./view/init.js");

window.onload = function(){
    // show a sample visualization as the background animation
    var default_config = {
	end_point: "http://dbpedia.org/sparql",
	typename: "http://dbpedia.org/class/yago/Proteins"
    };

    init(default_config);
};
