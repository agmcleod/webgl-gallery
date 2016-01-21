var Webgl = {
  initialize: function(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('experimental-webgl');
  },

  bindBuffers: function() {
    this.positionBuffer = this.gl.createBuffer();
    this.textureBuffer = this.gl.createBuffer();
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
    var shaderProgram = this.shader.shaderProgram;
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");

    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
  },

  draw: function() {
    var gl = this.gl;

    gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var shaderProgram = this.shader.shaderProgram;

    var matrixLocation = gl.getUniformLocation(shaderProgram, "uMatrix");

    gl.activeTexture(gl.TEXTURE0);
    var atlas = this.atlas;
    gl.bindTexture(gl.TEXTURE_2D, atlas.texture);

    for (var i = 0; i < this.gallery.galleryImages.length; i++) {
      mat3.identity(this.mvMatrix);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

      var galleryImage = this.gallery.galleryImages[i];
      var x1 = galleryImage.position.x;
      var y1 = galleryImage.position.y;

      var region = atlas.regions[galleryImage.regionName];

      var x2 = x1 + region.w;
      var y2 = y1 + region.h;
      var vertices = [
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2
      ];

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);

      var sx = region.x;
      var sy = region.y;
      var sw = region.w;
      var sh = region.h;

      var tx1 = sx / atlas.image.width;
      var ty1 = 1.0 - (sy / atlas.image.height);
      var tx2 = ((sx + sw) / atlas.image.width);
      var ty2 = 1.0 - ((sy + sh) / atlas.image.height);
      var textureCoords = [
        tx1, ty1,
        tx2, ty1,
        tx1, ty2,
        tx1, ty2,
        tx2, ty1,
        tx2, ty2
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
      gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

      mat3.multiply(this.mvMatrix, this.mvMatrix, [
        2 / this.canvas.clientWidth, 0, 0,
        0, -2 / this.canvas.clientHeight, 0,
        -1, 1, 1
      ]);

      gl.uniformMatrix3fv(matrixLocation, false, this.mvMatrix);
      gl.uniform1i(shaderProgram.samplerUniform, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
    }

    requestAnimationFrame(Webgl.draw);
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
