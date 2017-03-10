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

    console.log(markerData);

    var icon = L.divIcon({
      className: 'marker-icon',
      iconSize: new L.Point(10, 10),
      position: latlng,
      html: '<div class="marker-icon-number">'+label+'</div>'
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
    console.log('onMarkerClick',targetName);
    
  }
    
  return exports;
})();