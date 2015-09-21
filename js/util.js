/*global require, module, _, d3*/

module.exports = {
    sendQuery: function(endpoint, code, callback, options){
        options = _.extend({
            query: code,
            timeout: 30000,
            format: "csv"
        }, options);

        var url = endpoint + "?" + _.map(options, function(val, key){
            var encoded = encodeURIComponent(val);
            var replaced = encoded.replace(/%20/g, "+");
            return key + "=" + replaced;
        }).join("&");

        console.log("code", code);
        console.log("uri", endpoint);

        d3.csv(url, callback);
    },
    getLastWordOfURI: function(uri){
        var arr = uri.split("\/");
        return arr[arr.length-1];
    },
    isURI: function(str){
        if(str.match(/http/g) != null)return true;
        else return false;
    },
    // data: {hoge: function(){}, nya: function(){},...}
    createMenu: function(parent, pos, data){
        var root = parent.append("g");
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
};
