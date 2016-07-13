// The fragment shader is the rasterization process of webgl

// use float precision for this shader
precision mediump float;

// the input texture coordinate values from the vertex shader
varying vec2 vTextureCoord;
// the texture data, this is bound via gl.bindTexture()
uniform sampler2D texture;
// the colour uniform
uniform vec3 color;

void main(void) {
  // gl_FragColor is the output colour for a particular pixel.
  // use the texture data, specifying the texture coordinate, and modify it by the colour value.
  gl_FragColor = texture2D(texture, vec2(vTextureCoord.s, vTextureCoord.t)) * vec4(color, 1.0);
}
