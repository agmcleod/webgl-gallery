var Atlas = (function() {
  var constructor = function (image, data) {
    this.image = image;
    this.data = data;
  };

  constructor.prototype.buildRegions = function() {
    this.regions = {};
    for (var i = 0; i < this.data.frames.length; i++) {
      var frame = this.data.frames[i];
      this.regions[frame.filename] = frame.frame;
    }
  };

  return constructor;
})();
