import Atlas from './atlas';

const AssetLoader = {
  loadAtlas(callback) {
    this.images = [];
    this.loadImage('imgs/atlas.png', (image) => {
      microAjax('imgs/atlas.json', (jsonData) => {
        callback(new Atlas(image, JSON.parse(jsonData)));
      });
    });
  },

  loadImage(path, callback) {
    const image = new Image();
    image.src = path;
    image.onload = function() {
      callback(image);
    };
  },

  loadShaderCode(callback) {
    microAjax('vert.glsl', function(vertData) {
      microAjax('frag.glsl', function(fragData) {
        callback(vertData, fragData);
      });
    });
  }
};

export default AssetLoader;
