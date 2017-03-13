var GoogleMapTool = (function() {
  var exports = {};
  exports.map = null;

  exports.init = function() {
    exports.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 48, lng: 16},
      zoom: 4
    });
    
  };

  return exports;
})();
