// ─────────────────────────────────────────────────────────────────────────────
// Enemies — Rakshasa, Guard, Ravana boss
// FSM: patrol | chase | attack | stunned  (pixel-agents character pattern)
// ─────────────────────────────────────────────────────────────────────────────

class Enemy {
  constructor(x, y, type) {
    this.x    = x;
    this.y    = y;
    this.type = type;   // 'rakshasa' | 'guard' | 'ravana'
    this.dead = false;

    // Stats per type
    switch (type) {
      case 'guard':
        this.hp       = 2;
        this.maxHp    = 2;
        this.speed    = GUARD_SPEED;
        this.damage   = 1;
        break;
      case 'ravana':
        this.hp       = RAVANA_MAX_HP;
        this.maxHp    = RAVANA_MAX_HP;
        this.speed    = RAVANA_SPEED;
        this.damage   = 2;
        break;
      default: // rakshasa
        this.hp       = 1;
        this.maxHp    = 1;
        this.speed    = RAKSHASA_SPEED;
        this.damage   = 1;
    }

    // State machine (pixel-agents style: IDLE→PATROL→CHASE)
    this.state       = 'patrol';
    this.dir         = 'down';
    this.frame       = 0;
    this.frameTime   = 0;

    // Patrol path
    this.patrolStart = { x, y };
    this.patrolDir   = Math.random() < 0.5 ? 1 : -1;
    this.patrolAxis  = Math.random() < 0.5 ? 'h' : 'v';
    this.pauseTimer  = 0;

    // BFS path following (pixel-agents pattern)
    this.path        = [];
    this.pathTimer   = 0;   // recalculate path every N seconds

    // Damage cooldown
    this.damageCooldown = 0;
    this.hurtFlash     = 0;

    // Ravana: fireball cooldown
    this.fireballTimer   = Math.random() * RAVANA_FIREBALL_COOLDOWN;
    this.fireballs       = [];
    this.bubble          = null;
    this.bubbleTime      = 0;
  }

  update(dt, tilemap, player) {
    this.frameTime      += dt;
    this.damageCooldown  = Math.max(0, this.damageCooldown - dt);
    this.hurtFlash       = Math.max(0, this.hurtFlash - dt);
    this.bubbleTime      = Math.max(0, this.bubbleTime - dt);
    if (this.bubbleTime <= 0) this.bubble = null;

    const dx  = player.x - this.x;
    const dy  = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy) / TILE;

    // ── State transitions ───────────────────────────────────────────────────
    if (this.state !== 'stunned') {
      if (dist < CHASE_DIST) {
        this.state = 'chase';
      } else if (this.state === 'chase') {
        this.state = 'patrol';
        this.path  = [];
      }
    }

    // ── Behaviour per state ─────────────────────────────────────────────────
    switch (this.state) {
      case 'patrol':  this._doPatrol(dt, tilemap); break;
      case 'chase':   this._doChase(dt, tilemap, player); break;
      case 'stunned': this._doStunned(dt); break;
    }

    // ── Ravana fireballs ────────────────────────────────────────────────────
    if (this.type === 'ravana' && this.state === 'chase') {
      this.fireballTimer -= dt;
      if (this.fireballTimer <= 0) {
        this._shootFireball(player);
        this.fireballTimer = RAVANA_FIREBALL_COOLDOWN;
      }
      this.fireballs.forEach(f => f.update(dt, tilemap));
      this.fireballs = this.fireballs.filter(f => !f.dead);
    }

    // ── Contact damage to player ────────────────────────────────────────────
    if (this.state !== 'stunned' && this.damageCooldown <= 0) {
      const cdx = player.x - this.x;
      const cdy = player.y - this.y;
      const cdist = Math.sqrt(cdx * cdx + cdy * cdy) / TILE;
      if (cdist < ATTACK_DIST) {
        player.takeDamage(this.damage);
        this.damageCooldown = ENEMY_DAMAGE_COOLDOWN;
      }
    }

