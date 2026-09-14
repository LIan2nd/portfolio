export function createSkyTarget(gl: WebGL2RenderingContext) {
  const texture = gl.createTexture();
  const framebuffer = gl.createFramebuffer();
  if (!texture || !framebuffer) {
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(framebuffer);
    throw new Error("Unable to create sky render target");
  }

  let useFloat = Boolean(gl.getExtension("EXT_color_buffer_float"));
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  function allocate(width: number, height: number) {
    gl.texImage2D(
      gl.TEXTURE_2D, 0, useFloat ? gl.RGBA16F : gl.RGBA8,
      width, height, 0, gl.RGBA, useFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null,
    );
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  }

  return {
    texture,
    framebuffer,
    resize(width: number, height: number) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      let isComplete = allocate(width, height);
      if (!isComplete && useFloat) {
        useFloat = false;
        isComplete = allocate(width, height);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.bindTexture(gl.TEXTURE_2D, null);
      if (!isComplete) throw new Error("Unable to allocate sky render target");
    },
    dispose() {
      gl.deleteTexture(texture);
      gl.deleteFramebuffer(framebuffer);
    },
  };
}
