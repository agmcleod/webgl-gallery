import Shader from './shader';

const MAX_QUADS_PER_BATCH = 100; // arbitrary for now
// we use 4 points/coordinates per quad or rectangle.
const VERTS_PER_QUAD = 4;
// Since WebGL uses triangles to draw, we need to use two triangles to make up a square. So 6 points represent that.
// Indices are used to refer to a point.
const INDICES_PER_QUAD = 6;
// 3 values per point: x,y,z
const FLOATS_PER_VERT = 3;
// 2 values per texture coordinate: s,t
const FLOATS_PER_TEXTURE_VERT = 2;

// the position of the camera in the scene
const eye = vec3.create();
// the position the camera is facing
const center = vec3.create();
// the up direction relative to the camera
// position y means it will have a neutral rotation
const up = vec3.clone([0, 1, 0]);

export default {
  initialize(canvas) {
    // store the canvas dom element
    this.canvas = canvas;
    // create our gl context
    this.gl = canvas.getContext('experimental-webgl');
  },

  createBuffers() {
    // This sets up 3 buffers for us to pass data to. This is how data is passed down to our compiled shader
    this.positionBuffer = this.gl.createBuffer();
    this.textureBuffer = this.gl.createBuffer();
    this.indexBuffer = this.gl.createBuffer();
  },

  buildTexture(image) {
    const gl = this.gl;
    // create the texture object to draw data
    const texture = gl.createTexture();
    // bind it so we can do stuff with it
    gl.bindTexture(gl.TEXTURE_2D, texture);
    /**
     * tell the texture to use RGBA data, and pass the image data as an array of unsigned bytes (uint8) to it.
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
     * 1. The target type to use. Typically TEXTURE_2D is what you'll pass
     * 2. Level of detail to use, Level 0 is the base image level and level n is the nth mipmap reduction level.
     * 3. The internalformat to use, we want RGBA
     * 4. The format to use for the texel data, in WebGL 1 (which is what we're using), it has to be the same as the internal format.
     *    For simple purposes, you can think of a texel as a pixel on the texture, but it's a bit different from that, which you can read on here:
     *    http://whatis.techtarget.com/definition/texel-texture-element
     * 5. The type of the data we're going to pass, Uint8 in this case, or unsigned byte.
     * 6. The image data itself
     */
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // setup the min and max filters, to use nearest approximation. So if/when the image pulls up, it uses the nearest pixel to fill the extra space
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // unbind the texture
    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
  },

  compileShaders(vert, frag) {
    const gl = this.gl;
    // instantiate our own shader object. This is our own class for managing shader properties
    this.shader = new Shader(gl, vert, frag);
    const shader = this.shader;

    // grab the location of the vertex attribute, so we can pass data to it later
    shader.vertexPositionAttribute = gl.getAttribLocation(shader.shaderProgram, "aVertexPosition");
    // this tells webgl that this attribute will accept an array of data
    gl.enableVertexAttribArray(shader.vertexPositionAttribute);

    // grab the location of the texture coordinate, similar to the vertex coordinate
    shader.textureCoordAttribute = gl.getAttribLocation(shader.shaderProgram, "aTextureCoord");
    // enable this as an array as well
    gl.enableVertexAttribArray(shader.textureCoordAttribute);

    // store references to each uniform, so we can pass data to those as well.
    // Uniforms are a piece of data that stays the same when rasterizing all your data.
    // So for coordinate 0,0,0 and 1,0,0, it will be the same.
    shader.textureUniform = gl.getUniformLocation(shader.shaderProgram, "texture");
    shader.matrixUniform = gl.getUniformLocation(shader.shaderProgram, "uMatrix");
    shader.colorUniform = gl.getUniformLocation(shader.shaderProgram, "color");

    // instruct webgl to now use the compiled program
    gl.useProgram(this.shader.shaderProgram);
  },

  addPositionalData(vertexOffset, x1, y1, x2, y2, z) {
    // setup the top left coordinate of the square
    this.verts[vertexOffset] = x1;
    this.verts[vertexOffset + 1] = y1;
    this.verts[vertexOffset + 2] = z;

    // setup the top right coordinate of the square
    this.verts[vertexOffset + 3] = x2;
    this.verts[vertexOffset + 4] = y1;
    this.verts[vertexOffset + 5] = z;

    // setup the bottom left coordinate of the square
    this.verts[vertexOffset + 6] = x1;
    this.verts[vertexOffset + 7] = y2;
    this.verts[vertexOffset + 8] = z;

    // setup the bottom right coordinate of the square
    this.verts[vertexOffset + 9] = x2;
    this.verts[vertexOffset + 10] = y2;
    this.verts[vertexOffset + 11] = z;

    // the indices refer to a given coordinate, so 3 float values
    // so we take the current number of quads/squares, and multiply it by 6, since there are 6 indices per quad.
    // we then point our indices array to each group of 3 values in the verts array.
    // re-using the verts as we need to, to build the two triangles.

    /**
     * The indices go as follows:
     * 0 |-------------| 1
     *   |             |
     *   |             |
     *   |             |
     * 2 |-------------| 3
     * So we use 0, then 1, then 2 to make the first triangles
     * 2, then 3, then 1 to make the second.
     */

    const indiceOffset = this.quadCount * INDICES_PER_QUAD;
    const vertexIndex = vertexOffset / FLOATS_PER_VERT;
    this.indices[indiceOffset] = vertexIndex;
    this.indices[indiceOffset + 1] = vertexIndex + 1;
    this.indices[indiceOffset + 2] = vertexIndex + 2;
    this.indices[indiceOffset + 3] = vertexIndex + 2;
    this.indices[indiceOffset + 4] = vertexIndex + 3;
    this.indices[indiceOffset + 5] = vertexIndex + 1;
  },

  addRect(x1, y1, x2, y2) {
    // get the current index of the verts array
    const vertexOffset = this.getVertexIndex();
    // pass the top left and bottom right values to build the vertex data
    // use -0.05 so the rect appeears behind the images
    this.addPositionalData(vertexOffset, x1, y1, x2, y2, -0.05);

    // since we're drawing from the created texture, we want to draw the full texture.
    // so use 0,0 to 1,1 as the texture coordinates
    const tx1 = 0;
    const ty1 = 0;
    const tx2 = 1;
    const ty2 = 1;

    const textureOffset = this.getTextureIndex();

    // Here we map the texture coordinates to each corner, in the same order that the
    // vertex attributes are built

    /**
     * The texture coordinates map out as:
     * 0,0 |-------------| 1,0
     *     |             |
     *     |             |
     *     |             |
     * 0,1 |-------------| 1,1
     */

    this.textureCoords[textureOffset] = tx1;
    this.textureCoords[textureOffset + 1] = ty1;

    this.textureCoords[textureOffset + 2] = tx2;
    this.textureCoords[textureOffset + 3] = ty1;

    this.textureCoords[textureOffset + 4] = tx1;
    this.textureCoords[textureOffset + 5] = ty2;

    this.textureCoords[textureOffset + 6] = tx2;
    this.textureCoords[textureOffset + 7] = ty2;

    // increase the quad count, as with vertex & texture data, we have now completed a quad
    this.quadCount++;
  },

  addImage(x1, y1, x2, y2, atlas, region) {
    // get the current index of the verts array
    const vertexOffset = this.getVertexIndex();
    // pass the top left and bottom right values to build the vertex data
    // use 0 z so the image appears where the camera is looking at, and so it is infront of the coloured rectangles
    this.addPositionalData(vertexOffset, x1, y1, x2, y2, 0);

    // grab the x,y and dimension values of the region.
    // This is relative to the position of the gallery photo in the packed image file
    const sx = region.x;
    const sy = region.y;
    const sw = region.w;
    const sh = region.h;

    // convert the values to values between 0 & 1. This builds the texture coordinates
    const tx1 = sx / atlas.image.width;
    const ty1 = sy / atlas.image.height;
    const tx2 = ((sx + sw) / atlas.image.width);
    const ty2 = ((sy + sh) / atlas.image.height);

    const textureOffset = this.getTextureIndex();

    // Map the texture coordinates in the same order as done in addRect
    // TODO: Try refactoring this code into one method :)
    this.textureCoords[textureOffset] = tx1;
    this.textureCoords[textureOffset + 1] = ty1;

    this.textureCoords[textureOffset + 2] = tx2;
    this.textureCoords[textureOffset + 3] = ty1;

    this.textureCoords[textureOffset + 4] = tx1;
    this.textureCoords[textureOffset + 5] = ty2;

    this.textureCoords[textureOffset + 6] = tx2;
    this.textureCoords[textureOffset + 7] = ty2;

    this.quadCount++;
  },

  draw() {
    const gl = this.gl;

    // set the gl viewport to the pixel dimensions of the canvas, so it knows what size to rasterize to
    gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    // clear the background to black
    gl.clearColor(0, 0, 0, 1);
    // clear the drawing buffers of their data
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // pMatrix and mvMatrix are 4x4 matrices that we use for positioning & rotating our pieces of data around
    // matrices allow the vector2/3/4 values to be translated, rotated and scaled all in one go

    // set the perspective matrix to identity. You can think of an identity matrix as neutral
    mat4.identity(this.pMatrix);
    // set it up as the perspective values
    // Since we don't change the perspective matrix at all, we can technically call this once in setupGL
    // however leaving it here allows you to change the perspective values at runtime if you wish.

    // the first value is the out, so which matrix the computed values get set into
    // the second param is the field of view angle (in radians)
    // the 3rd param is the aspect ratio
    // the 4th is the near value
    // the 5th is the far
    // Objects that appear outside the fov, near and far, will not show on screen.
    mat4.perspective(this.pMatrix, 45 * Math.PI / 180, this.canvas.clientWidth / this.canvas.clientHeight, 1, 100);

    // only change the look at matrix if the camera has moved. Little bit of an optimization technique
    if (this.changeLookat) {
      this.changeLookat = false;
      // do the look at math based on our eye, center and up values
      mat4.lookAt(this.lookatMatrix, eye, center, up);
    }

    // reset the model view matrix
    mat4.identity(this.mvMatrix);
    // translate it based on our WASD/QE input values, effecting camera offset
    mat4.translate(this.mvMatrix, this.mvMatrix, this.cameraOffset);
    // multiply it by the look at
    mat4.multiply(this.mvMatrix, this.mvMatrix, this.lookatMatrix);
    // multiply the perspective by the model view. It must be done in this order, or it will not work properly.
    mat4.multiply(this.mvMatrix, this.pMatrix, this.mvMatrix);

    const shader = this.shader;
    // pass the matrix to the shader. We use 4fv to specify it is a mat4, of type float, and that it is an array of data
    gl.uniformMatrix4fv(shader.matrixUniform, false, this.mvMatrix);

    const atlas = this.atlas;
    // bind the atlas texture
    gl.bindTexture(gl.TEXTURE_2D, atlas.texture);
    // set the uniform color to white
    // TODO: Change this colour around to see how it modifies the image output
    gl.uniform3f(this.shader.colorUniform, 1.0, 1.0, 1.0);

    for (let i = 0; i < this.gallery.galleryImages.length; i++) {
      const galleryImage = this.gallery.galleryImages[i];
      const x1 = galleryImage.position.x;
      const y1 = galleryImage.position.y;
      // get the region data for the photo we wish to draw
      const region = atlas.regions[galleryImage.regionName];
      // determine the x1,y1,x2,y2 values and pass them to the addImage
      this.addImage(x1, y1, x1 + galleryImage.width, y1 - galleryImage.height, atlas, region);
    }

    // draw the images
    this.flushQuads();

    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);

    gl.uniform3f(this.shader.colorUniform, 0.47, 0.84, 0.96);

    for (let i = 0; i < this.gallery.galleryImages.length; i++) {
      const galleryImage = this.gallery.galleryImages[i];
      // make the rect a little bit bigger than the image
      const x1 = galleryImage.position.x - 0.02;
      const y1 = galleryImage.position.y + 0.02;
      const width = galleryImage.width + 0.04;
      const height = galleryImage.height + 0.04;
      // we subtract the height instead of add due to Y being reverse from image coordinates
      this.addRect(x1, y1, x1 + width, y1 - height);
    }

    // draw the rects
    this.flushQuads();
  },

  flushQuads() {
    const gl = this.gl;
    const shader = this.shader;
    // bind the buffer for position data, so we can pass data to it
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    // pass the data from the array to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, this.verts, gl.STATIC_DRAW);
    /**
     * 1. Tell it use our position attribute in the shader
     * 2. Uses 3 floats for the attribute
     * 3. The type of the data
     * 4. Whether to normalize the data values, we don't want this
     * 5. The byte offset between consecutive values. This is if you want to store texture & vertex data in one array, but only use it in certain chunks.
     * Example: http://stackoverflow.com/questions/16380005/opengl-3-4-glvertexattribpointer-stride-and-offset-miscalculation
     * 6. Essentially what index you want to start in of the array
     * Further info: http://docs.gl/es2/glVertexAttribPointer
     */
    gl.vertexAttribPointer(shader.vertexPositionAttribute, FLOATS_PER_VERT, gl.FLOAT, false, 0, 0);

    // same as above, but for the texture, bind its data to the shader
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.textureCoords, gl.STATIC_DRAW);
    // use 2 floats per vertex instead of 3. Since texture coords are s,t, not x,y,z
    gl.vertexAttribPointer(shader.textureCoordAttribute, FLOATS_PER_TEXTURE_VERT, gl.FLOAT, false, 0, 0);

    // pass the indices as an element_array_buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    /**
     * This draws the above data. https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
     * 1. The type of drawing we wish to do.
     * 2. The length of indices we're passing to the shader
     * 3. The type, in this case a Uint16
     * 4. offset in the array buffer, incase we add the indices at a different part of the buffer, instead of having a separate one.
     */
    gl.drawElements(gl.TRIANGLES, INDICES_PER_QUAD * MAX_QUADS_PER_BATCH, gl.UNSIGNED_SHORT, 0);

    // re-initialize our data
    this.initArrays();
    this.resetQuadCount();
  },

  getTextureIndex() {
    return this.quadCount * VERTS_PER_QUAD * FLOATS_PER_TEXTURE_VERT;
  },

  getVertexIndex() {
    return this.quadCount * VERTS_PER_QUAD * FLOATS_PER_VERT;
  },

  initArrays() {
    // These typed arrays are fixed in size once constructed.

    // builds an array of Float32 type, for the number of vertices we wish to pass to the shader
    this.verts = new Float32Array(MAX_QUADS_PER_BATCH * VERTS_PER_QUAD * FLOATS_PER_VERT);
    // builds an array of Float32 type, for the number of texture coords we wish to pass to the shader
    this.textureCoords = new Float32Array(MAX_QUADS_PER_BATCH * VERTS_PER_QUAD * FLOATS_PER_TEXTURE_VERT);
    // builds an array of Float32 type, for the number of indices we wish to pass to webgl
    this.indices = new Uint16Array(MAX_QUADS_PER_BATCH * INDICES_PER_QUAD);
  },

  initColorTexture() {
    const gl = this.gl;
    // create the texture object to draw data
    this.colorTexture = gl.createTexture();
    // bind it so we can do stuff with it
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
    // tell the texture to use RGBA data, and pass the 4 values to create a 2x2 image.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    // setup the min and max filters, to use nearest approximation. So if/when the image pulls up, it uses the nearest pixel to fill the extra space
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // unbind the texture
    gl.bindTexture(gl.TEXTURE_2D, null);
  },

  orbitCamera(x, z) {
    // set our eye position to the x & z based on the calculation for rotating around the target position
    eye[0] = x;
    eye[2] = z;

    // tell our draw method to update the look at matrix
    this.changeLookat = true;
  },

  resetQuadCount() {
    this.quadCount = 0;
  },

  setupGL(radius, atlas) {
    // setup our data arrays for drawing
    this.initArrays();
    this.resetQuadCount();
    const gl = this.gl;

    // enable depth drawing, and the alpha channel
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // setup our matrices, and our camera offset position. The offset is more of a world position for all the photos
    this.pMatrix = mat4.create();
    this.mvMatrix = mat4.create();
    this.cameraOffset = vec3.clone([0, 0, 0]);
    this.lookatMatrix = mat4.create();

    // set the z value away from the middle based on the radius
    eye[2] = radius;

    // set the default look at value
    mat4.lookAt(this.lookatMatrix, eye, center, up);

    // build the texture for drawing the photos
    atlas.texture = this.buildTexture(atlas.image);
    this.atlas = atlas;
    // setup the texture to use for pure colour calls
    this.initColorTexture();
  }
};
