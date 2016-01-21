var GalleryImage = (function() {
  var constructor = function(regionName, x, y) {
    this.regionName = regionName;
    this.position = {x: x, y: y};
  };

  return constructor;
})();
