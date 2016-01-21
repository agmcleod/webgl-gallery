AssetLoader.loadAtlas(function(atlas) {
  atlas.buildRegions();
  var canvas = document.getElementById('canvas');
  AssetLoader.loadShaderCode(function(vert, frag) {
    Webgl.initialize(canvas);
    Webgl.compileShaders(vert, frag);
    Webgl.bindBuffers();
    Webgl.setupGL(atlas);

    var gallery = new Gallery(atlas, canvas.clientWidth);
    gallery.buildGalleryImages();

    Webgl.atlas = atlas;
    Webgl.gallery = gallery;

    Webgl.draw = Webgl.draw.bind(Webgl);
    requestAnimationFrame(Webgl.draw);
  });
});
