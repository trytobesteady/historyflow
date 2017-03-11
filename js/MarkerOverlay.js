//this renders all green bubble markers
var MarkerOverlay = (function() {
  var exports = {};
  var markerGroup = null;

  exports.init = function() {
    //markerGroup = new L.LayerGroup(),
  }

  exports.createMarker = function(markerData) {
    var latlng = markerData.coord;
    var label = markerData.label;
    var year = markerData.founded;
    var labelString = label.replace(/ /g,'_')

    var yearString = '';
    if(year < 0) {
      yearString = Math.abs(year) + ' BC';
    } else if (year > 0) {
      yearString = year + ' AD';
    }

    var icon = L.divIcon({
      iconAnchor: [10, 10],
      className: 'marker-icon',
      iconSize: [20, 20],
      position: latlng,
      html: '<a target="_blank" href="https://de.wikipedia.org/wiki/'+labelString+'"><div data-year="'+year+'" class="marker-label">'+label+' / '+yearString+'</div></a>'
    });

    var newMarker = L.marker(latlng, {
      icon: icon
    }).addTo(MapTool.map).on('click', onMarkerClick);
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
    //console.log(targetName);
  }

  return exports;
})();
