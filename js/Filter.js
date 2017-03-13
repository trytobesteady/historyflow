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
    
    console.log(exports.visibleGroups);
    
  };
  
  function onCheckBox(e) {
    var currentCheckboxIdentifier = e.target.id.split('_')[1];
    
    for (var i = 0; i < GoogleMarkerOverlay.markerGroups[currentCheckboxIdentifier].length; i++) {
      var marker = GoogleMarkerOverlay.markerGroups[currentCheckboxIdentifier][i];
      var labelYear = marker.year;
      
      if(Timeline.currentYear >= labelYear) {
        if (!marker.getVisible()) {
          marker.setVisible(true);
          exports.visibleGroups[currentCheckboxIdentifier] = true;
        } else {
          marker.setVisible(false);
          exports.visibleGroups[currentCheckboxIdentifier] = false;
        }
      }
    }
    
    console.log(exports.visibleGroups);
  }

  return exports;
})();
