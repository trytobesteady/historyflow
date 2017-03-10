var WikiQuery = (function() {
  var exports = {};
  var output, title;
  var queryArray = [];

  exports.init = function(data) {
    title = document.getElementById('title');
    output = document.getElementById('output');

    //startSparqlQuery(Queries.universities);
    startSparqlQuery(Queries.archsites);
  };


  function startSparqlQuery(sparql) {
    var url = wdk.sparqlQuery(sparql)

    getJSON(url,
      function(err, data) {
        if (err != null) {
          console.log('Something went wrong: ' + err);
        } else {
          processData(data);
        }
      });
  }

  function processData(data) {
    var headVars = data.head.vars;
    var bindings = data.results.bindings;

    //bindings.length
    for (var j = 0; j < bindings.length; j++) {
      var entry = {};
      var tempArray = [];

      for (var k = 0; k < headVars.length; k++) {
        //converting founded date
        if (headVars[k] == 'founded') {
          var literalTime = bindings[j][headVars[k]].value;
          literalTime = literalTime.split('T');
          var date = literalTime[0].split('-')
          var convertedDate = null;

          if (date.length === 4) {
            //year is BC
            convertedDate = parseInt(date[1], 10) * -1;
          } else {
            convertedDate = parseInt(date[0], 10);
          }
          entry[headVars[k]] = convertedDate;
        } else if (headVars[k] == 'coord') {
          var coordString = bindings[j][headVars[k]].value;
          entry[headVars[k]] = [getFloatFromString(coordString)[1], getFloatFromString(coordString)[0]];
        } else {
          entry[headVars[k]] = bindings[j][headVars[k]].value;
        }
      }
      output.innerHTML += '<br>';
      queryArray.push(entry);
    }

    processArray(queryArray);
  }

  function processArray(array) {
    for (var i = 0; i < array.length; i++) {
      MarkerOverlay.createMarker(array[i]);
    }
    var allMarkerLabels = document.querySelectorAll('[data-year]');
    Timeline.relayMarkers(allMarkerLabels);
  }

  function getFloatFromString(string) {
    var regex = /[+-]?\d+(\.\d+)?/g;
    var floats = string.match(regex).map(function(v) { return parseFloat(v); });
    return floats;
  }

  var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };
    xhr.send();
  };

  return exports;
})();
