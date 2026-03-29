// ─────────────────────────────────────────────────────────────────────────────
// Game — main loop + state machine
// States: title → playing → level_complete → (next level or win) → game_over
// Main game loop and state management
// ─────────────────────────────────────────────────────────────────────────────

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.state        = STATE_TITLE;
    this.levelIndex   = 0;
    this.level        = null;
    this.score        = 0;

    this.lastTime     = 0;
    this.paused       = false;

    // Screen-transition overlay
    this.fadeAlpha    = 0;
    this.fadingOut    = false;
    this.fadeCallback = null;

    // Title / screen animation
    this.titleFrame   = 0;

    // Score tracking
    this.enemiesKilledPrev = 0;

    Input.init(canvas);
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  // ── Main loop ──────────────────────────────────────────────────────────────
  _loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this._update(dt);
    this._render();
    Input.flush();

    requestAnimationFrame(this._loop);
  }

  // ── Update ─────────────────────────────────────────────────────────────────
  _update(dt) {
    this.titleFrame++;

    // Fade transition
    if (this.fadingOut) {
      this.fadeAlpha = Math.min(1, this.fadeAlpha + dt * 3);
      if (this.fadeAlpha >= 1 && this.fadeCallback) {
        this.fadeCallback();
        this.fadeCallback = null;
        this.fadingOut = false;
      }
      return;
    }
    this.fadeAlpha = Math.max(0, this.fadeAlpha - dt * 2.5);

    switch (this.state) {
      case STATE_TITLE:          this._updateTitle(dt);         break;
      case STATE_PLAYING:        this._updatePlaying(dt);       break;
      case STATE_LEVEL_COMPLETE: this._updateLevelComplete(dt); break;
      case STATE_GAME_OVER:      this._updateGameOver(dt);      break;
      case STATE_WIN:            this._updateWin(dt);           break;
    }
  }

  _updateTitle(dt) {
    if (Input.wasPressed('Enter') || Input.wasPressed('Space') || Input.mouse.justClicked) {
      this._fadeToState(STATE_PLAYING, () => this._startLevel(0));
    }
  }

  _updatePlaying(dt) {
    if (Input.wasPressed('KeyP') || Input.wasPressed('Escape')) {
      this.paused = !this.paused;
    }
    if (this.paused) return;

    const prevEnemies = this.level.enemies.length;
    this.level.update(dt);
    const killed = prevEnemies - this.level.enemies.length;
    if (killed > 0) this.score += killed * 100;

    // Player death
    if (this.level.player.dead) {
      this._fadeToState(STATE_GAME_OVER);
      return;
    }

    // Level complete
    if (this.level.complete) {
      if (this.level.isLast) {
        this._fadeToState(STATE_WIN);
      } else {
        this._fadeToState(STATE_LEVEL_COMPLETE);
      }
    }
  }

  _updateLevelComplete(dt) {
    if (Input.wasPressed('Enter') || Input.wasPressed('Space') || Input.mouse.justClicked) {
      const next = this.levelIndex + 1;
      this._fadeToState(STATE_PLAYING, () => this._startLevel(next));
    }
  }

  _updateGameOver(dt) {
    if (Input.wasPressed('Enter') || Input.wasPressed('Space') || Input.mouse.justClicked) {
      this.score = 0;
      this._fadeToState(STATE_PLAYING, () => this._startLevel(0));
    }
  }

  _updateWin(dt) {
    if (Input.wasPressed('Enter') || Input.wasPressed('Space') || Input.mouse.justClicked) {
      this.score = 0;
      this.state = STATE_TITLE;
    }
  }

  _startLevel(index) {
    this.levelIndex = index;
    this.level      = new Level(index);
  }

  _fadeToState(state, callback) {
    this.fadingOut    = true;
    this.fadeCallback = () => {
      this.state = state;
      if (callback) callback();
    };
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  _render() {
    const { ctx } = this;
    ctx.fillStyle = C.BG;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    switch (this.state) {
      case STATE_TITLE:          this._renderTitle(ctx);         break;
      case STATE_PLAYING:        this._renderPlaying(ctx);       break;
      case STATE_LEVEL_COMPLETE: this._renderLevelComplete(ctx); break;
      case STATE_GAME_OVER:      this._renderGameOver(ctx);      break;
      case STATE_WIN:            this._renderWin(ctx);           break;
    }

    // Fade overlay
    if (this.fadeAlpha > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this.fadeAlpha})`;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
  }

  _renderPlaying(ctx) {
    this.level.draw(ctx);
    HUD.draw(ctx, this.level.player, this.levelIndex, this.level.def.name, this.score);

    // Pause overlay
    if (this.paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      this._drawCenteredText(ctx, 'PAUSED', CANVAS_H / 2 - 20, C.GOLD_B, `bold 32px serif`);
      this._drawCenteredText(ctx, 'Press P to resume', CANVAS_H / 2 + 20, C.GOLD, `14px 'Courier New'`);
    }
  }

  // ── Title screen ───────────────────────────────────────────────────────────
  _renderTitle(ctx) {
    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;

    // Starfield background
    this._drawStarfield(ctx);

    // Draw decorative Rama silhouette
    ctx.save();
    ctx.translate(cx - 8 * SCALE, cy - 80);
    drawRama(ctx, 'right', Math.floor(this.titleFrame / 8) % 4, 'walk');
    ctx.restore();

    // Title
    ctx.save();
    ctx.shadowColor = C.GOLD;
    ctx.shadowBlur  = 20 + Math.sin(this.titleFrame * 0.05) * 8;
    ctx.fillStyle   = C.GOLD_B;
    ctx.font        = `bold 56px serif`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RAMAYANA', cx, cy - 20);
    ctx.restore();

    ctx.fillStyle   = C.GOLD;
    ctx.font        = `italic 16px serif`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('The Epic Journey of Rama', cx, cy + 20);

    // Blinking prompt
    if (Math.floor(this.titleFrame / 30) % 2 === 0) {
      ctx.fillStyle   = C.WHITE;
      ctx.font        = `12px 'Courier New', monospace`;
      ctx.fillText('Press ENTER or SPACE to begin', cx, cy + 65);
    }

    // Controls
    ctx.fillStyle   = 'rgba(200,180,100,0.6)';
    ctx.font        = `11px 'Courier New', monospace`;
    ctx.fillText('Move: WASD / Arrow Keys     Shoot: Space / Click', cx, cy + 100);

    // Version watermark
    ctx.fillStyle   = 'rgba(255,255,255,0.2)';
    ctx.font        = `9px monospace`;
    ctx.textAlign   = 'right';
    ctx.fillText('v1.0', CANVAS_W - 8, CANVAS_H - 8);
  }

  // ── Level complete screen ──────────────────────────────────────────────────
  _renderLevelComplete(ctx) {
    if (this.level) this.level.draw(ctx);

    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const nextDef = LEVELS[this.levelIndex + 1];
    this._drawCenteredText(ctx, 'Level Complete!', CANVAS_H / 2 - 60, C.GOLD_B, `bold 28px serif`);
    this._drawCenteredText(ctx, `Score: ${this.score}`, CANVAS_H / 2 - 20, C.GOLD, `bold 16px 'Courier New'`);
    this._drawCenteredText(ctx, `Next: ${nextDef ? nextDef.name : ''}`, CANVAS_H / 2 + 18, C.WHITE, `italic 14px serif`);

    if (Math.floor(this.titleFrame / 25) % 2 === 0) {
      this._drawCenteredText(ctx, 'Press ENTER / SPACE to continue', CANVAS_H / 2 + 60, C.GOLD, `12px 'Courier New'`);
    }
  }

  // ── Game over screen ───────────────────────────────────────────────────────
  _renderGameOver(ctx) {
    if (this.level) this.level.draw(ctx);

    ctx.fillStyle = 'rgba(30,0,0,0.80)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    this._drawCenteredText(ctx, 'RAMA HAS FALLEN', CANVAS_H / 2 - 40, '#ff4444', `bold 30px serif`);
    this._drawCenteredText(ctx, 'The demons rejoice...', CANVAS_H / 2, C.GOLD, `italic 15px serif`);
    this._drawCenteredText(ctx, `Final Score: ${this.score}`, CANVAS_H / 2 + 40, C.WHITE, `bold 14px 'Courier New'`);

    if (Math.floor(this.titleFrame / 25) % 2 === 0) {
      this._drawCenteredText(ctx, 'Press ENTER to try again', CANVAS_H / 2 + 80, C.GOLD, `12px 'Courier New'`);
    }
  }

  // ── Win screen ─────────────────────────────────────────────────────────────
  _renderWin(ctx) {
    this._drawStarfield(ctx);

    // Golden glow
    ctx.save();
    const gradient = ctx.createRadialGradient(CANVAS_W/2, CANVAS_H/2, 0, CANVAS_W/2, CANVAS_H/2, 300);
    gradient.addColorStop(0, 'rgba(255,200,0,0.15)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.restore();

    const cx = CANVAS_W / 2;

    // Draw Rama + Sita silhouettes
    ctx.save();
    ctx.translate(cx - 30 * SCALE, CANVAS_H / 2 - 30);
    drawRama(ctx, 'right', 0, 'idle');
    ctx.restore();

    ctx.save();
    ctx.shadowColor = C.GOLD_B;
    ctx.shadowBlur  = 30;
    this._drawCenteredText(ctx, 'VICTORY!', CANVAS_H / 2 - 80, C.GOLD_B, `bold 48px serif`);
    ctx.restore();

    this._drawCenteredText(ctx, 'Sita is free!  Rama returns to Ayodhya.', CANVAS_H / 2 - 30, C.GOLD, `italic 16px serif`);
    this._drawCenteredText(ctx, 'Dharma is restored.', CANVAS_H / 2, C.WHITE, `italic 14px serif`);
    this._drawCenteredText(ctx, `Final Score: ${this.score}`, CANVAS_H / 2 + 40, C.GOLD_B, `bold 16px 'Courier New'`);

    if (Math.floor(this.titleFrame / 30) % 2 === 0) {
      this._drawCenteredText(ctx, 'Press ENTER to play again', CANVAS_H / 2 + 90, C.GOLD, `12px 'Courier New'`);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _drawCenteredText(ctx, text, y, color, font) {
    ctx.save();
    ctx.fillStyle    = color;
    ctx.font         = font;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, CANVAS_W / 2, y);
    ctx.restore();
  }

  _drawStarfield(ctx) {
    // Static star pattern derived from canvas size
    ctx.fillStyle = C.BG_TITLE;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = 'rgba(255,255,200,0.6)';
    // Deterministic pseudo-random stars
    for (let i = 0; i < 120; i++) {
      const sx = ((i * 137.508 + 50) % CANVAS_W);
      const sy = ((i * 97.331  + 20) % CANVAS_H);
      const pulse = 0.4 + Math.sin(this.titleFrame * 0.03 + i) * 0.3;
      ctx.globalAlpha = pulse;
      ctx.fillRect(sx, sy, 1, 1);
    }
    ctx.globalAlpha = 1;
  }
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  window._game = new Game(canvas);
});
