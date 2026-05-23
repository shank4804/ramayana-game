export class InputState {
  constructor() {
    this.keys = new Set();
    this.mouseButtons = new Set();
    this.pointer = { dragging: false, lastX: 0, lastY: 0 };
  }

  isPressed(...codes) {
    return codes.some(code => this.keys.has(code));
  }
}
