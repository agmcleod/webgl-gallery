export const KEYS = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  Q: 81,
  E: 69
};

const capture = {
  [KEYS.W]: KEYS.W,
  [KEYS.A]: KEYS.A,
  [KEYS.S]: KEYS.S,
  [KEYS.D]: KEYS.D,
  [KEYS.Q]: KEYS.Q,
  [KEYS.E]: KEYS.E
};

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
