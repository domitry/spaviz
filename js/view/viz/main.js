/*global require, module, _, d3*/

module.exports = function(config){
    d3.select("#viz").style("display", "block");
    var util = require("../../util.js");

    var uri = (function(){
        var selected = d3.select("#endpoints")[0][0].value;
        return require("../../endpoints.js")[selected];
    })();
    
    var compiled = (function(){
        var code = require("../../sparqls/construct_graph.js");
        var typename = d3.select("#categories")[0][0].value;

        return _.template(code)({
            typename: "<" + typename + ">",
            offset: 0,
            number: 3
        });
    })();

    util.sendQuery(uri, compiled, function(err, arr){
        _.each(arr, function(obj){
        });
    });
};
