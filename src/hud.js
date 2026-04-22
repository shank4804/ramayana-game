// ─────────────────────────────────────────────────────────────────────────────
// HUD — health hearts, level name, score, controls hint
// Semi-transparent dark panes + gold text
// ─────────────────────────────────────────────────────────────────────────────

const HUD = {
  draw(ctx, player, chapterIndex, chapterName, score, roomName) {
    // ── Top-left panel ────────────────────────────────────────────────────
    const panelW = 180;
    const panelH = 60;
    const px2    = 10;
    const py2    = 10;

    ctx.fillStyle = C.HUD_BG;
    roundRect(ctx, px2, py2, panelW, panelH, 5);
    ctx.fill();

    ctx.strokeStyle = C.BORDER_GOLD;
    ctx.lineWidth = 1;
    roundRect(ctx, px2, py2, panelW, panelH, 5);
    ctx.stroke();

    // Level name
    ctx.fillStyle   = C.GOLD_B;
    ctx.font        = `bold 11px 'Courier New', monospace`;
    ctx.textAlign   = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Ch ${chapterIndex + 1}: ${chapterName}`, px2 + 8, py2 + 6);

    // Room name (smaller, below chapter name)
    if (roomName) {
      ctx.fillStyle = C.GOLD;
      ctx.font = `9px 'Courier New', monospace`;
      ctx.fillText(roomName, px2 + 8, py2 + 18);
    }

    // Hearts
    for (let i = 0; i < PLAYER_MAX_HP; i++) {
      drawHeart(ctx, px2 + 8 + i * (7 * SCALE + 2), py2 + 30, i < player.hp);
    }

    // ── Score (top-right) ─────────────────────────────────────────────────
    ctx.fillStyle    = C.HUD_BG;
    ctx.textAlign    = 'right';
    roundRect(ctx, CANVAS_W - 120, py2, 110, 28, 4);
    ctx.fill();
    ctx.strokeStyle  = C.BORDER_GOLD;
    ctx.lineWidth    = 1;
    roundRect(ctx, CANVAS_W - 120, py2, 110, 28, 4);
    ctx.stroke();

    ctx.fillStyle    = C.GOLD;
    ctx.font         = `bold 11px 'Courier New', monospace`;
    ctx.textBaseline = 'middle';
    ctx.fillText(`Score: ${score}`, CANVAS_W - 16, py2 + 14);

    // ── Bottom controls hint ───────────────────────────────────────────────
    ctx.fillStyle    = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, CANVAS_H - 22, CANVAS_W, 22);

    ctx.fillStyle    = 'rgba(200,180,100,0.7)';
    ctx.font         = `10px 'Courier New', monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      'WASD / ↑↓←→ Move   •   SPACE / Click   Shoot   •   P   Pause',
      CANVAS_W / 2, CANVAS_H - 11,
    );
  },
};

// Utility: draw rounded rectangle path
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x,     y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x,     y,     x + r, y);
  ctx.closePath();
}
