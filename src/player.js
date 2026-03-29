// ─────────────────────────────────────────────────────────────────────────────
// Player — Rama
// State machine: idle | walk | shoot  (mirrors pixel-agents character FSM)
// ─────────────────────────────────────────────────────────────────────────────

class Player {
  constructor(x, y) {
    // Position = canvas-pixel center
    this.x  = x;
    this.y  = y;
    this.hp = PLAYER_MAX_HP;

    // Movement
    this.vx = 0;
    this.vy = 0;

    // State machine (pixel-agents style)
    this.state     = 'idle';   // 'idle' | 'walk' | 'shoot'
    this.dir       = 'down';   // 'down' | 'up' | 'left' | 'right'
    this.frame     = 0;
    this.frameTime = 0;

    // Combat
    this.arrowCooldown  = 0;
    this.invincibleTime = 0;  // seconds of post-hit invincibility
    this.shootFlash     = 0;  // cosmetic flash when firing
    this.arrows         = [];

    // Scratch vectors
    this._tx = x;
    this._ty = y;

    this.dead = false;

    // Bubble shown briefly after gaining a pickup
    this.bubble     = null;
    this.bubbleTime = 0;
  }

  // ── Update ─────────────────────────────────────────────────────────────────
  update(dt, tilemap) {
    this.frameTime      += dt;
    this.arrowCooldown  = Math.max(0, this.arrowCooldown - dt);
    this.invincibleTime = Math.max(0, this.invincibleTime - dt);
    this.shootFlash     = Math.max(0, this.shootFlash - dt);
    this.bubbleTime     = Math.max(0, this.bubbleTime - dt);
    if (this.bubbleTime <= 0) this.bubble = null;

    this._handleMovement(dt, tilemap);
    this._handleShooting(dt);
    this._updateArrows(dt, tilemap);
    this._updateAnimation(dt);
  }

  _handleMovement(dt, tilemap) {
    const mx = Input.moveX;
    const my = Input.moveY;
    const moving = mx !== 0 || my !== 0;

    if (moving) {
      // Update facing direction
      if (Math.abs(mx) >= Math.abs(my)) {
        this.dir = mx > 0 ? 'right' : 'left';
      } else {
        this.dir = my > 0 ? 'down' : 'up';
      }

      // Normalise diagonal movement
      const len = Math.sqrt(mx * mx + my * my);
      const speed = PLAYER_SPEED * TILE * dt;

      const nx = this.x + (mx / len) * speed;
      const ny = this.y + (my / len) * speed;

      // Axis-separated collision (same approach as pixel-agents)
      if (this._canMoveTo(nx, this.y, tilemap)) this.x = nx;
      if (this._canMoveTo(this.x, ny, tilemap)) this.y = ny;

      if (this.state !== 'shoot') this.state = 'walk';
    } else {
      if (this.state === 'walk') this.state = 'idle';
    }
  }

  _canMoveTo(nx, ny, tilemap) {
    const r = (CHAR_W / 2 - 2) * SCALE;  // collision radius
    const corners = [
      { x: nx - r, y: ny - r },
      { x: nx + r, y: ny - r },
      { x: nx - r, y: ny + r },
      { x: nx + r, y: ny + r },
    ];
    return corners.every(c => {
      const { col, row } = tilemap.tileAt(c.x, c.y);
      return tilemap.isWalkable(col, row);
    });
  }

  _handleShooting(dt) {
    const wantsShoot = Input.wasPressed('Space')
                    || Input.mouse.justClicked;

    if (wantsShoot && this.arrowCooldown <= 0) {
      this._fireArrow();
      this.arrowCooldown = ARROW_COOLDOWN;
      this.state = 'shoot';
      this.shootFlash = 0.12;
    }
    // Return to idle/walk after brief shoot pose
    if (this.state === 'shoot' && this.shootFlash <= 0) {
      const mx = Input.moveX;
      const my = Input.moveY;
      this.state = (mx !== 0 || my !== 0) ? 'walk' : 'idle';
    }
  }

  _fireArrow() {
    // Aim toward mouse, or in facing direction if no mouse delta
    const canvas = document.getElementById('game-canvas');
    const rect   = canvas.getBoundingClientRect();
    const mx     = Input.mouse.x;
    const my     = Input.mouse.y;

    let ax, ay;
    // If mouse is within canvas bounds, aim at cursor
    if (mx >= 0 && mx <= CANVAS_W && my >= 0 && my <= CANVAS_H) {
      const dx = mx - this.x;
      const dy = my - this.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 5) {
        ax = dx / len;
        ay = dy / len;
      }
    }
    // Fallback: aim in facing direction
    if (!ax) {
      const dirs = { right:[1,0], left:[-1,0], down:[0,1], up:[0,-1] };
      [ax, ay] = dirs[this.dir] || [1, 0];
    }

    this.arrows.push(new Arrow(this.x, this.y, ax * ARROW_SPEED, ay * ARROW_SPEED));
  }

  _updateArrows(dt, tilemap) {
    this.arrows.forEach(a => a.update(dt, tilemap));
    this.arrows = this.arrows.filter(a => !a.dead);
  }

  _updateAnimation(dt) {
    if (this.state === 'walk') {
      if (this.frameTime >= WALK_FRAME_DUR) {
        this.frameTime = 0;
        this.frame = (this.frame + 1) % 4;
      }
    } else {
      this.frame = 0;
      this.frameTime = 0;
    }
  }

  // ── Take damage ────────────────────────────────────────────────────────────
  takeDamage(amount) {
    if (this.invincibleTime > 0) return;
    this.hp -= amount;
    this.invincibleTime = INVINCIBLE_TIME;
    if (this.hp <= 0) {
      this.hp   = 0;
      this.dead = true;
    }
  }

  heal(amount) {
    this.hp = Math.min(PLAYER_MAX_HP, this.hp + amount);
    this.showBubble('♥ +1');
  }

  showBubble(text) {
    this.bubble     = text;
    this.bubbleTime = 1.5;
  }

  // ── Draw ───────────────────────────────────────────────────────────────────
  draw(ctx) {
    // Draw arrows first (behind player)
    this.arrows.forEach(a => a.draw(ctx));

    // Invincibility flicker
    if (this.invincibleTime > 0 && Math.floor(this.invincibleTime * 10) % 2 === 0) return;

    ctx.save();
    ctx.translate(
      Math.round(this.x - CHAR_W / 2 * SCALE),
      Math.round(this.y - CHAR_H / 2 * SCALE),
    );

    // Shoot flash glow
    if (this.shootFlash > 0) {
      ctx.shadowColor = C.GOLD_B;
      ctx.shadowBlur  = 12;
    }

    drawRama(ctx, this.dir, this.frame, this.state);

    ctx.restore();

    // Speech bubble (pickup notification)
    if (this.bubble) {
      drawSpeechBubble(ctx, this.x, this.y - CHAR_H * SCALE * 0.6, this.bubble);
    }

    // Shadow ellipse under feet
    ctx.fillStyle = C.SHADOW;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + CHAR_H * SCALE * 0.45, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
