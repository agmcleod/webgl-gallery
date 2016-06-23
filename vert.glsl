attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMatrix;
varying vec2 vTextureCoord;
void main() {
  gl_Position = uMatrix * aVertexPosition;
  vTextureCoord = aTextureCoord;
}
