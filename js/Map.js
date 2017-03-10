var MapTool = (function() {
  var exports = {};
  
  exports.init = function() {
    console.log('init map')
    
    exports.map = L.map('map').setView([48, 16], 2);
    //map.createPane('labels');
    exports.map.getRenderer(exports.map).options.padding = 100;

    //L.tileLayer('https://api.mapbox.com/styles/v1/trytobesteady/cj03w9ffc008x2rmvg4trp0mv/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHJ5dG9iZXN0ZWFkeSIsImEiOiJjajAzdzg3NDgwYXliMzNsc281cWZxc3JkIn0.IfopoeDFiuaAZHmWXmu_MQ', {
    tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/ufomammoot/ciz78g45l003z2ro8e2c57ma5/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidWZvbWFtbW9vdCIsImEiOiJjaXozeWNueGgwNHYxMndwODFpNWdlamQ3In0.AAH-nIVR56uYU20uAYXtzQ', {
      minZoom: 1,
      maxZoom: 12,
      attributionControl: false,
      id: 'mapbox.light'
    }).addTo(exports.map);
  };
  
  return exports;
})();