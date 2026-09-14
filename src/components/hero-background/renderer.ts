import { SKY_COMPOSITE_SHADER, SKY_FRAGMENT_SHADER, SKY_VERTEX_SHADER } from "./shaders";
import { createSkyTarget } from "./renderTarget";

const MAX_PIXEL_RATIO = 1.5;
const MAX_RENDER_PIXELS = 2_000_000;
// Smooth atmospheric fields need fewer samples; the composite keeps stars sharp.
const ATMOSPHERE_SCALE = 0.5;

export interface SkyFrame {
  time: number;
  daylight: number;
  motionEnabled: boolean;
  pointer: { x: number; y: number };
}

export interface SkyRenderer {
  resize: () => boolean;
  draw: (frame: SkyFrame) => void;
  dispose: () => void;
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create sky shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    throw new Error("Unable to compile sky shader");
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, fragmentSource: string) {
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create sky program");
  const shaders: WebGLShader[] = [];
  try {
    shaders.push(compileShader(gl, gl.VERTEX_SHADER, SKY_VERTEX_SHADER));
    shaders.push(compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
    shaders.forEach((shader) => gl.attachShader(program, shader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error("Unable to link sky program");
    }
    return program;
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  } finally {
    shaders.forEach((shader) => gl.deleteShader(shader));
  }
}

function createPass(gl: WebGL2RenderingContext, fragmentSource: string) {
  const program = createProgram(gl, fragmentSource);
  return {
    program,
    resolution: gl.getUniformLocation(program, "res"),
    time: gl.getUniformLocation(program, "t"),
    pointer: gl.getUniformLocation(program, "mouse"),
    daylight: gl.getUniformLocation(program, "dayMix"),
    motionEnabled: gl.getUniformLocation(program, "motionEnabled"),
  };
}

function drawPass(
  gl: WebGL2RenderingContext,
  pass: ReturnType<typeof createPass>,
  { time, daylight, pointer, motionEnabled }: SkyFrame,
) {
  gl.useProgram(pass.program);
  gl.uniform1f(pass.time, time);
  gl.uniform2f(pass.pointer, pointer.x, pointer.y);
  gl.uniform1f(pass.daylight, daylight);
  gl.uniform1i(pass.motionEnabled, motionEnabled ? 1 : 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

export function createSkyRenderer(canvas: HTMLCanvasElement): SkyRenderer | null {
  let gl: WebGL2RenderingContext | null;
  try {
    gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }
  if (!gl) return null;

  const programs: WebGLProgram[] = [];
  let target: ReturnType<typeof createSkyTarget> | undefined;
  function dispose() {
    target?.dispose();
    programs.forEach((program) => gl!.deleteProgram(program));
  }

  try {
    const atmosphere = createPass(gl, SKY_FRAGMENT_SHADER);
    programs.push(atmosphere.program);
    const composite = createPass(gl, SKY_COMPOSITE_SHADER);
    programs.push(composite.program);
    const skyTarget = createSkyTarget(gl);
    target = skyTarget;
    gl.useProgram(composite.program);
    gl.uniform1i(gl.getUniformLocation(composite.program, "skyTexture"), 0);
    let atmosphereWidth = 0;
    let atmosphereHeight = 0;

    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        MAX_PIXEL_RATIO,
        Math.sqrt(MAX_RENDER_PIXELS / (width * height)),
      );
      const renderWidth = Math.max(1, Math.floor(width * ratio));
      const renderHeight = Math.max(1, Math.floor(height * ratio));
      if (canvas.width === renderWidth && canvas.height === renderHeight && atmosphereWidth > 0) {
        return false;
      }
      canvas.width = renderWidth;
      canvas.height = renderHeight;
      atmosphereWidth = Math.max(1, Math.ceil(renderWidth * ATMOSPHERE_SCALE));
      atmosphereHeight = Math.max(1, Math.ceil(renderHeight * ATMOSPHERE_SCALE));
      skyTarget.resize(atmosphereWidth, atmosphereHeight);
      for (const pass of [atmosphere, composite]) {
        gl.useProgram(pass.program);
        gl.uniform2f(pass.resolution, renderWidth, renderHeight);
      }
      return true;
    };

    resize();
    return {
      resize,
      draw(frame) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, skyTarget.framebuffer);
        gl.viewport(0, 0, atmosphereWidth, atmosphereHeight);
        drawPass(gl, atmosphere, frame);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, skyTarget.texture);
        drawPass(gl, composite, frame);
      },
      dispose,
    };
  } catch {
    dispose();
    return null;
  }
}
