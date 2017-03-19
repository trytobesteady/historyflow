var Timeline = (function() {
  var exports = {};
  exports.currentYear = 0;
  exports.adjustTimelineFlag = true;

  var yearValue, allMarkerLabels, timeline;
  var startYear = -12000;
  var endYear = 2000;
  var totalYears = 0;
  var offsetOperator = 1;

  exports.init = function() {
    yearValue = document.getElementById('year-value');
    timeline = new Dragdealer('main-slider', {
      animationCallback: function(x, y) {
        onTimelineDrag(x);
      }
    });

    timeline.setValue(0.0001, 0, false);
  };

  exports.relayMarkers = function() {
    allMarkerLabels = GoogleMarkerOverlay.allMarkers;
    exports.getMinMaxYears();
    timeline.setValue(0, 0, false);
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
      //calculate totalyears based on if startyear is negative or not
      //convert current timelineposition (between 0 and 1) to current year, based on startYear and endYear
      if(startYear < 0) {
        totalYears = Math.abs(startYear)+endYear;
        exports.currentYear = Math.round(timelineX * totalYears - Math.abs(startYear));
      } else {
        totalYears = endYear - startYear;
        exports.currentYear = Math.round(timelineX * totalYears) + startYear;
      }

      updateTimelineLabel();

      //after updating timeline values based on new selections, update the timeline draghandler position
      var moveOffset = 0.005 * offsetOperator;
      offsetOperator = offsetOperator * -1;
      timeline.setValue(timelineX-moveOffset, 0);
    } else {
      //default to standard scale when "adjust timeline" checkbox is unchecked
      startYear = -12000;
      endYear = 2000;

      updateTimelineLabel();
    }

    //console.log(exports.adjustTimelineFlag, startYear, endYear, totalYears);
  }

  function onTimelineDrag(x) {
    //convert current timelineposition (between 0 and 1) to current year, based on startYear and endYear
    if(startYear < 0) {
      exports.currentYear = Math.round(x * totalYears - Math.abs(startYear));
    } else {
      exports.currentYear = Math.round(x * totalYears) + startYear;
    }

    if(allMarkerLabels) {
      //console.log('onTimelineDrag', Filter.visibleGroups[allMarkerLabels[0].type]);
      for (var i = 0; i < allMarkerLabels.length; i++) {
        var currentMarker = allMarkerLabels[i];
        var labelYear = currentMarker.year;

        //show markers based on currentYear
        if(exports.currentYear >= labelYear) {
          //only show marker if its filter is checked
          if(Filter.visibleGroups[currentMarker.type]) {
            currentMarker.setVisible(true);
          } else {
            currentMarker.setVisible(false);
          }
        } else if (exports.currentYear < labelYear) {

          currentMarker.setVisible(false);
          //close info window
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
