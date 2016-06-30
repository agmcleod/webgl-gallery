export default class Shader {
  constructor(gl, vertText, fragText) {
    const shaderProgram = gl.createProgram();
    this.linkShaderProgram(gl, shaderProgram, vertText, fragText);

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
}
