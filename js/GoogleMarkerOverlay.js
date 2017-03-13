var GoogleMarkerOverlay = (function() {
  var exports = {};
  exports.markerClusters;
  exports.markerGroups = [];
  exports.allMarkers = [];
  exports.infoWindow;

  exports.init = function() {
  }

  exports.createMarker = function(markerData) {
    var latlng = markerData.coord;
    var label = markerData.label;
    var year = markerData.year;
    var iconType = markerData.icon;

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

    exports.infoWindow = new google.maps.InfoWindow();

    var iconBase = 'img/';

    var icons = {
      archsites: {
        icon: iconBase + 'archsite24.png'
      },
      settlements: {
        icon: iconBase + 'house24.png'
      },
      battles: {
        icon: iconBase + 'battle24.png'
      }
    };

    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(latlng[0], latlng[1]),
      map: GoogleMapTool.map,
      icon: icons[iconType].icon,
      type: iconType,
      year: year,
      visible: false,
      zIndex: 100 + WikiQuery.currentQueries.indexOf(iconType)
    });

    if (!exports.markerGroups[iconType]) exports.markerGroups[iconType] = [];

    exports.markerGroups[iconType].push(marker);
    exports.allMarkers.push(marker);

    var html = '<a class="marker-link" target="_blank" href="https://en.wikipedia.org/wiki/'+labelString+'"><b>'+label+' / '+yearString+'</b></a>';
    bindInfoWindow(marker, GoogleMapTool.map, exports.infoWindow, html);
  }

  function bindInfoWindow(marker, map, infoWindow, html) {
    google.maps.event.addListener(marker, 'click', function () {
      //console.log(marker);
      exports.infoWindow.setContent(html);
      exports.infoWindow.open(GoogleMapTool.map, marker);
    });
  }

  return exports;
})();
