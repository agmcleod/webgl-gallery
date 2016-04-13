var Gallery = (function() {
  var constructor = function(atlas, screenWidth, screenHeight) {
    this.atlas = atlas;
    this.screenWidth = screenWidth;
    this.padding = 10;
    this.targetWidth = screenWidth / 3;
    this.screenHeight = screenHeight;
  }

  constructor.prototype.buildGalleryImages = function() {
    var regionNames = Object.keys(this.atlas.regions);
    this.galleryImages = [];
    var lastRegion = null;
    var x = 0, y = 0, maxY = 0;
    for (var i = 0; i < regionNames.length; i++) {
      if (lastRegion !== null) {
        x += this.targetWidth + this.padding;
      }
      if (x > this.screenWidth) {
        x = 0;
        y = maxY;
        maxY = 0;
        lastRegion = null;
      }
      lastRegion = this.atlas.regions[regionNames[i]];

      maxY = Math.max(lastRegion.h, maxY) + y;
      var gi = new GalleryImage(regionNames[i], x / this.screenWidth - 1, y / this.screenHeight - 1);
      gi.width = this.targetWidth / this.screenWidth;
      gi.height = lastRegion.w / lastRegion.h * gi.width;
      this.galleryImages.push(gi);
    }
  };

  return constructor;
})();
