// ─────────────────────────────────────────────────────────────────────────────
// Input — keyboard + mouse state
// ─────────────────────────────────────────────────────────────────────────────

const Input = {
  keys: {},        // raw held state
  justPressed: {}, // true only the frame it was pressed
  mouse: { x: 0, y: 0, down: false, justClicked: false },

  _canvas: null,

  init(canvas) {
    this._canvas = canvas;

    window.addEventListener('keydown', e => {
      if (!this.keys[e.code]) this.justPressed[e.code] = true;
      this.keys[e.code] = true;
      // Prevent arrow key scrolling
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) {
        this.mouse.down = true;
        this.mouse.justClicked = true;
      }
    });

    canvas.addEventListener('mouseup', e => {
      if (e.button === 0) this.mouse.down = false;
    });

    // Touch support
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = t.clientX - rect.left;
      this.mouse.y = t.clientY - rect.top;
      this.mouse.down = true;
      this.mouse.justClicked = true;
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      this.mouse.down = false;
    }, { passive: false });
  },

  // Call once per frame AFTER processing
  flush() {
    this.justPressed = {};
    this.mouse.justClicked = false;
  },

  isDown(code)    { return !!this.keys[code]; },
  wasPressed(code){ return !!this.justPressed[code]; },

  // Directional helpers
  get moveX() {
    return (this.isDown('ArrowRight') || this.isDown('KeyD') ? 1 : 0)
         - (this.isDown('ArrowLeft')  || this.isDown('KeyA') ? 1 : 0);
  },
  get moveY() {
    return (this.isDown('ArrowDown')  || this.isDown('KeyS') ? 1 : 0)
         - (this.isDown('ArrowUp')    || this.isDown('KeyW') ? 1 : 0);
  },
};
