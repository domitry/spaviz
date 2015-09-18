/*global require, module, _, d3*/

module.exports = {
    dbpedia: {
        mode: "ordinal",
        uri: "http://dbpedia.org/sparql"
    },
    "dbpedia-jp": {
        mode: "bif",
        uri: "http://ja.dbpedia.org/sparql"
    },
    "nibb": {
        mode: "bif",
        uri: "http://sparql.nibb.ac.jp/sparql"
    }
};
