export default class Shader {
  constructor(gl, vertText, fragText) {
    // create the instance of our program
    const shaderProgram = gl.createProgram();
    this.linkShaderProgram(gl, shaderProgram, vertText, fragText);

    this.shaderProgram = shaderProgram;
  }

  linkShaderProgram(gl, shaderProgram, vertText, fragText) {
    // tell webgl this is vertex shader code
    const vert = gl.createShader(gl.VERTEX_SHADER);
    // set the source from the text we loaded via XHR
    gl.shaderSource(vert, vertText);
    // compile it
    gl.compileShader(vert);
    // attach it to the program
    gl.attachShader(shaderProgram, vert);

    // same process here for the fragment shader. It adds the text, compiles the values, and adds to the program
    const frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(frag, fragText);
    gl.compileShader(frag);
    gl.attachShader(shaderProgram, frag);

    // link the program to the webgl instance
    gl.linkProgram(shaderProgram);

    // if the link failed, then this will throw an error
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      // to see logs, try using:
      // console.log(gl.getShaderInfoLog(shaderProgram));
      throw new Error("Could not initialize shaders");
    }
  }
}
