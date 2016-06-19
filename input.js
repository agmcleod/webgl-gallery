export const KEYS = {
  W: 87,
  A: 65,
  S: 83,
  D: 68
};

const capture = [KEYS.W, KEYS.A, KEYS.S, KEYS.D];

const pressedKeys = {};

export default {
  bind() {
    window.addEventListener('keydown', this.keydown, false);
    window.addEventListener('keyup', this.keyup, false);
  },

  isKeyPressed(key) {
    return !!pressedKeys[key];
  },

  keydown(e, keyCode) {
    const code = keyCode || e.keyCode;
    if (capture.indexOf(code) !== -1) {
      e.preventDefault();
      pressedKeys[code] = true;
    }
  },

  keyup(e, keyCode) {
    const code = keyCode || e.keyCode;
    if (capture.indexOf(code) !== -1) {
      e.preventDefault();
      pressedKeys[keyCode] = false;
    }
  }
};
