//this renders all green bubble markers
var MarkerOverlay = (function() {
  var exports = {};
  exports.markerClusters;
  exports.markerArray = [];


  exports.init = function() {
    exports.markerClusters = L.markerClusterGroup( {animateAddingMarkers: true} );
  }

  exports.createMarker = function(markerData) {
    var latlng = markerData.coord;
    var label = markerData.label;
    var year = markerData.founded;
    var iconClass = markerData.icon;

    if(!latlng) {
      console.log(label, latlng);
      return;
    }

    var labelString = label.replace(/ /g,'_')
    var yearString = '';

    if(year < 0) {
      yearString = Math.abs(year) + ' BC';
    } else if (year > 0) {
      yearString = year + ' AD';
    }

    //TODO check if target page exists in its language
    var url = 'https://en.wikipedia.org/wiki/Nuff'
    var xhr = new XMLHttpRequest();
    xhr.open("HEAD", url,true);
    xhr.onreadystatechange=function() {
       console.log("HTTP Status Code:"+xhr.status);
    }
    //xhr.send(null);

    var icon = L.divIcon({
      iconAnchor: [10, 10],
      className: 'marker-icon '+iconClass,
      iconSize: [20, 20],
      position: latlng,
      year: year,
      html: '<a target="_blank" href="https://en.wikipedia.org/wiki/'+labelString+'"><div data-year="'+year+'" class="marker-label">'+label+' / '+yearString+'</div></a>'
    });

    var newMarker = L.marker(latlng, {
      icon: icon
    }).addTo(MapTool.map).on('click', onMarkerClick); //

    /*
    //CLUSTER
    exports.markerArray.push(newMarker);
    exports.markerClusters.addLayer(newMarker);
    MapTool.map.addLayer(exports.markerClusters);
    */
  }

  function onMarkerClick(e) {
    var targetName = e.target.options.icon.options;

    //get label by click
    var currentLabel = e.originalEvent.target.getElementsByClassName('marker-label')[0];

    if(currentLabel) {
      if(currentLabel.classList.contains('show')) {
        currentLabel.classList.remove('show');
      } else {
        currentLabel.classList.add('show');
      }
    }
    console.log(targetName);
  }

  return exports;
})();
