(function() {
  var time;
  function update() {
    var currentTime = Date.now();
    var delta = currentTime - time;
    var cameraOffset = Webgl.cameraOffset;
    if (InputManager.isKeyPressed(KEYS.W)) {
      cameraOffset.y += 0.0001 * delta;
    }
    if (InputManager.isKeyPressed(KEYS.A)) {
      cameraOffset.x -= 0.0001 * delta;
    }
    if (InputManager.isKeyPressed(KEYS.S)) {
      cameraOffset.y -= 0.0001 * delta;
    }
    if (InputManager.isKeyPressed(KEYS.D)) {
      cameraOffset.x += 0.0001 * delta;
    }
    Webgl.draw();
    time = currentTime;
    requestAnimationFrame(update);
  }

  AssetLoader.loadAtlas(function(atlas) {
    atlas.buildRegions();
    var canvas = document.getElementById('canvas');
    AssetLoader.loadShaderCode(function(vert, frag) {
      Webgl.initialize(canvas);
      Webgl.compileShaders(vert, frag);
      Webgl.createBuffers();
      Webgl.setupGL(atlas);

      InputManager.bind();

      var gallery = new Gallery(atlas, canvas.clientWidth);
      gallery.buildGalleryImages();

      Webgl.atlas = atlas;
      Webgl.gallery = gallery;
      time = Date.now();
      requestAnimationFrame(update);
    });
  });

})();
