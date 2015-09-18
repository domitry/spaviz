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
    }
};
