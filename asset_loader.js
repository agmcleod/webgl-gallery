var AssetLoader = {
  loadAtlas: function(callback) {
    this.images = [];
    this.loadImage('imgs/atlas.png', function(image) {
      microAjax('imgs/atlas.json', function (jsonData) {
        callback(new Atlas(image, JSON.parse(jsonData)));
      });
    });
  },

  loadImage: function(path, callback) {
    var image = new Image();
    image.src = path;
    image.onload = function() {
      callback(image);
    }
  },

  loadShaderCode: function(callback) {
    microAjax('vert.glsl', function(res) {
      var vert = res;
      microAjax('frag.glsl', function(res) {
        callback(vert, res);
      });
    });
  }
};
