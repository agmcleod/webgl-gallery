precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D texture;

void main(void) {
  gl_FragColor = texture2D(texture, vec2(vTextureCoord.s, vTextureCoord.t));
}
