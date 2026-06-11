export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.mouse = new Set();
    this.lookDX = 0;
    this.lookDY = 0;
    this.wheel = 0;
    this.locked = false;
    this._drag = null;

    window.addEventListener('keydown', (e) => {
      if (!e.repeat) this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.mouse.clear();
      this._drag = null;
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('mousedown', (e) => {
      this.mouse.add(e.button);
      if (!this.locked && e.button === 0) {
        canvas.requestPointerLock?.();
        this._drag = { x: e.clientX, y: e.clientY };
      }
    });
    window.addEventListener('mouseup', (e) => {
      this.mouse.delete(e.button);
      this._drag = null;
    });
    window.addEventListener('mousemove', (e) => {
      if (this.locked) {
        this.lookDX += e.movementX;
        this.lookDY += e.movementY;
      } else if (this._drag) {
        this.lookDX += e.clientX - this._drag.x;
        this.lookDY += e.clientY - this._drag.y;
        this._drag = { x: e.clientX, y: e.clientY };
      }
    });
    canvas.addEventListener('wheel', (e) => {
      this.wheel += e.deltaY;
    }, { passive: true });

    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
    });
  }

  pressed(...codes) {
    return codes.some((c) => this.keys.has(c));
  }

  consumeLook() {
    const d = { dx: this.lookDX, dy: this.lookDY };
    this.lookDX = 0;
    this.lookDY = 0;
    return d;
  }

  consumeWheel() {
    const w = this.wheel;
    this.wheel = 0;
    return w;
  }

  releaseLock() {
    if (this.locked) document.exitPointerLock?.();
  }
}
