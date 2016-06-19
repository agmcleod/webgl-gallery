export default class Shader {
  constructor(gl, vertText, fragText) {
    const shaderProgram = gl.createProgram();
    this.linkShaderProgram(gl, shaderProgram, vertText, fragText);

    gl.useProgram(shaderProgram);

    this.setShaderAttributes(gl, shaderProgram);

    this.setMatrixUniforms(gl, shaderProgram);
    this.shaderProgram = shaderProgram;
  }

  linkShaderProgram(gl, shaderProgram, vertText, fragText) {
    const vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vert, vertText);
    gl.compileShader(vert);
    gl.attachShader(shaderProgram, vert);

    const frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(frag, fragText);
    gl.compileShader(frag);
    gl.attachShader(shaderProgram, frag);

    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error("Could not initialize shaders");
    }
  }

  setMatrixUniforms(gl, shaderProgram) {
    this.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    this.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  }

  setShaderAttributes(gl, shaderProgram) {
    this.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(this.vertexPositionAttribute);

    this.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(this.vertexColorAttribute);
  }
}
