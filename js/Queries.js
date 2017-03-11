var Queries = (function() {
    var exports = {};

    exports.universities = `
    SELECT ?universityLabel ?universityDescription ?website ?coord
    WHERE {
    	?university wdt:P31/wdt:P279* wd:Q3918 ;
    		wdt:P17 wd:Q183 ;
    		wdt:P625 ?coord .
    	OPTIONAL {
    		?university wdt:P856 ?website
    	}
    	SERVICE wikibase:label {
    		bd:serviceParam wikibase:language "en,de" .
    	}
    }
    `;

    exports.archsites = `
    SELECT ?label ?coord ?founded
    WHERE
    {
       ?subj wdt:P31 wd:Q839954 .
       ?subj wdt:P625 ?coord .
       ?subj wdt:P571 ?founded .
       ?subj rdfs:label ?label filter (lang(?label) = "en")
    }
    `;

    exports.test = `
    SELECT ?label ?coord ?place
    WHERE
    {
       ?subj wdt:P31 wd:Q839954 .
       ?subj wdt:P625 ?coord .
       ?subj rdfs:label ?label filter (lang(?label) = "en")
    }
    `;


    return exports;
})();
