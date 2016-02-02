(function() {
  var KEYS = {
    W: 87,
    A: 65,
    S: 83,
    D: 68
  };

  var capture = [KEYS.W, KEYS.A, KEYS.S, KEYS.D];

  var pressedKeys = {};

  var InputManager = {
    bind: function() {
      window.addEventListener('keydown', this.keydown, false);
      window.addEventListener('keyup', this.keyup, false);
    },

    isKeyPressed(key) {
      return !!pressedKeys[key];
    },

    keydown: function(e, keyCode) {
      keyCode = keyCode || e.keyCode;
      if (capture.indexOf(keyCode) !== -1) {
        e.preventDefault();
        pressedKeys[keyCode] = true;
      }
    },

    keyup: function(e, keyCode) {
      keyCode = keyCode || e.keyCode;
      if (capture.indexOf(keyCode) !== -1) {
        e.preventDefault();
        pressedKeys[keyCode] = false;
      }
    }
  };

  window.InputManager = InputManager;
  window.KEYS = KEYS;
})();
