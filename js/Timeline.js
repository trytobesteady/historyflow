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
    //CLUSTER
    //allMarkerLabels = MarkerOverlay.markerArray;
    allMarkerLabels = document.querySelectorAll('[data-year]');
  }

  function onTimelineDrag(x) {
    currentYear = Math.round(x * 14000) - 12000;

    if(allMarkerLabels) {
      for (var i = 0; i < allMarkerLabels.length; i++) {
        var labelYear = parseInt(allMarkerLabels[i].getAttribute('data-year'));
        var currentMarker = allMarkerLabels[i].parentElement.parentElement;

        ////CLUSTER
        //var labelYear = parseInt(allMarkerLabels[i].options.icon.options.year);
        //var currentMarker = allMarkerLabels[i];


        if(currentYear >= labelYear) {
          TweenMax.to(currentMarker, 0.3, {css:{autoAlpha:1}});
          //MarkerOverlay.markerClusters.addLayer(currentMarker);
        } else if (currentYear < labelYear) {
          TweenMax.to(currentMarker, 0.3, {css:{autoAlpha:0}});
          //MarkerOverlay.markerClusters.removeLayer(currentMarker);
        }
      }
      //MarkerOverlay.markerClusters.refreshClusters();
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
