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

    //filter out latlng
    if(!latlng) {
      console.log(label, latlng);
      return;
    }
    
    //filter out invalid years
    if(!year) {
      //console.log(label, year);
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
        img: iconBase + 'archsite24.png'
      },
      settlements: {
        img: iconBase + 'settlement24.png'
      },
      battles: {
        img: iconBase + 'battle24.png'
      },
      monasteries: {
        img: iconBase + 'monastery24.png'
      },
      churches: {
        img: iconBase + 'church24.png'
      },
      mosques: {
        img: iconBase + 'islam24.png'
      }
    };
    
    if(!icons[iconType]) {
      icons[iconType] = { img: iconBase + 'default.png' };
    }

    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(latlng[0], latlng[1]),
      map: GoogleMapTool.map,
      icon: icons[iconType].img,
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
      
      /*
      //pan to clicked marker
      var latLng = marker.getPosition();
      GoogleMapTool.map.panTo(latLng);
      */
      
      exports.infoWindow.setContent(html);
      exports.infoWindow.open(GoogleMapTool.map, marker);
    });
  }

  return exports;
})();
