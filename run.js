import AssetLoader from './asset_loader';
import Gallery from './gallery';
import Webgl from './webgl';
import InputManager, {KEYS} from './input';

let time;
const SPEED = 0.001;
function update() {
  const currentTime = Date.now();
  const delta = currentTime - time;
  const cameraOffset = Webgl.cameraOffset;
  if (InputManager.isKeyPressed(KEYS.W)) {
    cameraOffset[1] += SPEED * delta;
  }
  if (InputManager.isKeyPressed(KEYS.A)) {
    cameraOffset[0] -= SPEED * delta;
  }
  if (InputManager.isKeyPressed(KEYS.S)) {
    cameraOffset[1] -= SPEED * delta;
  }
  if (InputManager.isKeyPressed(KEYS.D)) {
    cameraOffset[0] += SPEED * delta;
  }
  if (InputManager.isKeyPressed(KEYS.Q)) {
    cameraOffset[2] += SPEED * delta;
  }
  if (InputManager.isKeyPressed(KEYS.E)) {
    cameraOffset[2] -= SPEED * delta;
  }
  Webgl.draw();
  time = currentTime;
  requestAnimationFrame(update);
}

AssetLoader.loadAtlas(function(atlas) {
  atlas.buildRegions();
  const canvas = document.getElementById('canvas');
  AssetLoader.loadShaderCode(function(vert, frag) {
    Webgl.initialize(canvas);
    Webgl.compileShaders(vert, frag);
    Webgl.createBuffers();
    Webgl.setupGL(atlas);

    InputManager.bind();

    const gallery = new Gallery(atlas, canvas.clientWidth, canvas.clientHeight);
    gallery.buildGalleryImages();

    Webgl.atlas = atlas;
    Webgl.gallery = gallery;
    time = Date.now();
    requestAnimationFrame(update);
  });
});
