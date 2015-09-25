/*global require, module, _, d3*/

module.exports = {
    "nibb": {
        mode: "bif",
        uri: "http://sparql.nibb.ac.jp/sparql"
    },
    "uniprot": {
        mode: "bif",
        uri: "http://sparql.uniprot.org/sparql"
    },
    dbpedia: {
        mode: "ordinal",
        uri: "http://dbpedia.org/sparql"
    },
    "dbpedia-jp": {
        mode: "bif",
        uri: "http://ja.dbpedia.org/sparql"
    },
    "biomodels": {
	mode: "ordinal",
	uri: "https://www.ebi.ac.uk/rdf/services/biomodels/sparql"
    }
};
