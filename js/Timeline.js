var Timeline = (function() {
  var exports = {};
  exports.currentYear = 0;
  var yearValue, allMarkerLabels;
  var timeline;

  exports.init = function() {
    yearValue = document.getElementById('year-value');
    timeline = new Dragdealer('main-slider', {
      animationCallback: function(x, y) {
        onTimelineDrag(x);
      }
    });
  };

  exports.relayMarkers = function() {
    allMarkerLabels = GoogleMarkerOverlay.allMarkers;
    timeline.setValue(0.5,0);
  }

  function onTimelineDrag(x) {
    exports.currentYear = Math.round(x * 14000) - 12000;

    if(allMarkerLabels) {
      for (var i = 0; i < allMarkerLabels.length; i++) {
        var currentMarker = allMarkerLabels[i];
        var labelYear = currentMarker.year;

        if(exports.currentYear >= labelYear) {

          if(Filter.visibleGroups[currentMarker.type]) {
            currentMarker.setVisible(true);
          }
        } else if (exports.currentYear < labelYear) {
          currentMarker.setVisible(false);
          if(GoogleMarkerOverlay.infoWindow) {
            GoogleMarkerOverlay.infoWindow.close();
          }
        }
      }
    }

    if(exports.currentYear < 0) {
      yearValue.innerHTML = Math.abs(exports.currentYear) + ' BC';
    } else if (exports.currentYear > 0) {
      yearValue.innerHTML = exports.currentYear + ' AD';
    } else {
      yearValue.innerHTML = '<a target="_blank" href="https://en.wikipedia.org/wiki/Year_zero"> 0 </>';
    }
  }

  return exports;
})();
