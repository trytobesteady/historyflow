//this renders all green bubble markers
var MarkerOverlay = (function() {
  var exports = {};
  var markerGroup = null;

  exports.init = function() {
    //markerGroup = new L.LayerGroup(),

  }

  exports.hideAllMarkers = function() {
    //MapTool.map.removeLayer(markerGroup);
  }

  exports.showAllMarkers = function() {
    //MapTool.map.addLayer(markerGroup);
  }

  exports.createMarker = function(markerData) {
    var latlng = markerData.coord;
    var label = markerData.label;
    var year = markerData.founded;

    var icon = L.divIcon({
      iconAnchor: [10, 10],
      className: 'marker-icon',
      iconSize: [20, 20],
      position: latlng,
      html: '<div class="marker-label">'+label+'</div>'
    });

    var newMarker = L.marker(latlng, {
      icon: icon
    }).addTo(MapTool.map).on('click', onMarkerClick);

    //var newMarker = new L.marker(e.latlng).addTo(map);

    //var markerOverlay = {'markerGroup':markerGroup};
    //L.control.layers(markerOverlay).addTo(MapTool.map);
    //MapTool.map.addLayer(markerGroup);
  }

  function onMarkerClick(e) {
    var targetName = e.target.options.icon.options;
    //console.log('onMarkerClick',targetName);
    var currentLabel = e.originalEvent.target.getElementsByClassName('marker-label')[0];

    if(currentLabel.classList.contains('show')) {
      currentLabel.classList.remove('show');
    } else {
      currentLabel.classList.add('show');
    }

    console.log(e.originalEvent.target);

  }

  return exports;
})();
