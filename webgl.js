(function() {
  var MAX_QUADS_PER_BATCH = 100; // arbitrary for now
  var VERTS_PER_QUAD = 4;
  var INDICES_PER_QUAD = 6;
  var FLOATS_PER_VERT = 2;
  var Webgl = {
    cameraOffset: {x: 0, y: 0},
    initialize: function(canvas) {
      this.canvas = canvas;
      this.gl = canvas.getContext('experimental-webgl');
      this.initArrays();
    },

    createBuffers: function() {
      this.positionBuffer = this.gl.createBuffer();
      this.textureBuffer = this.gl.createBuffer();
      this.indexBuffer = this.gl.createBuffer();
    },

    buildTexture: function(image) {
      var gl = this.gl;
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.bindTexture(gl.TEXTURE_2D, null);

      return texture;
    },

    compileShaders: function(vert, frag) {
      var gl = this.gl;
      this.shader = new Shader(gl, vert, frag);
      var shader = this.shader;
      shader.vertexPositionAttribute = gl.getAttribLocation(shader.shaderProgram, "aVertexPosition");
      gl.enableVertexAttribArray(shader.vertexPositionAttribute);

      shader.textureCoordAttribute = gl.getAttribLocation(shader.shaderProgram, "aTextureCoord");

      gl.enableVertexAttribArray(shader.textureCoordAttribute);

      shader.samplerUniform = gl.getUniformLocation(shader.shaderProgram, "uSampler");
    },

    addQuad: function(x1, y1, x2, y2, atlas, region) {
      var vertexOffset = this.quadCount * VERTS_PER_QUAD * FLOATS_PER_VERT;
      this.verts[vertexOffset] = x1, this.verts[vertexOffset + 1] = y1;
      this.verts[vertexOffset + 2] = x2, this.verts[vertexOffset + 3] = y1;
      this.verts[vertexOffset + 4] = x1, this.verts[vertexOffset + 5] = y2;
      this.verts[vertexOffset + 6] = x2, this.verts[vertexOffset + 7] = y2;

      var indiceOffset = this.quadCount * INDICES_PER_QUAD;
      var vertexIndex = vertexOffset / 2;
      this.indices[indiceOffset] = vertexIndex;
      this.indices[indiceOffset + 1] = vertexIndex + 1;
      this.indices[indiceOffset + 2] = vertexIndex + 2;
      this.indices[indiceOffset + 3] = vertexIndex + 2;
      this.indices[indiceOffset + 4] = vertexIndex + 3;
      this.indices[indiceOffset + 5] = vertexIndex + 1;

      var sx = region.x;
      var sy = region.y;
      var sw = region.w;
      var sh = region.h;

      var tx1 = sx / atlas.image.width;
      var ty1 = 1.0 - (sy / atlas.image.height);
      var tx2 = ((sx + sw) / atlas.image.width);
      var ty2 = 1.0 - ((sy + sh) / atlas.image.height);

      this.textureCoords[vertexOffset] = tx1, this.textureCoords[vertexOffset + 1] = ty1;
      this.textureCoords[vertexOffset + 2] = tx2, this.textureCoords[vertexOffset + 3] = ty1;
      this.textureCoords[vertexOffset + 4] = tx1, this.textureCoords[vertexOffset + 5] = ty2;
      this.textureCoords[vertexOffset + 6] = tx2, this.textureCoords[vertexOffset + 7] = ty2;

      this.quadCount++;

      if (this.quadCount >= MAX_QUADS_PER_BATCH) {
        this.flushQuads();
      }
    },

    draw: function() {
      var gl = this.gl;

      gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      var shader = this.shader;

      var matrixLocation = gl.getUniformLocation(shader.shaderProgram, "uMatrix");

      gl.activeTexture(gl.TEXTURE0);
      var atlas = this.atlas;
      gl.bindTexture(gl.TEXTURE_2D, atlas.texture);
      mat3.identity(this.mvMatrix);

      mat3.translate(this.mvMatrix, this.mvMatrix, [
        this.cameraOffset.x, this.cameraOffset.y, 0,
        0, 0, 0,
        0, 0, 1
      ]);

      gl.uniformMatrix3fv(matrixLocation, false, this.mvMatrix);
      gl.uniform1i(shader.samplerUniform, 0);

      for (var i = 0; i < this.gallery.galleryImages.length; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        var galleryImage = this.gallery.galleryImages[i];
        var x1 = galleryImage.position.x;
        var y1 = galleryImage.position.y;

        var region = atlas.regions[galleryImage.regionName];
        this.addQuad(x1, y1, x1 + galleryImage.width, y1 + galleryImage.height, atlas, region);
      }

      if (this.quadCount > 0) {
        this.flushQuads();
      }
    },

    flushQuads: function() {
      var gl = this.gl;
      var shader = this.shader;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.verts, gl.STATIC_DRAW);
      gl.vertexAttribPointer(shader.vertexPositionAttribute, FLOATS_PER_VERT, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.textureCoords, gl.STATIC_DRAW);
      gl.vertexAttribPointer(shader.textureCoordAttribute, FLOATS_PER_VERT, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

      gl.drawElements(gl.TRIANGLES, INDICES_PER_QUAD * MAX_QUADS_PER_BATCH, gl.UNSIGNED_SHORT, 0);

      this.initArrays();
    },

    initArrays: function() {
      this.verts = new Float32Array(MAX_QUADS_PER_BATCH * VERTS_PER_QUAD * FLOATS_PER_VERT);
      this.textureCoords = new Float32Array(MAX_QUADS_PER_BATCH * VERTS_PER_QUAD * FLOATS_PER_VERT);
      this.indices = new Uint16Array(MAX_QUADS_PER_BATCH * INDICES_PER_QUAD);
      this.quadCount = 0;
    },

    setupGL: function(atlas) {
      var gl = this.gl;
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.mvMatrix = mat3.create();
      atlas.texture = this.buildTexture(atlas.image);
    }
  };
  window.Webgl = Webgl;
}).call(this);
