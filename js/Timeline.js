var Timeline = (function() {
  var exports = {};
  exports.currentYear = 0;
  exports.adjustTimelineFlag = false;
  var yearValue, allMarkerLabels;
  var timeline;
  

  var startYear = -12000;
  var endYear = 2000;

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
    exports.getMinMaxYears();
  }

  exports.getMinMaxYears = function() {
    if(exports.adjustTimelineFlag) {
      var lowest = Number.POSITIVE_INFINITY;
      var highest = Number.NEGATIVE_INFINITY;
      var year, icon;
  
      for (var i = 0; i < WikiQuery.queryArray.length; i++) {
        icon = WikiQuery.queryArray[i].icon;
        
        //check if current icon is visible due to filter settings
        //if so include it in max min year calculation
        if(Filter.visibleGroups[icon]) {
          year = WikiQuery.queryArray[i].year;
          if (year < lowest) lowest = year;
          if (year > highest) highest = year;
        }
      }
  
      endYear = highest;
      startYear = lowest;
      
      var timelineX = timeline.getValue()[0];
      exports.currentYear = Math.round(timelineX * (Math.abs(startYear)+endYear)) - Math.abs(startYear);
      updateTimelineLabel();
    } else {
      startYear = -12000;
      endYear = 2000;
    }
  }

  function onTimelineDrag(x) {
    startYear = Math.abs(startYear);
    exports.currentYear = Math.round(x * (startYear+endYear)) - startYear;

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
    updateTimelineLabel();
  }
  
  function updateTimelineLabel() {
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
