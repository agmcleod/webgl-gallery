precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform vec3 color;

void main(void) {
  gl_FragColor = texture2D(texture, vec2(vTextureCoord.s, vTextureCoord.t)) * vec4(color, 1.0);
}
