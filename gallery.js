var Gallery = (function() {
  var constructor = function(atlas, maxWidth) {
    this.atlas = atlas;
    this.maxWidth = maxWidth;
  }

  constructor.prototype.buildGalleryImages = function() {
    var regionNames = Object.keys(this.atlas.regions);
    this.galleryImages = [];
    var lastRegion = null;
    var x = 0, y = 0, maxY = 0;
    for (var i = 0; i < regionNames.length; i++) {
      if (lastRegion !== null) {
        x += lastRegion.w;
      }
      if (x > this.maxWidth) {
        x = 0;
        y = maxY;
        lastRegion = null;
      }
      lastRegion = this.atlas.regions[regionNames[i]];

      maxY = Math.max(lastRegion.h, maxY);
      this.galleryImages.push(new GalleryImage(regionNames[i], x, y));
    }
  };

  return constructor;
})();
