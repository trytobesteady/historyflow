var WikiQuery = (function() {
  var exports = {};
  var output, title;
  var queryArray = [];

  exports.init = function(data) {
    title = document.getElementById('title');
    output = document.getElementById('output');


    //startSparqlQuery(Queries.battles, 'battles', true);
    startSparqlQuery(Queries.archsites, 'archsites', false);
    startSparqlQuery(Queries.settlements, 'settlements', true);
  };


  function startSparqlQuery(sparql, iconIdentifier, startRendering) {
    var url = wdk.sparqlQuery(sparql)

    getJSON(url,
      function(err, data) {
        if (err != null) {
          console.log('Something went wrong: ' + err);
        } else {
          processData(data, iconIdentifier, startRendering);
        }
      });
  }

  function processData(data, iconIdentifier, startRendering) {
    var headVars = data.head.vars;
    var bindings = data.results.bindings;

    //bindings.length
    for (var j = 0; j < bindings.length; j++) {
      //looping through all query entries
      var entry = {};
      var tempArray = [];

      for (var k = 0; k < headVars.length; k++) {
        //looping through keys in object

        if (headVars[k] == 'founded') {
          //converting founded date
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
          //adding geocoordinate
          var coordString = bindings[j][headVars[k]].value;
          var lat = getFloatFromString(coordString)[1];
          var lng = getFloatFromString(coordString)[0];
          if(lat && lng) {
            entry[headVars[k]] = [lat, lng];
          }

        } else {
          //adding label and iconIdentifier
          entry[headVars[k]] = bindings[j][headVars[k]].value;
          entry.icon = iconIdentifier;
        }
      }
      output.innerHTML += '<br>';
      queryArray.push(entry);
    }

    if(startRendering) {
      processArray(queryArray);
    }
  }

  function processArray(array) {
    for (var i = 0; i < array.length; i++) {
      MarkerOverlay.createMarker(array[i]);
    }
    var allMarkerLabels = document.querySelectorAll('[data-year]');
    Timeline.relayMarkers();
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
