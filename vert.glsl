attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 uMatrix;
varying vec2 vTextureCoord;
void main() {
  gl_Position = vec4((uMatrix * vec3(aVertexPosition, 1)).xy, 0, 1);
  vTextureCoord = aTextureCoord;
}
