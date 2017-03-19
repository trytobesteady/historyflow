var WikiQuery = (function() {
  var exports = {};
  exports.queryArray = [];
  var title, checkboxWrapper;

  //exports.currentQueries = ['churches', 'monasteries', 'mosques', 'test'];
  exports.currentQueries = ['archsites', 'settlements', 'battles', 'churches', 'monasteries', 'mosques', 'test' ];
  var currentQueryIndex = 0;

  exports.init = function(data) {
    title = document.getElementById('title');
    checkboxWrapper = document.getElementsByClassName('checkbox-wrapper');

    startSparqlQuery();
  };


  function startSparqlQuery() {
    var sparql = Queries[exports.currentQueries[currentQueryIndex]];
    var iconIdentifier = exports.currentQueries[currentQueryIndex];
    var url = wdk.sparqlQuery(sparql)

    //cycle through queries
    if(currentQueryIndex >= exports.currentQueries.length) {
      console.log('startrendering', exports.queryArray.length);
      processArray(exports.queryArray);

    } else {
      getJSON(url,
        function(err, data) {
          if (err != null) {
            console.log('Something went wrong: ' + err);
          } else {

            console.log(iconIdentifier, data.results.bindings.length);

            //process imported data
            processData(data, iconIdentifier);

            //arm filter checkboxes
            setTimeout(function () {
              for (var i = 0; i < checkboxWrapper.length; i++) {
                if(checkboxWrapper[i].id == iconIdentifier) {
                  checkboxWrapper[i].style.opacity = 1;
                  checkboxWrapper[i].style.pointerEvents = 'auto';
                  checkboxWrapper[i].style.cursor = 'pointer';
                }
              }
            }, 500);
          }
        });
    }
  }

  function processData(data, iconIdentifier) {
    var bindings = data.results.bindings;
    var headVars = data.head.vars;

    //bindings.length
    for (var j = 0; j < bindings.length; j++) {
      //looping through all query entries
      var entry = { label:null, coord:null, icon:null, year:null};

      for (var k = 0; k < headVars.length; k++) {
        //looping through keys in object
        switch (headVars[k]) {
          case 'label':
            //adding label and iconIdentifier
            entry.label = bindings[j][headVars[k]].value;
            entry.icon = iconIdentifier;
            break;
          case 'coord':
            //adding geocoordinate
            var coordString = bindings[j][headVars[k]].value;
            var lat = getFloatFromString(coordString)[1];
            var lng = getFloatFromString(coordString)[0];
            if(lat && lng) {
              entry.coord = [lat, lng];
            }
            break;
          case 'year':
            //adding year
            if(bindings[j][headVars[k]]) {
              var literalTime = bindings[j][headVars[k]].value;

              var momentYear = moment(literalTime, 'Y').year();

              //hack: if year lies in the future, revert it to BC
              var currentYear = moment().format('Y');
              var currentYear = moment().year();
              if(momentYear > currentYear) {
                momentYear = momentYear * -1;
              }

              entry.year = momentYear;
            }
            break;
        }
      }

      if(entry.year) {
        //console.log(entry);
        exports.queryArray.push(entry);
      };
    }

    currentQueryIndex ++;
    startSparqlQuery();
  }

  function processArray(array) {
    for (var i = 0; i < array.length; i++) {
      GoogleMarkerOverlay.createMarker(array[i]);
    }
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
