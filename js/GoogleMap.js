var GoogleMapTool = (function() {
  var exports = {};
  exports.map = null;
  
  var style = [{
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#0c0b0b"
    }]
  }, {
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [{
      "color": "#f2f2f2"
    }]
  }, {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [{
      "visibility": "off"
    }]
  }, {
    "featureType": "poi.attraction",
    "elementType": "geometry.fill",
    "stylers": [{
      "visibility": "off"
    }, {
      "color": "#ff0000"
    }]
  }, {
    "featureType": "poi.attraction",
    "elementType": "labels.text.fill",
    "stylers": [{
      "visibility": "on"
    }, {
      "color": "#000000"
    }]
  }, {
    "featureType": "poi.attraction",
    "elementType": "labels.text.stroke",
    "stylers": [{
      "visibility": "off"
    }]
  }, {
    "featureType": "poi.business",
    "elementType": "labels.text",
    "stylers": [{
      "visibility": "on"
    }, {
      "color": "#ff0000"
    }]
  }, {
    "featureType": "poi.business",
    "elementType": "labels.text.fill",
    "stylers": [{
      "visibility": "on"
    }, {
      "color": "#000000"
    }]
  }, {
    "featureType": "poi.business",
    "elementType": "labels.text.stroke",
    "stylers": [{
      "visibility": "off"
    }]
  }, {
    "featureType": "poi.government",
    "elementType": "all",
    "stylers": [{
      "visibility": "on"
    }, {
      "saturation": "-100"
    }]
  }, {
    "featureType": "poi.medical",
    "elementType": "all",
    "stylers": [{
      "visibility": "on"
    }, {
      "saturation": "-100"
    }]
  }, {
    "featureType": "poi.park",
    "elementType": "all",
    "stylers": [{
      "visibility": "on"
    }, {
      "saturation": "-100"
    }, {
      "lightness": "30"
    }]
  }, {
    "featureType": "poi.place_of_worship",
    "elementType": "all",
    "stylers": [{
      "visibility": "on"
    }]
  }, {
    "featureType": "poi.place_of_worship",
    "elementType": "labels.text",
    "stylers": [{
      "visibility": "on"
    }]
  }, {
    "featureType": "poi.place_of_worship",
    "elementType": "labels.text.fill",
    "stylers": [{
      "visibility": "on"
    }, {
      "color": "#ff0000"
    }]
  }, {
    "featureType": "poi.place_of_worship",
    "elementType": "labels.text.stroke",
    "stylers": [{
      "visibility": "off"
    }]
  }, {
    "featureType": "poi.place_of_worship",
    "elementType": "labels.icon",
    "stylers": [{
      "visibility": "on"
    }]
  }, {
    "featureType": "poi.school",
    "elementType": "all",
    "stylers": [{
      "visibility": "on"
    }, {
      "saturation": "-100"
    }]
  }, {
    "featureType": "poi.sports_complex",
    "elementType": "geometry.fill",
    "stylers": [{
      "visibility": "on"
    }, {
      "saturation": "-100"
    }]
  }, {
    "featureType": "poi.sports_complex",
    "elementType": "labels.text.fill",
    "stylers": [{
      "visibility": "on"
    }, {
      "color": "#000000"
    }]
  }, {
    "featureType": "poi.sports_complex",
    "elementType": "labels.text.stroke",
    "stylers": [{
      "visibility": "off"
    }]
  }, {
    "featureType": "road",
    "elementType": "all",
    "stylers": [{
      "saturation": -100
    }, {
      "lightness": 45
    }]
  }, {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#090909"
    }]
  }, {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [{
      "visibility": "simplified"
    }]
  }, {
    "featureType": "road.arterial",
    "elementType": "labels.icon",
    "stylers": [{
      "visibility": "off"
    }]
  }, {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [{
      "visibility": "off"
    }]
  }, {
    "featureType": "transit.line",
    "elementType": "geometry.fill",
    "stylers": [{
      "visibility": "on"
    }, {
      "weight": "1"
    }]
  }, {
    "featureType": "transit.station.airport",
    "elementType": "geometry",
    "stylers": [{
      "visibility": "on"
    }]
  }, {
    "featureType": "transit.station.rail",
    "elementType": "geometry.fill",
    "stylers": [{
      "visibility": "on"
    }, {
      "color": "#ff0000"
    }, {
      "weight": "1"
    }]
  }, {
    "featureType": "transit.station.rail",
    "elementType": "labels.text",
    "stylers": [{
      "visibility": "on"
    }, {
      "hue": "#ff0000"
    }]
  }, {
    "featureType": "transit.station.rail",
    "elementType": "labels.icon",
    "stylers": [{
      "visibility": "on"
    }]
  }, {
    "featureType": "water",
    "elementType": "all",
    "stylers": [{
      "color": "#d4e4eb"
    }, {
      "visibility": "on"
    }]
  }, {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [{
      "visibility": "on"
    }, {
      "color": "#d3d3d3"
    }]
  }, {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#9b7f7f"
    }]
  }, {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{
      "color": "#fef7f7"
    }]
  }]

  exports.init = function() {
    
    var styledMap = new google.maps.StyledMapType(style, {name: "Styled Map"});
    
    exports.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 48, lng: 16},
      zoom: 4,
    });
    
    exports.map.mapTypes.set('map_style', styledMap);
    exports.map.setMapTypeId('map_style');
  };

  return exports;
})();
