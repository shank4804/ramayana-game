// ─────────────────────────────────────────────────────────────────────────────
// Room — active game state for a single room within a chapter
// Replaces the old Level class. Handles entities, collision, and transitions.
// ─────────────────────────────────────────────────────────────────────────────

class Room {
  constructor(roomDef, playerOverride) {
    this.def      = roomDef;
    this.id       = roomDef.id;
    this.isFinalRoom   = !!roomDef.isFinalRoom;
    this.isChapterEnd  = !!roomDef.isChapterEnd;
    this.isBoss        = !!roomDef.isBoss;

    const { data, cols, rows } = parseMap(roomDef.mapStr);
    this.tilemap  = new TileMap(cols, rows, data);
    this._walkableTile = this._resolveWalkableTile(roomDef.playerStart);
    this._applyDoorways();

    const roomState = playerOverride?.roomState || null;
    const hasSpawnOverride = Number.isFinite(playerOverride?.x) && Number.isFinite(playerOverride?.y);

    // Spawn player at override position (from room transition) or default
    const ps = hasSpawnOverride
      ? playerOverride
      : tilemap_centerOf(this.tilemap, roomDef.playerStart.col, roomDef.playerStart.row);
    this.player = new Player(ps.x, ps.y);

    // Carry over player state if provided
    if (playerOverride && playerOverride.hp !== undefined) {
      this.player.hp = playerOverride.hp;
    }

    // Spawn enemies
    this.enemies = roomState?.cleared
      ? []
      : roomDef.enemies.map(e => {
          const ep = tilemap_centerOf(this.tilemap, e.col, e.row);
          return new Enemy(ep.x, ep.y, e.type);
        });

    // Lotus pickups
    this.lotuses = (roomDef.lotus || []).map((l, index) => ({
      col: l.col, row: l.row,
      ...tilemap_centerOf(this.tilemap, l.col, l.row),
      picked: !!roomState?.pickedLotuses?.[index],
    }));

    // Ambient message timer
    this.ambientTimer = 3.0;
    this.showAmbient  = true;

    // Room completion
    this.complete      = false;

    // Exit portal (only for chapter-end rooms without a boss auto-win)
    this.exitOpen = false;
    this.exitAnim = 0;

    // Room transition request (set when player walks to an edge with an exit)
    this.transitionTo = null;

    this.frame = 0;
  }

  update(dt) {
    this.frame++;
    this.ambientTimer = Math.max(0, this.ambientTimer - dt);
    if (this.ambientTimer <= 0) this.showAmbient = false;
    this.exitAnim += dt;

    // Update player
    this.player.update(dt, this.tilemap);

    // Update enemies
    this.enemies.forEach(e => e.update(dt, this.tilemap, this.player));
    this.enemies = this.enemies.filter(e => !e.dead);

    // Arrow → enemy collision
    this.player.arrows.forEach(arrow => {
      this.enemies.forEach(enemy => {
        if (arrow.dead || enemy.dead) return;
        const dx = arrow.x - enemy.x;
        const dy = arrow.y - enemy.y;
        const r  = (enemy.type === 'ravana' ? 20 : 12) * SCALE;
        if (dx * dx + dy * dy < r * r) {
          enemy.takeDamage(arrow.damage);
          arrow.dead = true;
        }
      });
    });

    // Ravana fireball → player collision
    this.enemies.forEach(e => {
      if (e.type !== 'ravana') return;
      e.fireballs.forEach(fb => {
        if (fb.dead) return;
        const dx = fb.x - this.player.x;
        const dy = fb.y - this.player.y;
        const r  = 10 * SCALE;
        if (dx * dx + dy * dy < r * r) {
          this.player.takeDamage(fb.damage);
          fb.dead = true;
        }
      });
    });

    // Lotus pickup
    this.lotuses.forEach(l => {
      if (l.picked) return;
      const dx = this.player.x - l.x;
      const dy = this.player.y - l.y;
      if (dx * dx + dy * dy < (12 * SCALE) ** 2) {
        l.picked = true;
        this.player.heal(1);
      }
    });

    // Check room transitions (player at edge)
    this._checkEdgeTransition();

    // Check room completion
    const allDead = this.enemies.length === 0;
    this.exitOpen = allDead && this.isChapterEnd;

    if (allDead && this.isFinalRoom) {
      this.complete = true;
    } else if (allDead && this.isChapterEnd && !this.isBoss) {
      // Need exit portal — check if player is near center-bottom
      this._checkExitPortal();
    }
  }

  _checkEdgeTransition() {
    const p = this.player;
    const exits = this.def.exits || {};
    const tile = this.tilemap.tileAt(p.x, p.y);
    const door = this._getDoorwayTiles();

    if (exits.west && tile.col === 0 && door.west.rows.includes(tile.row)) {
      this.transitionTo = { roomId: exits.west, edge: 'west' };
    } else if (exits.east && tile.col === this.tilemap.cols - 1 && door.east.rows.includes(tile.row)) {
      this.transitionTo = { roomId: exits.east, edge: 'east' };
    } else if (exits.north && tile.row === 0 && door.north.cols.includes(tile.col)) {
      this.transitionTo = { roomId: exits.north, edge: 'north' };
    } else if (exits.south && tile.row === this.tilemap.rows - 1 && door.south.cols.includes(tile.col)) {
      this.transitionTo = { roomId: exits.south, edge: 'south' };
    }
  }

