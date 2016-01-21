var Shader = (function () {
  var constructor = function(gl, vertText, fragText) {
    var shaderProgram = gl.createProgram();
    this.linkShaderProgram(gl, shaderProgram, vertText, fragText);

    gl.useProgram(shaderProgram);

    this.setShaderAttributes(gl, shaderProgram);

    this.setMatrixUniforms(gl, shaderProgram);
    this.shaderProgram = shaderProgram;
  }

  constructor.prototype.linkShaderProgram = function (gl, shaderProgram, vertText, fragText) {
    var vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vert, vertText);
    gl.compileShader(vert);
    gl.attachShader(shaderProgram, vert);

    var frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(frag, fragText);
    gl.compileShader(frag);
    gl.attachShader(shaderProgram, frag);

    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw "Could not initialize shaders";
    }
  }

  constructor.prototype.setMatrixUniforms = function(gl, shaderProgram) {
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  }

  constructor.prototype.setShaderAttributes = function(gl, shaderProgram) {
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  };

  return constructor;
})();
