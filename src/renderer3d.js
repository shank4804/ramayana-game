// ─────────────────────────────────────────────────────────────────────────────
// ThirdPersonRenderer — pseudo-3D presentation over the existing 2D logic
// This keeps gameplay tile-based, but renders the world using a chase camera.
// ─────────────────────────────────────────────────────────────────────────────

const ThirdPersonRenderer = {
  drawRoom(ctx, room) {
    const camera = this._makeCamera(room.player);
    const drawQueue = [];

    this._drawSky(ctx, room, camera);
    this._collectTiles(room, camera, drawQueue);
    this._collectLotuses(room, camera, drawQueue);
    this._collectProjectiles(room.player.arrows, 'arrow', camera, drawQueue);
    this._collectEntities(room, camera, drawQueue);
    this._collectEnemyProjectiles(room.enemies, camera, drawQueue);
    this._collectPortal(room, camera, drawQueue);

    drawQueue
      .filter(item => Number.isFinite(item.depth))
      .sort((a, b) => b.depth - a.depth)
      .forEach(item => item.draw(ctx));
  },

  _makeCamera(player) {
    const facing = this._dirVector(player.dir);
    const side = { x: -facing.z, z: facing.x };
    const position = {
      x: player.x - facing.x * TILE * 2.9 + side.x * TILE * 0.65,
      y: TILE * 1.9,
      z: player.y - facing.z * TILE * 2.9 + side.z * TILE * 0.65,
    };
    const target = {
      x: player.x + facing.x * TILE * 1.3,
      y: TILE * 0.7,
      z: player.y + facing.z * TILE * 1.3,
    };

    const forward = this._normalize3({
      x: target.x - position.x,
      y: target.y - position.y,
      z: target.z - position.z,
    });
    const right = this._normalize3(this._cross3(forward, { x: 0, y: 1, z: 0 }));
    const up = this._normalize3(this._cross3(right, forward));

    return {
      position,
      target,
      forward,
      right,
      up,
      focal: 680,
      horizonY: CANVAS_H * 0.6,
    };
  },

  _drawSky(ctx, room, camera) {
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    sky.addColorStop(0, '#07111f');
    sky.addColorStop(0.45, room.def.bgColor || '#0d1328');
    sky.addColorStop(1, '#14100b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const glowX = CANVAS_W * 0.78;
    const glowY = CANVAS_H * 0.2;
    const glow = ctx.createRadialGradient(glowX, glowY, 10, glowX, glowY, 160);
    glow.addColorStop(0, 'rgba(255,214,120,0.65)');
    glow.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const haze = ctx.createLinearGradient(0, camera.horizonY - 20, 0, CANVAS_H);
    haze.addColorStop(0, 'rgba(255,190,120,0.05)');
    haze.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, camera.horizonY - 20, CANVAS_W, CANVAS_H - camera.horizonY + 20);
  },

  _collectTiles(room, camera, drawQueue) {
    const tilemap = room.tilemap;

    for (let row = 0; row < tilemap.rows; row++) {
      for (let col = 0; col < tilemap.cols; col++) {
        const type = tilemap.get(col, row);
        const x0 = col * TILE;
        const x1 = x0 + TILE;
        const z0 = row * TILE;
        const z1 = z0 + TILE;
        const groundY = type === T_WATER ? -TILE * 0.18 : 0;
        const palette = this._tilePalette(type, col, row, room.frame);

        this._pushQuad(drawQueue, camera, [
          { x: x0, y: groundY, z: z0 },
          { x: x1, y: groundY, z: z0 },
          { x: x1, y: groundY, z: z1 },
          { x: x0, y: groundY, z: z1 },
        ], palette.top, palette.stroke);

        const obstacle = this._obstacleSpec(type);
        if (!obstacle) continue;

        const topY = obstacle.height;
        this._pushQuad(drawQueue, camera, [
          { x: x0, y: topY, z: z0 },
          { x: x1, y: topY, z: z0 },
          { x: x1, y: topY, z: z1 },
          { x: x0, y: topY, z: z1 },
        ], obstacle.top, obstacle.topStroke);

        if (camera.position.z <= z0) {
          this._pushQuad(drawQueue, camera, [
            { x: x0, y: groundY, z: z0 },
            { x: x1, y: groundY, z: z0 },
            { x: x1, y: topY, z: z0 },
            { x: x0, y: topY, z: z0 },
          ], obstacle.north);
        }
        if (camera.position.z >= z1) {
          this._pushQuad(drawQueue, camera, [
            { x: x1, y: groundY, z: z1 },
            { x: x0, y: groundY, z: z1 },
            { x: x0, y: topY, z: z1 },
            { x: x1, y: topY, z: z1 },
          ], obstacle.south);
        }
        if (camera.position.x <= x0) {
          this._pushQuad(drawQueue, camera, [
            { x: x0, y: groundY, z: z1 },
            { x: x0, y: groundY, z: z0 },
            { x: x0, y: topY, z: z0 },
            { x: x0, y: topY, z: z1 },
          ], obstacle.west);
        }
        if (camera.position.x >= x1) {
          this._pushQuad(drawQueue, camera, [
            { x: x1, y: groundY, z: z0 },
            { x: x1, y: groundY, z: z1 },
            { x: x1, y: topY, z: z1 },
            { x: x1, y: topY, z: z0 },
          ], obstacle.east);
        }
      }
    }
  },

  _collectLotuses(room, camera, drawQueue) {
    room.lotuses.forEach(lotus => {
      if (lotus.picked) return;
      this._pushBillboard(drawQueue, camera, {
        x: lotus.x,
        z: lotus.y,
        groundOffset: 0,
        worldHeight: TILE * 0.48,
        nativeW: 16,
        nativeH: 16,
        draw: ctx => drawLotus(ctx, room.frame),
      });
    });
  },

  _collectEntities(room, camera, drawQueue) {
    this._pushPlayer(drawQueue, camera, room.player);
    room.enemies.forEach(enemy => this._pushEnemy(drawQueue, camera, enemy));
  },

  _collectProjectiles(projectiles, type, camera, drawQueue) {
    projectiles.forEach(projectile => {
      if (projectile.dead) return;
      const projected = this._project(camera, {
        x: projectile.x,
        y: TILE * 0.42,
        z: projectile.y,
      });
      if (!projected) return;

      drawQueue.push({
        depth: projected.depth,
        draw: ctx => {
          const radius = Math.max(2, Math.min(7, 260 / projected.depth));
          ctx.save();
          ctx.fillStyle = type === 'arrow' ? C.GOLD_B : C.FIREBALL_L;
          ctx.strokeStyle = type === 'arrow' ? C.BOW_D : C.FIREBALL;
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (type === 'arrow') {
            ctx.moveTo(projected.x - radius * 1.8, projected.y + radius * 0.6);
            ctx.lineTo(projected.x + radius * 1.8, projected.y - radius * 0.6);
            ctx.stroke();
          } else {
            ctx.arc(projected.x, projected.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        },
      });
    });
  },

  _collectEnemyProjectiles(enemies, camera, drawQueue) {
    enemies.forEach(enemy => {
      if (!enemy.fireballs) return;
      this._collectProjectiles(enemy.fireballs, 'fireball', camera, drawQueue);
    });
  },

  _collectPortal(room, camera, drawQueue) {
    if (!room.isChapterEnd || room.isFinalRoom) return;
    const portal = room._getPortalPosition();
    const base = this._project(camera, { x: portal.x, y: 0, z: portal.y });
    const top = this._project(camera, { x: portal.x, y: TILE * 0.95, z: portal.y });
    if (!base || !top) return;

    drawQueue.push({
      depth: base.depth,
      draw: ctx => {
        const pulse = 0.75 + Math.sin(room.exitAnim * 4) * 0.2;
        const h = Math.abs(base.y - top.y);
        const w = h * 0.45;
        ctx.save();
        ctx.globalAlpha = room.exitOpen ? pulse : 0.35;
        ctx.strokeStyle = room.exitOpen ? C.GOLD_B : '#666';
        ctx.lineWidth = room.exitOpen ? 3 : 2;
        ctx.shadowColor = room.exitOpen ? C.GOLD_B : 'transparent';
        ctx.shadowBlur = room.exitOpen ? 18 : 0;
        ctx.beginPath();
        ctx.ellipse(base.x, base.y - h * 0.42, w, h * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      },
    });
  },

  _pushPlayer(drawQueue, camera, player) {
    const spriteDir = player.dir === 'down' ? 'up' : player.dir;
    this._pushBillboard(drawQueue, camera, {
      x: player.x,
      z: player.y,
      groundOffset: 0,
      worldHeight: TILE * 1.45,
      nativeW: CHAR_W,
      nativeH: CHAR_H,
      bubble: player.bubble,
      draw: ctx => drawRama(ctx, spriteDir, player.frame, player.state),
      hp: { value: player.hp, max: PLAYER_MAX_HP, show: false },
    });
  },

  _pushEnemy(drawQueue, camera, enemy) {
    const isRavana = enemy.type === 'ravana';
    this._pushBillboard(drawQueue, camera, {
      x: enemy.x,
      z: enemy.y,
      groundOffset: 0,
      worldHeight: isRavana ? TILE * 2.1 : TILE * 1.4,
      nativeW: isRavana ? 24 : CHAR_W,
      nativeH: isRavana ? 32 : CHAR_H,
      bubble: enemy.bubble,
      draw: ctx => {
        if (isRavana) {
          drawRavana(ctx, enemy.hp, enemy.frame);
        } else {
          drawRakshasa(ctx, enemy.dir, enemy.frame, 'walk');
        }
      },
      hp: enemy.maxHp > 1 ? { value: enemy.hp, max: enemy.maxHp, show: true } : null,
    });
  },

  _pushBillboard(drawQueue, camera, entity) {
    const base = this._project(camera, {
      x: entity.x,
      y: entity.groundOffset || 0,
      z: entity.z,
    });
    const top = this._project(camera, {
      x: entity.x,
      y: (entity.groundOffset || 0) + entity.worldHeight,
      z: entity.z,
    });
    if (!base || !top) return;

    const nativePixelH = entity.nativeH * SCALE;
    const nativePixelW = entity.nativeW * SCALE;
    const screenHeight = Math.abs(base.y - top.y);
    const scale = Math.max(0.18, Math.min(4.8, screenHeight / nativePixelH));

    drawQueue.push({
      depth: base.depth,
      draw: ctx => {
        const pixelW = nativePixelW * scale;
        const pixelH = nativePixelH * scale;
        const shadowW = Math.max(6, pixelW * 0.38);
        const shadowH = Math.max(3, pixelW * 0.12);

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.beginPath();
        ctx.ellipse(base.x, base.y + shadowH * 0.2, shadowW, shadowH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(base.x - pixelW / 2, base.y - pixelH);
        ctx.scale(scale, scale);
        entity.draw(ctx);
        ctx.restore();

        if (entity.hp?.show) {
          const pct = entity.hp.value / entity.hp.max;
          const barW = pixelW * 0.9;
          const barH = 4;
          const bx = base.x - barW / 2;
          const by = base.y - pixelH - 10;
          ctx.fillStyle = '#150000';
          ctx.fillRect(bx, by, barW, barH);
          ctx.fillStyle = pct > 0.5 ? '#22cc22' : pct > 0.25 ? '#ccaa00' : '#cc2200';
          ctx.fillRect(bx, by, barW * pct, barH);
        }

        if (entity.bubble) {
          drawSpeechBubble(ctx, base.x, base.y - pixelH - 22, entity.bubble);
        }
      },
    });
  },

  _pushQuad(drawQueue, camera, points, fillStyle, strokeStyle) {
    const projected = points.map(point => this._project(camera, point));
    if (projected.some(point => !point)) return;

    drawQueue.push({
      depth: projected.reduce((sum, point) => sum + point.depth, 0) / projected.length,
      draw: ctx => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(projected[0].x, projected[0].y);
        for (let i = 1; i < projected.length; i++) {
          ctx.lineTo(projected[i].x, projected[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
        if (strokeStyle) {
          ctx.strokeStyle = strokeStyle;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      },
    });
  },

  _project(camera, point) {
    const rel = {
      x: point.x - camera.position.x,
      y: point.y - camera.position.y,
      z: point.z - camera.position.z,
    };
    const cx = this._dot3(rel, camera.right);
    const cy = this._dot3(rel, camera.up);
    const cz = this._dot3(rel, camera.forward);
    if (cz <= 12) return null;

    return {
      x: CANVAS_W / 2 + (cx / cz) * camera.focal,
      y: camera.horizonY - (cy / cz) * camera.focal,
      depth: cz,
    };
  },

  _tilePalette(type, col, row, frame) {
    const checker = (col + row) % 2 === 0;

    switch (type) {
      case T_BRICK:
        return { top: checker ? C.BRICK_L : C.BRICK_M, stroke: 'rgba(20,8,4,0.25)' };
      case T_PALACE:
        return { top: checker ? C.PALACE_L : C.PALACE_M, stroke: 'rgba(255,215,0,0.08)' };
      case T_WATER:
        return { top: frame % 20 < 10 ? C.WATER_M : C.WATER_L, stroke: 'rgba(255,255,255,0.04)' };
      case T_TREE:
      case T_WALL:
      case T_PILLAR:
        return { top: checker ? C.FLOOR_G : C.FLOOR_G2, stroke: 'rgba(0,0,0,0.08)' };
      default:
        return { top: checker ? C.FLOOR_G : C.FLOOR_G2, stroke: 'rgba(255,255,255,0.03)' };
    }
  },

  _obstacleSpec(type) {
    switch (type) {
      case T_TREE:
        return {
          height: TILE * 1.9,
          top: C.TREE_TOP,
          topStroke: 'rgba(0,0,0,0.16)',
          north: C.TREE_MID,
          south: C.TREE_BASE,
          west: C.TREE_MID,
          east: C.TREE_BASE,
        };
      case T_WALL:
        return {
          height: TILE * 1.35,
          top: C.TREE_MID,
          topStroke: 'rgba(0,0,0,0.2)',
          north: C.GRASS_D,
          south: C.TREE_BASE,
          west: C.TREE_MID,
          east: C.TREE_BASE,
        };
      case T_PILLAR:
        return {
          height: TILE * 1.65,
          top: C.PILLAR_L,
          topStroke: 'rgba(0,0,0,0.18)',
          north: C.PILLAR_L,
          south: C.PILLAR_D,
          west: C.PILLAR_L,
          east: C.PILLAR_D,
        };
      default:
        return null;
    }
  },

  _dirVector(dir) {
    switch (dir) {
      case 'up': return { x: 0, z: -1 };
      case 'left': return { x: -1, z: 0 };
      case 'right': return { x: 1, z: 0 };
      default: return { x: 0, z: 1 };
    }
  },

  _dot3(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  },

  _cross3(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    };
  },

  _normalize3(v) {
    const len = Math.hypot(v.x, v.y, v.z) || 1;
    return { x: v.x / len, y: v.y / len, z: v.z / len };
  },
};
