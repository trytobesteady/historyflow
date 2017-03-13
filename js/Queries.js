var Queries = (function() {
    var exports = {};

    exports.settlements = `
    SELECT ?label ?coord ?year
    WHERE
    {
      ?subj wdt:P31 wd:Q486972 .
      ?subj wdt:P625 ?coord .
      ?subj wdt:P571 ?year .
      ?subj rdfs:label ?label filter (lang(?label) = "en")
    }
    `;

    exports.archsites = `
    SELECT ?label ?coord ?year
    WHERE
    {
      ?subj wdt:P31 wd:Q839954 .
      ?subj wdt:P625 ?coord .
      ?subj wdt:P571 ?year .
      ?subj rdfs:label ?label filter (lang(?label) = "en")
    }
    `;

    exports.battles = `
    SELECT ?label ?coord ?year
    WHERE
    {
    	?subj wdt:P31 wd:Q178561 .
    	?subj wdt:P625 ?coord .
    	OPTIONAL {?subj wdt:P580 ?d1}
    	OPTIONAL {?subj wdt:P585 ?d2}
      	OPTIONAL {?subj wdt:P582 ?d3}
    	BIND(IF(!BOUND(?d1),(IF(!BOUND(?d2),?d3,?d2)),?d1) as ?date)
    	BIND(YEAR(?date) as ?year)
    	?subj rdfs:label ?label filter (lang(?label) = "en")
    }
    `;

    return exports;
})();
