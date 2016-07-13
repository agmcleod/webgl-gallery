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
  // the 4th value here is the w coordinate, and it is called Homogeneous coordinates, (x,y,z,w).
  // It effectively allows the perspective math to work. With 3d graphics, it should be set to 1. Less than 1 will appear too big
  // Greater than 1 will appear too small
  gl_Position = uMatrix * vec4(aVertexPosition, 1);
  vTextureCoord = aTextureCoord;
}
