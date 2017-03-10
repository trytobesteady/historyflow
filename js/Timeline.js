var Timeline = (function() {
  var exports = {};
  var yearValue, allMarkerLabels;
  var timeline;
  var currentYear = 0;

  exports.init = function() {

    yearValue = document.getElementById('year-value');
    timeline = new Dragdealer('main-slider', {
      animationCallback: function(x, y) {
        onTimelineDrag(x);
      }
    });
  };

  exports.relayMarkers = function(markerLabels) {
    allMarkerLabels = markerLabels;

  }

  function onTimelineDrag(x) {
    currentYear = Math.round(x * 14000) - 12000;

    if(allMarkerLabels) {
      for (var i = 0; i < allMarkerLabels.length; i++) {
        var labelYear = parseInt(allMarkerLabels[i].getAttribute('data-year'));
        var currentMarker = allMarkerLabels[i].parentElement;

        if(currentYear >= labelYear) {
          currentMarker.style.opacity = 1;
          //TweenMax.to(currentMarker, 0.3, {css:{autoAlpha:1}});
        } else if (currentYear < labelYear) {
          //TweenMax.to(currentMarker, 0.3, {css:{autoAlpha:0}});
          currentMarker.style.opacity = 0;
        }
      }
    }

    if(currentYear < 0) {
      yearValue.innerHTML = Math.abs(currentYear) + ' BC';
    } else if (currentYear > 0) {
      yearValue.innerHTML = currentYear + ' AD';
    } else {
      yearValue.innerHTML = '<a target="_blank" href="https://en.wikipedia.org/wiki/Year_zero"> # </>';
    }



  }

  return exports;
})();
