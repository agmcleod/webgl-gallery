// setup passable attributes for the vertex position & texture coordinates
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

// setup a uniform for our perspective * lookat * model view matrix
uniform mat4 uMatrix;
// setup an output variable for our texture coordinates
varying vec2 vTextureCoord;
void main() {
  // take our final matrix to modify the vertex position to display the data on screen in a perspective way
  // With shader code here, you can modify the look of an image in all sorts of ways
  gl_Position = uMatrix * vec4(aVertexPosition, 1);
  vTextureCoord = aTextureCoord;
}
