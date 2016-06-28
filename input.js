export const KEYS = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  Q: 81,
  E: 69,
  Z: 90,
  C: 67
};

const capture = {};

const keyNames = Object.keys(KEYS);
for (let i = 0; i < keyNames.length; i++) {
  capture[KEYS[keyNames[i]]] = KEYS[keyNames[i]];
}

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
    if (capture[code]) {
      e.preventDefault();
      pressedKeys[code] = true;
    }
  },

  keyup(e, keyCode) {
    const code = keyCode || e.keyCode;
    if (capture[code]) {
      e.preventDefault();
      pressedKeys[code] = false;
    }
  }
};
