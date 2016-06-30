import Shader from './shader';

const MAX_QUADS_PER_BATCH = 100; // arbitrary for now
const VERTS_PER_QUAD = 4;
const INDICES_PER_QUAD = 6;
const FLOATS_PER_VERT = 3;
const FLOATS_PER_TEXTURE_VERT = 2;

const eye = vec3.create();
const center = vec3.create();
const up = vec3.clone([0, 1, 0]);

export default {
  initialize(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('experimental-webgl');
  },

  createBuffers() {
    this.positionBuffer = this.gl.createBuffer();
    this.textureBuffer = this.gl.createBuffer();
    this.indexBuffer = this.gl.createBuffer();
  },

  buildTexture(image) {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
  },

  compileShaders(vert, frag) {
    const gl = this.gl;
    this.shader = new Shader(gl, vert, frag);
    const shader = this.shader;
    shader.vertexPositionAttribute = gl.getAttribLocation(shader.shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shader.vertexPositionAttribute);

    shader.textureCoordAttribute = gl.getAttribLocation(shader.shaderProgram, "aTextureCoord");

    gl.enableVertexAttribArray(shader.textureCoordAttribute);

    shader.textureUniform = gl.getUniformLocation(shader.shaderProgram, "texture");
    shader.matrixUniform = gl.getUniformLocation(shader.shaderProgram, "uMatrix");
    shader.colorUniform = gl.getUniformLocation(shader.shaderProgram, "color");
    gl.useProgram(this.shader.shaderProgram);
  },

  addPositionalData(vertexOffset, x1, y1, x2, y2, z) {
    this.verts[vertexOffset] = x1;
    this.verts[vertexOffset + 1] = y1;
    this.verts[vertexOffset + 2] = z;

    this.verts[vertexOffset + 3] = x2;
    this.verts[vertexOffset + 4] = y1;
    this.verts[vertexOffset + 5] = z;

    this.verts[vertexOffset + 6] = x1;
    this.verts[vertexOffset + 7] = y2;
    this.verts[vertexOffset + 8] = z;

    this.verts[vertexOffset + 9] = x2;
    this.verts[vertexOffset + 10] = y2;
    this.verts[vertexOffset + 11] = z;

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
    const vertexOffset = this.getVertexIndex();
    this.addPositionalData(vertexOffset, x1, y1, x2, y2, -0.05);

    const tx1 = 0;
    const ty1 = 0;
    const tx2 = 1;
    const ty2 = 1;

    const textureOffset = this.getTextureIndex();

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

  addImage(x1, y1, x2, y2, atlas, region) {
    const vertexOffset = this.getVertexIndex();
    this.addPositionalData(vertexOffset, x1, y1, x2, y2, 0);

    const sx = region.x;
    const sy = region.y;
    const sw = region.w;
    const sh = region.h;

    const tx1 = sx / atlas.image.width;
    const ty1 = (sy / atlas.image.height);
    const tx2 = ((sx + sw) / atlas.image.width);
    const ty2 = ((sy + sh) / atlas.image.height);

    const textureOffset = this.getTextureIndex();

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

    gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const shader = this.shader;

    gl.activeTexture(gl.TEXTURE0);
    mat4.identity(this.pMatrix);
    mat4.perspective(this.pMatrix, 45 * Math.PI / 180, this.canvas.clientWidth / this.canvas.clientHeight, 1, 100);

    if (this.changeLookat) {
      this.changeLookat = false;
      mat4.lookAt(this.lookatMatrix, eye, center, up);
    }

    mat4.identity(this.mvMatrix);
    mat4.translate(this.mvMatrix, this.mvMatrix, this.cameraOffset);
    mat4.multiply(this.mvMatrix, this.mvMatrix, this.lookatMatrix);
    mat4.multiply(this.mvMatrix, this.pMatrix, this.mvMatrix);

    gl.uniformMatrix4fv(shader.matrixUniform, false, this.mvMatrix);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    const atlas = this.atlas;
    gl.uniform1i(shader.textureUniform, 0);
    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, atlas.texture);

    gl.uniform3f(this.shader.colorUniform, 1.0, 1.0, 1.0);

    for (let i = 0; i < this.gallery.galleryImages.length; i++) {
      const galleryImage = this.gallery.galleryImages[i];
      const x1 = galleryImage.position.x;
      const y1 = galleryImage.position.y;
      const region = atlas.regions[galleryImage.regionName];
      this.addImage(x1, y1, x1 + galleryImage.width, y1 - galleryImage.height, atlas, region);
    }

    this.flushQuads();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);

    gl.uniform3f(this.shader.colorUniform, 0.47, 0.84, 0.96);

    for (let i = 0; i < this.gallery.galleryImages.length; i++) {
      const galleryImage = this.gallery.galleryImages[i];
      const x1 = galleryImage.position.x - 0.02;
      const y1 = galleryImage.position.y + 0.02;
      const width = galleryImage.width + 0.04;
      const height = galleryImage.height + 0.04;
      this.addRect(x1, y1, x1 + width, y1 - height);
    }

    this.flushQuads();
  },

  flushQuads() {
    const gl = this.gl;
    const shader = this.shader;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(shader.vertexPositionAttribute, FLOATS_PER_VERT, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.textureCoords, gl.STATIC_DRAW);
    gl.vertexAttribPointer(shader.textureCoordAttribute, FLOATS_PER_TEXTURE_VERT, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.drawElements(gl.TRIANGLES, INDICES_PER_QUAD * MAX_QUADS_PER_BATCH, gl.UNSIGNED_SHORT, 0);

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
    this.verts = new Float32Array(MAX_QUADS_PER_BATCH * VERTS_PER_QUAD * FLOATS_PER_VERT);
    this.textureCoords = new Float32Array(MAX_QUADS_PER_BATCH * VERTS_PER_QUAD * FLOATS_PER_TEXTURE_VERT);
    this.indices = new Uint16Array(MAX_QUADS_PER_BATCH * INDICES_PER_QUAD);
  },

  initColorTexture() {
    const gl = this.gl;
    this.colorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
  },

  orbitCamera(x, z) {
    eye[0] = x;
    eye[2] = z;
    this.changeLookat = true;
  },

  resetQuadCount() {
    this.quadCount = 0;
  },

  setupGL(radius, atlas) {
    this.initArrays();
    this.resetQuadCount();
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.pMatrix = mat4.create();
    this.mvMatrix = mat4.create();
    this.cameraOffset = vec3.clone([0, 0, 0]);
    this.lookatMatrix = mat4.create();

    eye[2] = radius;

    mat4.lookAt(this.lookatMatrix, eye, center, up);

    atlas.texture = this.buildTexture(atlas.image);
    this.initColorTexture();
  }
};
