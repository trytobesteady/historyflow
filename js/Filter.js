var Filter = (function() {
  var exports = {};
  exports.map = null;
  exports.visibleGroups = {};
  var checkboxes;

  exports.init = function() {
    checkboxes = document.getElementsByClassName('filter-checkbox');

    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].addEventListener('change', onCheckBox);
      var currentCheckboxIdentifier = checkboxes[i].id.split('_')[1];
      exports.visibleGroups[currentCheckboxIdentifier] = checkboxes[i].checked;
    }
  };

  function onCheckBox(e) {
    
    //update current hide&show flags
    for (var i = 0; i < checkboxes.length; i++) {
      var cbname = checkboxes[i].id.split('_')[1];
      exports.visibleGroups[cbname] = checkboxes[i].checked;
    }
    
    Timeline.getMinMaxYears();
    
    var currentCheckboxIdentifier = e.target.id.split('_')[1];
    //hiding&showing of checkboxed markers
    for (var i = 0; i < GoogleMarkerOverlay.markerGroups[currentCheckboxIdentifier].length; i++) {
      var marker = GoogleMarkerOverlay.markerGroups[currentCheckboxIdentifier][i];
      var labelYear = marker.year;

      if(Timeline.currentYear >= labelYear) {
        if (!marker.getVisible()) {
          marker.setVisible(true);
        } else {
          marker.setVisible(false);
        }
      }
    }
  }

  return exports;
})();
