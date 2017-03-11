var Queries = (function() {
    var exports = {};

    exports.settlements = `
    SELECT ?label ?coord ?founded
    WHERE
    {
      ?subj wdt:P31 wd:Q486972 .
      ?subj wdt:P625 ?coord .
      ?subj wdt:P571 ?founded .
      ?subj rdfs:label ?label filter (lang(?label) = "en")
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

    exports.battles = `
    SELECT ?label ?coord ?founded
    WHERE
    {
      ?subj wdt:P31 wd:Q515 .
      ?subj wdt:P625 ?coord .
      ?subj wdt:P571 ?founded .
      ?subj rdfs:label ?label filter (lang(?label) = "en")
    }
    `;

    return exports;
})();
