// ─────────────────────────────────────────────────────────────────────────────
// Sprites — pixel-art drawing using fillRect (one call per sprite pixel)
// All coordinates are in *sprite pixels*; multiply by SCALE for canvas pixels.
// ─────────────────────────────────────────────────────────────────────────────

// Shorthand: fill a pixel rectangle in sprite-pixel units
function px(ctx, col, row, w, h, color) {
  if (!color) return;
  ctx.fillStyle = color;
  ctx.fillRect(col * SCALE, row * SCALE, w * SCALE, h * SCALE);
}

// Draw a full sprite from a 2-D color array (string[][]) — same format as
// SpriteData format: '' / null = transparent.
function drawSpriteData(ctx, data, offX = 0, offY = 0) {
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      const color = data[row][col];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(
          (offX + col) * SCALE,
          (offY + row) * SCALE,
          SCALE,
          SCALE,
        );
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TILE SPRITES  (16 × 16 sprite pixels)
// ─────────────────────────────────────────────────────────────────────────────

function drawTile(ctx, type, cx, cy, frame) {
  // cx, cy in canvas pixels (top-left of the tile)
  ctx.save();
  ctx.translate(cx, cy);

  switch (type) {
    case T_FLOOR:   drawForestFloor(ctx, frame); break;
    case T_WALL:    drawWallTile(ctx);            break;
    case T_TREE:    drawTreeTile(ctx);            break;
    case T_WATER:   drawWaterTile(ctx, frame);    break;
    case T_BRICK:   drawBrickTile(ctx);           break;
    case T_PALACE:  drawPalaceTile(ctx);          break;
    case T_PILLAR:  drawPillarTile(ctx);          break;
  }
  ctx.restore();
}

function drawForestFloor(ctx, frame) {
  // Base dark green ground
  px(ctx, 0, 0, 16, 16, C.FLOOR_G);
  // Slightly varied patches
  px(ctx, 2, 2, 3, 2, C.FLOOR_G2);
  px(ctx, 9, 5, 4, 2, C.FLOOR_G2);
  px(ctx, 1, 10, 2, 2, C.GRASS_D);
  px(ctx, 12, 1, 2, 2, C.GRASS_D);
  px(ctx, 6, 12, 3, 2, C.GRASS_L);
  // Small grass tuft
  px(ctx, 4, 8, 1, 2, C.GRASS_L);
  px(ctx, 11, 11, 1, 2, C.GRASS_L);
}

function drawWallTile(ctx) {
  px(ctx, 0, 0, 16, 16, C.TREE_BASE);
  // Mossy stone texture
  px(ctx, 2, 2, 5, 4, C.TREE_MID);
  px(ctx, 9, 1, 5, 4, C.GRASS_D);
  px(ctx, 1, 8, 6, 5, C.GRASS_D);
  px(ctx, 9, 9, 5, 4, C.TREE_MID);
  px(ctx, 0, 0, 1, 16, C.GRASS_D);
  px(ctx, 15, 0, 1, 16, C.TREE_BASE);
  px(ctx, 0, 0, 16, 1, C.GRASS_D);
  px(ctx, 0, 15, 16, 1, C.TREE_BASE);
}

function drawTreeTile(ctx) {
  // Canopy shadow base
  px(ctx, 0, 0, 16, 16, C.TREE_BASE);
  // Leafy top
  px(ctx, 3, 0, 10, 10, C.TREE_MID);
  px(ctx, 1, 2, 14, 8, C.TREE_MID);
  px(ctx, 4, 1, 8, 11, C.TREE_TOP);
  px(ctx, 2, 3, 12, 6, C.TREE_TOP);
  // Highlight patches
  px(ctx, 5, 2, 4, 3, C.GRASS_L);
  px(ctx, 6, 3, 2, 2, C.GRASS_L);
  // Trunk
  px(ctx, 6, 11, 4, 5, C.TREE_TRUNK);
  px(ctx, 7, 10, 2, 6, C.TREE_TRUNK);
}

function drawWaterTile(ctx, frame) {
  px(ctx, 0, 0, 16, 16, C.WATER_D);
  px(ctx, 0, 0, 16, 16, C.WATER_M);
  // Animated ripple
  const shift = Math.floor(frame * 0.08) % 4;
  for (let i = 0; i < 4; i++) {
    const row = ((i * 4) + shift) % 16;
    px(ctx, 1 + i * 3, row, 5, 1, C.WATER_L);
    px(ctx, 2 + i * 3, (row + 2) % 16, 3, 1, C.WATER_SHIM);
  }
}

function drawBrickTile(ctx) {
  px(ctx, 0, 0, 16, 16, C.BRICK_M);
  // Mortar lines
  px(ctx, 0, 4, 16, 1, C.BRICK_MORT);
  px(ctx, 0, 9, 16, 1, C.BRICK_MORT);
  px(ctx, 0, 14, 16, 1, C.BRICK_MORT);
  // Vertical mortar (staggered)
  px(ctx, 7, 0, 1, 4, C.BRICK_MORT);
  px(ctx, 3, 5, 1, 4, C.BRICK_MORT);
  px(ctx, 11, 5, 1, 4, C.BRICK_MORT);
  px(ctx, 7, 10, 1, 4, C.BRICK_MORT);
  // Highlights
  px(ctx, 1, 1, 5, 2, C.BRICK_L);
  px(ctx, 9, 1, 5, 2, C.BRICK_L);
  px(ctx, 4, 6, 6, 2, C.BRICK_L);
  px(ctx, 1, 11, 5, 2, C.BRICK_L);
  px(ctx, 9, 11, 5, 2, C.BRICK_L);
}

function drawPalaceTile(ctx) {
  px(ctx, 0, 0, 16, 16, C.PALACE_M);
  // Dark ornamental grid
  px(ctx, 0, 7, 16, 1, C.PALACE_D);
  px(ctx, 7, 0, 1, 16, C.PALACE_D);
  // Gold inlay at center
  px(ctx, 6, 6, 4, 4, C.PALACE_GOLD);
  px(ctx, 7, 7, 2, 2, C.GOLD_D);
  // Corner accents
  px(ctx, 1, 1, 2, 2, C.PALACE_L);
  px(ctx, 13, 1, 2, 2, C.PALACE_L);
  px(ctx, 1, 13, 2, 2, C.PALACE_L);
  px(ctx, 13, 13, 2, 2, C.PALACE_L);
}

function drawPillarTile(ctx) {
  px(ctx, 0, 0, 16, 16, C.PALACE_D);
  // Pillar body
  px(ctx, 4, 0, 8, 16, C.PILLAR_D);
  px(ctx, 5, 0, 6, 16, C.PILLAR_L);
  px(ctx, 6, 0, 4, 16, '#2e2e70');
  // Gold ring
  px(ctx, 4, 6, 8, 4, C.RV_CROWN);
  px(ctx, 5, 7, 6, 2, C.RV_CROWN_B);
  // Cap/base
  px(ctx, 3, 0, 10, 2, C.PILLAR_L);
  px(ctx, 3, 14, 10, 2, C.PILLAR_L);
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER SPRITES  (16 × 24 sprite pixels, origin = top-left)
// ─────────────────────────────────────────────────────────────────────────────

// ── Rama ─────────────────────────────────────────────────────────────────────

// walkLeg[frame] = [leftLegY, rightLegY] offset for walking animation
const WALK_LEG = [
  [0, 0],   // frame 0 – both down
  [0, -2],  // frame 1 – right leg up
  [0, 0],   // frame 2 – both down
  [-2, 0],  // frame 3 – left leg up
];

function drawRama(ctx, dir, frame, state) {
  // ctx origin = sprite top-left.  dir: 'down'|'up'|'left'|'right'
  const f = frame % 4;
  const [ll, rl] = (state === 'walk') ? WALK_LEG[f] : [0, 0];

  // ── Flip for left direction ────────────────────────────────────────────────
  if (dir === 'left') {
    ctx.save();
    ctx.translate(CHAR_W * SCALE, 0);
    ctx.scale(-1, 1);
  }

  // ── Head (rows 0-8) ────────────────────────────────────────────────────────
  // Crown / hair
  px(ctx, 5, 0, 6, 1, C.GOLD_B);        // crown band
  px(ctx, 6, -1, 4, 1, C.GOLD);         // crown peak
  px(ctx, 4, 1, 8, 1, C.HAIR);
  px(ctx, 3, 2, 10, 1, C.HAIR_M);
  px(ctx, 4, 1, 8, 2, C.HAIR_M);

  // Face
  px(ctx, 4, 3, 8, 5, C.SKIN);
  px(ctx, 4, 3, 1, 5, C.SKIN_S);        // left cheek shadow
  px(ctx, 11, 3, 1, 5, C.SKIN_S);       // right cheek shadow

  // Eyes
  if (dir === 'up') {
    // No eyes visible from behind
  } else {
    px(ctx, 6, 5, 1, 1, C.EYE);
    px(ctx, 9, 5, 1, 1, C.EYE);
  }
  // Tilak
  if (dir !== 'up') px(ctx, 7, 4, 2, 1, C.TILAK);

  // Ears
  px(ctx, 3, 4, 1, 2, C.SKIN_S);
  px(ctx, 12, 4, 1, 2, C.SKIN_S);

  // Chin / neck
  px(ctx, 6, 8, 4, 1, C.SKIN);
  // Gold necklace
  px(ctx, 5, 9, 6, 1, C.GOLD_B);
  px(ctx, 4, 9, 1, 1, C.GOLD);
  px(ctx, 11, 9, 1, 1, C.GOLD);

  // ── Torso (rows 9-15) ──────────────────────────────────────────────────────
  // Shoulders / arms
  px(ctx, 3, 10, 2, 4, C.SKIN);
  px(ctx, 11, 10, 2, 4, C.SKIN);

  // Upper dhoti wrap (blue garment)
  px(ctx, 4, 10, 8, 7, C.BLUE_D);
  px(ctx, 5, 10, 6, 7, C.BLUE);
  px(ctx, 6, 10, 4, 5, C.BLUE_L);

  // Waist sash (gold)
  px(ctx, 3, 15, 10, 2, C.GOLD_D);
  px(ctx, 4, 15, 8, 1, C.GOLD);

  // ── Bow (right side when facing right) ────────────────────────────────────
  if (dir === 'right' || dir === 'down' || dir === 'up') {
    // Bow arm extended right
    px(ctx, 12, 9, 1, 8, C.BOW);       // bow stave
    px(ctx, 13, 9, 1, 8, C.BOW_D);
    // Bowstring
    px(ctx, 13, 9, 1, 1, C.GOLD_D);
    px(ctx, 13, 16, 1, 1, C.GOLD_D);
    // Grip hand
    px(ctx, 11, 12, 2, 2, C.SKIN_S);
  } else {
    // Facing left: bow on left side
    px(ctx, 3, 9, 1, 8, C.BOW_D);
    px(ctx, 2, 9, 1, 8, C.BOW);
    px(ctx, 2, 9, 1, 1, C.GOLD_D);
    px(ctx, 2, 16, 1, 1, C.GOLD_D);
    px(ctx, 3, 12, 2, 2, C.SKIN_S);
  }

  // Arrow nocked (shoot state)
  if (state === 'shoot') {
    if (dir === 'right') {
      for (let i = 0; i < 6; i++) px(ctx, 6 + i, 12, 1, 1, C.BOW);
      px(ctx, 12, 12, 1, 1, C.ARROW_TIP);
    } else if (dir === 'left') {
      for (let i = 0; i < 6; i++) px(ctx, 4 + i, 12, 1, 1, C.BOW);
      px(ctx, 3, 12, 1, 1, C.ARROW_TIP);
    }
  }

  // ── Legs (rows 16-23) ─────────────────────────────────────────────────────
  const legColor  = C.BLUE_D;
  const legColor2 = C.BLUE;
  const skinColor = C.SKIN;

  // Left leg
  const ly = 17 + ll;
  px(ctx, 4, ly, 3, 6, legColor);
  px(ctx, 5, ly, 2, 5, legColor2);
  px(ctx, 4, ly + 6, 4, 1, skinColor);   // foot

  // Right leg
  const ry = 17 + rl;
  px(ctx, 9, ry, 3, 6, legColor);
  px(ctx, 9, ry, 2, 5, legColor2);
  px(ctx, 8, ry + 6, 4, 1, skinColor);   // foot

  if (dir === 'left') ctx.restore();
}

// ── Rakshasa ─────────────────────────────────────────────────────────────────

function drawRakshasa(ctx, dir, frame, state) {
  const f = frame % 4;
  const [ll, rl] = (state === 'walk') ? WALK_LEG[f] : [0, 0];

  if (dir === 'left') {
    ctx.save();
    ctx.translate(CHAR_W * SCALE, 0);
    ctx.scale(-1, 1);
  }

  // ── Head ─────────────────────────────────────────────────────────────────
  // Horns
  px(ctx, 4, 0, 2, 3, C.RK_HORN);
  px(ctx, 10, 0, 2, 3, C.RK_HORN);
  px(ctx, 5, -1, 1, 2, '#2a0500');
  px(ctx, 10, -1, 1, 2, '#2a0500');

  // Head / face
  px(ctx, 3, 2, 10, 7, C.RK_SKIN);
  px(ctx, 4, 2, 8, 7, C.RK_SKIN_L);
  px(ctx, 3, 2, 1, 7, C.RK_SKIN);
  px(ctx, 12, 2, 1, 7, C.RK_SKIN);

  // Glowing eyes
  if (dir !== 'up') {
    px(ctx, 5, 5, 2, 2, C.RK_EYE);
    px(ctx, 9, 5, 2, 2, C.RK_EYE);
    px(ctx, 6, 5, 1, 1, '#ff6600');
    px(ctx, 10, 5, 1, 1, '#ff6600');
  }
  // Fangs
  if (dir !== 'up') {
    px(ctx, 6, 8, 1, 2, C.WHITE);
    px(ctx, 9, 8, 1, 2, C.WHITE);
  }

  // ── Torso ─────────────────────────────────────────────────────────────────
  // Clawed arms
  px(ctx, 1, 10, 3, 5, C.RK_SKIN);
  px(ctx, 12, 10, 3, 5, C.RK_SKIN);
  // Claws
  px(ctx, 1, 15, 1, 2, C.RK_CLAW);
  px(ctx, 2, 15, 1, 2, C.RK_CLAW);
  px(ctx, 3, 15, 1, 2, C.RK_CLAW);
  px(ctx, 12, 15, 1, 2, C.RK_CLAW);
  px(ctx, 13, 15, 1, 2, C.RK_CLAW);
  px(ctx, 14, 15, 1, 2, C.RK_CLAW);

  // Body
  px(ctx, 3, 10, 10, 7, C.RK_CLOTH);
  px(ctx, 4, 10, 8, 7, C.RK_CLOTH_M);
  px(ctx, 5, 11, 6, 4, C.RK_SKIN);

  // ── Legs ─────────────────────────────────────────────────────────────────
  const ly = 17 + ll;
  const ry = 17 + rl;
  px(ctx, 4, ly, 3, 6, C.RK_CLOTH);
  px(ctx, 5, ly, 1, 5, C.RK_CLOTH_M);
  px(ctx, 4, ly + 6, 4, 1, C.RK_SKIN);

  px(ctx, 9, ry, 3, 6, C.RK_CLOTH);
  px(ctx, 9, ry, 1, 5, C.RK_CLOTH_M);
  px(ctx, 8, ry + 6, 4, 1, C.RK_SKIN);

  if (dir === 'left') ctx.restore();
}

// ── Ravana (boss, 24×32 sprite pixels) ────────────────────────────────────────

function drawRavana(ctx, hp, frame) {
  const BW = 24, BH = 32;
  const alive = Math.ceil((hp / RAVANA_MAX_HP) * 10);  // number of visible heads
  const bob = Math.sin(frame * 0.08) * 0.5;

  // Crown
  for (let i = 0; i < 5; i++) {
    const cx2 = 2 + i * 4;
    px(ctx, cx2, 0, 3, 3, C.RV_CROWN);
    px(ctx, cx2 + 1, 0, 1, 4, C.RV_CROWN_B);
  }

  // 10 small head circles arranged in arc (5 across top, 5 below)
  const headPositions = [
    [1, 3], [5, 1], [10, 0], [15, 1], [19, 3],
    [2, 6], [6, 5], [10, 4], [14, 5], [18, 6],
  ];
  headPositions.forEach(([hx, hy], i) => {
    const color = i < alive ? C.RK_SKIN_L : '#2a0000';
    px(ctx, hx, hy + Math.round(bob), 4, 4, color);
    if (i < alive) {
      px(ctx, hx + 1, hy + 1 + Math.round(bob), 1, 1, C.RK_EYE);
      px(ctx, hx + 2, hy + 1 + Math.round(bob), 1, 1, C.RK_EYE);
    }
  });

  // Main central head
  px(ctx, 8, 7, 8, 8, C.RK_SKIN);
  px(ctx, 9, 7, 6, 8, C.RK_SKIN_L);
  px(ctx, 10, 9, 2, 2, C.RK_EYE);
  px(ctx, 13, 9, 2, 2, C.RK_EYE);
  px(ctx, 11, 9, 1, 1, '#ff6600');
  px(ctx, 14, 9, 1, 1, '#ff6600');
  // Fangs
  px(ctx, 10, 14, 1, 2, C.WHITE);
  px(ctx, 12, 14, 1, 2, C.WHITE);
  px(ctx, 14, 14, 1, 2, C.WHITE);
  // Crown on main head
  px(ctx, 8, 6, 8, 2, C.RV_CROWN);
  px(ctx, 9, 5, 6, 2, C.RV_CROWN_B);

  // 10 arms (5 each side)
  for (let i = 0; i < 5; i++) {
    const ay = 15 + i * 2;
    // Left arms
    px(ctx, 0, ay, 8 - i, 1, C.RK_SKIN);
    px(ctx, 0, ay, 1, 1, C.RK_CLAW);
    // Right arms
    px(ctx, 16 + i, ay, 8 - i, 1, C.RK_SKIN);
    px(ctx, 23 - i, ay, 1, 1, C.RK_CLAW);
  }

  // Main body
  px(ctx, 6, 15, 12, 12, C.RK_CLOTH);
  px(ctx, 7, 15, 10, 10, C.RK_CLOTH_M);
  px(ctx, 8, 16, 8, 6, C.RK_SKIN);

  // Legs
  px(ctx, 7, 26, 4, 6, C.RK_CLOTH);
  px(ctx, 8, 26, 2, 5, C.RK_CLOTH_M);
  px(ctx, 7, 31, 5, 1, C.RK_SKIN);
  px(ctx, 13, 26, 4, 6, C.RK_CLOTH);
  px(ctx, 13, 26, 2, 5, C.RK_CLOTH_M);
  px(ctx, 12, 31, 5, 1, C.RK_SKIN);
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTILE SPRITES
// ─────────────────────────────────────────────────────────────────────────────

function drawArrow(ctx, angle) {
  ctx.save();
  ctx.rotate(angle);
  // shaft
  px(ctx, -4, -1, 8, 1, C.BOW);
  px(ctx, -3, -1, 7, 1, C.BOW_D);
  // tip
  px(ctx, 3, -1, 2, 1, C.ARROW_TIP);
  px(ctx, 5, -2, 1, 3, C.ARROW_TIP);
  // fletching
  px(ctx, -5, -2, 2, 2, C.GOLD_D);
  px(ctx, -5, 1, 2, 2, C.GOLD_D);
  ctx.restore();
}

function drawFireball(ctx, frame) {
  const pulse = Math.sin(frame * 0.2) * 0.5 + 0.5;
  const inner = Math.round(2 + pulse);
  px(ctx, -4, -4, 8, 8, C.FIREBALL);
  px(ctx, -3, -3, 6, 6, C.FIREBALL_L);
  px(ctx, -inner, -inner, inner * 2, inner * 2, '#ffdd00');
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLECTIBLE SPRITES
// ─────────────────────────────────────────────────────────────────────────────

function drawLotus(ctx, frame) {
  const bob = Math.sin(frame * 0.05) * 0.5;
  ctx.save();
  ctx.translate(0, Math.round(bob) * SCALE);
  // Petals
  const petals = [C.HP_FULL, '#ff6688', '#ff8899', C.HP_FULL, '#ff8899'];
  petals.forEach((col, i) => {
    const angle = (i / petals.length) * Math.PI * 2;
    const dx = Math.round(Math.cos(angle) * 3);
    const dy = Math.round(Math.sin(angle) * 3);
    px(ctx, dx - 1, dy - 1, 3, 3, col);
  });
  // Center
  px(ctx, -1, -1, 3, 3, C.GOLD_B);
  px(ctx, 0, 0, 1, 1, C.WHITE);
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// HUD SPRITES
// ─────────────────────────────────────────────────────────────────────────────

function drawHeart(ctx, x, y, filled) {
  const s = SCALE;
  const color = filled ? C.HP_FULL : C.HP_EMPTY;
  ctx.fillStyle = color;
  // 7×6 heart shape (canvas pixels, not sprite pixels)
  const heart = [
    [0,1,1,0,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0],
  ];
  heart.forEach((row, ry) => {
    row.forEach((bit, rx) => {
      if (bit) {
        ctx.fillRect(x + rx * s, y + ry * s, s, s);
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SPEECH BUBBLE
// ─────────────────────────────────────────────────────────────────────────────

function drawSpeechBubble(ctx, cx, cy, text) {
  const pad = 6;
  ctx.font = `bold ${10 * SCALE / 2}px monospace`;
  const tw = ctx.measureText(text).width;
  const bw = tw + pad * 2;
  const bh = 14 * SCALE / 2;

  const bx = cx - bw / 2;
  const by = cy - bh - 8;

  // Bubble background
  ctx.fillStyle = 'rgba(240,236,228,0.92)';
  ctx.fillRect(bx, by, bw, bh);
  // Border
  ctx.strokeStyle = C.BORDER;
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, bw, bh);
  // Tail
  ctx.fillStyle = 'rgba(240,236,228,0.92)';
  ctx.beginPath();
  ctx.moveTo(cx - 3, by + bh);
  ctx.lineTo(cx + 3, by + bh);
  ctx.lineTo(cx, by + bh + 5);
  ctx.closePath();
  ctx.fill();
  // Text
  ctx.fillStyle = '#1a0a00';
  ctx.fillText(text, bx + pad, by + bh - 4);
}