    this._updateAnimation();
  }

  _doPatrol(dt, tilemap) {
    if (this.pauseTimer > 0) {
      this.pauseTimer -= dt;
      return;
    }

    const step = this.speed * TILE * dt;
    let nx = this.x;
    let ny = this.y;

    if (this.patrolAxis === 'h') {
      nx += this.patrolDir * step;
      this.dir = this.patrolDir > 0 ? 'right' : 'left';
    } else {
      ny += this.patrolDir * step;
      this.dir = this.patrolDir > 0 ? 'down' : 'up';
    }

    if (this._canMoveTo(nx, ny, tilemap)) {
      const dist = Math.abs(nx - this.patrolStart.x) + Math.abs(ny - this.patrolStart.y);
      if (dist > 3 * TILE) {
        this.patrolDir *= -1;
        this.pauseTimer = PATROL_PAUSE_MIN + Math.random() * (PATROL_PAUSE_MAX - PATROL_PAUSE_MIN);
      } else {
        this.x = nx;
        this.y = ny;
      }
    } else {
      this.patrolDir *= -1;
      this.pauseTimer = PATROL_PAUSE_MIN;
    }
  }

  _doChase(dt, tilemap, player) {
    this.pathTimer -= dt;

    const startTile = tilemap.tileAt(this.x, this.y);
    const goalTile  = tilemap.tileAt(player.x, player.y);

    // Recalculate BFS path periodically (pixel-agents pattern)
    if (this.pathTimer <= 0 || this.path.length === 0) {
      this.path = tilemap.findPath(
        startTile.col, startTile.row,
        goalTile.col,  goalTile.row,
      ) || [];
      this.pathTimer = 0.4 + Math.random() * 0.2;
    }

    if (this.path.length === 0) {
      // Direct move if BFS has no path
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 1) {
        const nx = this.x + (dx / len) * this.speed * TILE * dt;
        const ny = this.y + (dy / len) * this.speed * TILE * dt;
        if (this._canMoveTo(nx, this.y, tilemap)) this.x = nx;
        if (this._canMoveTo(this.x, ny, tilemap)) this.y = ny;
        this.dir = Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? 'right' : 'left')
          : (dy > 0 ? 'down'  : 'up');
      }
      return;
    }

    // Walk toward next tile in BFS path
    const next   = this.path[0];
    const target = tilemap.tileCenterPx(next.col, next.row);
    const dx     = target.x - this.x;
    const dy     = target.y - this.y;
    const dist   = Math.sqrt(dx * dx + dy * dy);
    const step   = this.speed * TILE * dt;

    if (dist <= step) {
      this.x = target.x;
      this.y = target.y;
      this.path.shift();
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
    }

    this.dir = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'down'  : 'up');
  }

  _doStunned(dt) {
    // Just wait
  }

  _canMoveTo(nx, ny, tilemap) {
    const r = (CHAR_W / 2 - 3) * SCALE;
    const corners = [
      { x: nx - r, y: ny - r }, { x: nx + r, y: ny - r },
      { x: nx - r, y: ny + r }, { x: nx + r, y: ny + r },
    ];
    return corners.every(c => {
      const { col, row } = tilemap.tileAt(c.x, c.y);
      return tilemap.isWalkable(col, row);
    });
  }

  _shootFireball(player) {
    const dx  = player.x - this.x;
    const dy  = player.y - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return;
    this.fireballs.push(new Fireball(
      this.x, this.y,
      (dx / len) * FIREBALL_SPEED,
      (dy / len) * FIREBALL_SPEED,
    ));
    this.bubble     = '✦ AGNI!';
    this.bubbleTime = 0.8;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.hurtFlash = 0.15;
    if (this.hp <= 0) {
      this.hp   = 0;
      this.dead = true;
    }
  }

  _updateAnimation() {
    if (this.state === 'chase' || this.state === 'patrol') {
      if (this.frameTime >= WALK_FRAME_DUR) {
        this.frameTime = 0;
        this.frame = (this.frame + 1) % 4;
      }
    }
  }

  draw(ctx) {
    this.fireballs.forEach(f => f.draw(ctx));

    // Hurt flash
    if (this.hurtFlash > 0 && Math.floor(this.hurtFlash * 20) % 2 === 0) return;

    const isRavana = this.type === 'ravana';
    const SW = isRavana ? 24 : CHAR_W;
    const SH = isRavana ? 32 : CHAR_H;

    ctx.save();
    ctx.translate(
      Math.round(this.x - SW / 2 * SCALE),
      Math.round(this.y - SH / 2 * SCALE),
    );

    if (isRavana) {
      drawRavana(ctx, this.hp, this.frame);
    } else {
      drawRakshasa(ctx, this.dir, this.frame, this.state === 'patrol' ? 'walk' : 'walk');
    }
    ctx.restore();

    // Shadow
    ctx.fillStyle = C.SHADOW;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + SH * SCALE * 0.45, isRavana ? 16 : 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // HP bar (above head)
    if (this.maxHp > 1) {
      this._drawHpBar(ctx, SW, SH);
    }

    // Bubble
    if (this.bubble) {
      drawSpeechBubble(ctx, this.x, this.y - SH * SCALE * 0.6, this.bubble);
    }
  }

  _drawHpBar(ctx, SW, SH) {
    const bw  = SW * SCALE;
    const bh  = 3;
    const bx  = this.x - bw / 2;
    const by  = this.y - SH * SCALE * 0.55 - 6;
    const pct = this.hp / this.maxHp;

    ctx.fillStyle = '#1a0000';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = pct > 0.5 ? '#22cc22' : pct > 0.25 ? '#ccaa00' : '#cc2200';
    ctx.fillRect(bx, by, bw * pct, bh);
  }
}
