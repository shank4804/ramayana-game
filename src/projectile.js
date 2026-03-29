// ─────────────────────────────────────────────────────────────────────────────
// Projectiles — Arrows (player) and Fireballs (Ravana)
// ─────────────────────────────────────────────────────────────────────────────

class Arrow {
  constructor(x, y, vx, vy) {
    this.x  = x;
    this.y  = y;
    this.vx = vx;
    this.vy = vy;
    this.distTravelled = 0;
    this.dead = false;
    this.damage = 1;
    this.angle = Math.atan2(vy, vx);
  }

  update(dt, tilemap) {
    const dx = this.vx * dt * TILE;
    const dy = this.vy * dt * TILE;
    this.x += dx;
    this.y += dy;
    this.distTravelled += Math.sqrt(dx * dx + dy * dy);

    if (this.distTravelled > ARROW_RANGE * TILE) {
      this.dead = true;
      return;
    }

    const { col, row } = tilemap.tileAt(this.x, this.y);
    if (!tilemap.isWalkable(col, row)) {
      this.dead = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    drawArrow(ctx, this.angle);
    ctx.restore();
  }
}

class Fireball {
  constructor(x, y, vx, vy) {
    this.x   = x;
    this.y   = y;
    this.vx  = vx;
    this.vy  = vy;
    this.dead = false;
    this.damage = 1;
    this.frame = 0;
  }

  update(dt, tilemap) {
    this.frame++;
    this.x += this.vx * dt * TILE;
    this.y += this.vy * dt * TILE;

    const { col, row } = tilemap.tileAt(this.x, this.y);
    if (!tilemap.isWalkable(col, row)) this.dead = true;

    // Out of canvas bounds
    if (this.x < 0 || this.x > CANVAS_W || this.y < 0 || this.y > CANVAS_H) {
      this.dead = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    drawFireball(ctx, this.frame);
    ctx.restore();
  }
}