  _checkExitPortal() {
    const { x: ex, y: ey } = this._getPortalPosition();
    const dx = this.player.x - ex;
    const dy = this.player.y - ey;
    if (dx * dx + dy * dy < (TILE * 0.7) ** 2) {
      this.complete = true;
    }
  }

  // Get player state to carry to next room
  getPlayerState() {
    return {
      hp: this.player.hp,
    };
  }

  getRoomState() {
    return {
      cleared: this.enemies.length === 0,
      pickedLotuses: this.lotuses.map(l => l.picked),
    };
  }

  draw(ctx) {
    if (VIEW_MODE === 'third_person' && typeof ThirdPersonRenderer !== 'undefined') {
      ThirdPersonRenderer.drawRoom(ctx, this);
      this._drawExitIndicators(ctx);
      if (this.showAmbient) this._drawAmbient(ctx);
      return;
    }

    // Tilemap
    this.tilemap.draw(ctx, this.frame);

    // Exit portal for chapter-end rooms
    if (this.isChapterEnd && !this.isFinalRoom) {
      this._drawExit(ctx);
    }

    // Edge exit indicators
    this._drawExitIndicators(ctx);

    // Lotuses
    this.lotuses.forEach(l => {
      if (l.picked) return;
      ctx.save();
      ctx.translate(l.x, l.y);
      drawLotus(ctx, this.frame);
      ctx.restore();
    });

    // Entities sorted by Y
    const drawables = [this.player, ...this.enemies].sort((a, b) => a.y - b.y);
    drawables.forEach(e => e.draw(ctx));

    // Ambient message
    if (this.showAmbient) this._drawAmbient(ctx);
  }

  _drawExit(ctx) {
    const { x: ex, y: ey } = this._getPortalPosition();
    const pulse = 0.6 + Math.sin(this.exitAnim * 3) * 0.4;
    const r = TILE * 0.45;

    if (this.exitOpen) {
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.shadowColor = C.GOLD_B;
      ctx.shadowBlur  = 20;
      ctx.strokeStyle = C.GOLD_B;
      ctx.lineWidth   = 3;
      ctx.beginPath();
      ctx.arc(ex, ey, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = C.GOLD;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.arc(ex, ey, r * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = C.GOLD_B;
      ctx.font = `bold ${TILE * 0.5}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▶', ex, ey);
      ctx.restore();
    } else {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ex, ey, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  _drawExitIndicators(ctx) {
    const exits = this.def.exits || {};
    const pulse = 0.4 + Math.sin(this.exitAnim * 2.5) * 0.3;

    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = C.GOLD;
    ctx.font = `bold 16px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (exits.north) {
      ctx.fillText('▲', CANVAS_W / 2, 12);
    }
    if (exits.south) {
      ctx.fillText('▼', CANVAS_W / 2, CANVAS_H - 12);
    }
    if (exits.west) {
      ctx.fillText('◀', 12, CANVAS_H / 2);
    }
    if (exits.east) {
      ctx.fillText('▶', CANVAS_W - 12, CANVAS_H / 2);
    }
    ctx.restore();
  }

  _drawAmbient(ctx) {
    const alpha = Math.min(1, this.ambientTimer / 0.5);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, CANVAS_H * 0.7, CANVAS_W, 44);
    ctx.fillStyle   = C.GOLD;
    ctx.font        = `italic bold 14px serif`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.def.ambientText, CANVAS_W / 2, CANVAS_H * 0.7 + 22);
    ctx.restore();
  }

  _resolveWalkableTile(playerStart) {
    const tile = this.tilemap.get(playerStart.col, playerStart.row);
    return this.tilemap.isWalkable(playerStart.col, playerStart.row) ? tile : T_FLOOR;
  }

  _setTile(col, row, type) {
    if (col < 0 || row < 0 || col >= this.tilemap.cols || row >= this.tilemap.rows) return;
    this.tilemap.tiles[row * this.tilemap.cols + col] = type;
  }

  _getDoorwayTiles() {
    const midCol = Math.floor(this.tilemap.cols / 2);
    const midRow = Math.floor(this.tilemap.rows / 2);
    return {
      north: { cols: [midCol - 1, midCol], rows: [0, 1] },
      south: { cols: [midCol - 1, midCol], rows: [this.tilemap.rows - 2, this.tilemap.rows - 1] },
      west:  { cols: [0, 1], rows: [midRow - 1, midRow] },
      east:  { cols: [this.tilemap.cols - 2, this.tilemap.cols - 1], rows: [midRow - 1, midRow] },
    };
  }

  _applyDoorways() {
    const exits = this.def.exits || {};
    const door = this._getDoorwayTiles();

    if (exits.north) this._carveDoorway(door.north.cols, door.north.rows);
    if (exits.south) this._carveDoorway(door.south.cols, door.south.rows);
    if (exits.west) this._carveDoorway(door.west.cols, door.west.rows);
    if (exits.east) this._carveDoorway(door.east.cols, door.east.rows);

    if (this.isChapterEnd && !this.isFinalRoom) {
      const portal = this._getPortalTile();
      this._setTile(portal.col, portal.row, this._walkableTile);
    }
  }

  _carveDoorway(cols, rows) {
    cols.forEach(col => {
      rows.forEach(row => {
        this._setTile(col, row, this._walkableTile);
      });
    });
  }

  _getPortalTile() {
    return {
      col: Math.floor(this.tilemap.cols / 2),
      row: this.tilemap.rows - 2,
    };
  }

  _getPortalPosition() {
    const portal = this._getPortalTile();
    return this.tilemap.tileCenterPx(portal.col, portal.row);
  }
}
