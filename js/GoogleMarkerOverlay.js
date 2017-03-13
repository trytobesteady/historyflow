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
    var year = markerData.founded;
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
      visible: false
    });
    
    if (!exports.markerGroups[iconType]) exports.markerGroups[iconType] = [];
    
    exports.markerGroups[iconType].push(marker);
    exports.allMarkers.push(marker);
    
    var html = "<b>" + label + "</b> <br/>" + yearString;
    bindInfoWindow(marker, GoogleMapTool.map, exports.infoWindow, html);
  }
  
  function bindInfoWindow(marker, map, infoWindow, html) {
    google.maps.event.addListener(marker, 'click', function () {
      exports.infoWindow.setContent(html);
      exports.infoWindow.open(GoogleMapTool, marker);
    });
  }
  
  function toggleGroup(type) {
    for (var i = 0; i < markerGroups[type].length; i++) {
      var marker = markerGroups[type][i];
      if (!marker.getVisible()) {
          marker.setVisible(true);
      } else {
          marker.setVisible(false);
      }
    }
  }

  return exports;
})();
