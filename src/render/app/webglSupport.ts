export function isWebGL2Available(createCanvas: () => HTMLCanvasElement = () => document.createElement("canvas")): boolean {
  try {
    const canvas = createCanvas();
    return Boolean(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

export function getWebGL2SupportMessage(): string {
  return "WebGL2 required. Please use a current desktop browser with hardware acceleration enabled.";
}
