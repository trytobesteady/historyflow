var Timeline = (function() {
  var exports = {};
  var yearValue, allMarkerLabels;
  var timeline;
  var currentYear = 0;
  var colors = {archsites:'#6d4000', cities:'#1c6d00', battles:'#8c0404'}

  exports.init = function() {

    yearValue = document.getElementById('year-value');
    timeline = new Dragdealer('main-slider', {
      animationCallback: function(x, y) {
        onTimelineDrag(x);
      }
    });

    timeline.setValue(0,0);
  };

  exports.relayMarkers = function() {
    allMarkerLabels = GoogleMarkerOverlay.allMarkers;
  }

  function onTimelineDrag(x) {
    currentYear = Math.round(x * 14000) - 12000;

    if(allMarkerLabels) {
      for (var i = 0; i < allMarkerLabels.length; i++) {
        var currentMarker = allMarkerLabels[i];
        var labelYear = currentMarker.year;

        if(currentYear >= labelYear) {
          currentMarker.setVisible(true);
        } else if (currentYear < labelYear) {
          currentMarker.setVisible(false);
          
          if(exports.infoWindow) {
            exports.infoWindow.close();  
          }
        }
      }
    }

    if(currentYear < 0) {
      yearValue.innerHTML = Math.abs(currentYear) + ' BC';
    } else if (currentYear > 0) {
      yearValue.innerHTML = currentYear + ' AD';
    } else {
      yearValue.innerHTML = '<a target="_blank" href="https://en.wikipedia.org/wiki/Year_zero"> 0 </>';
    }

  }

  return exports;
})();
