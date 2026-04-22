// ─────────────────────────────────────────────────────────────────────────────
// Cutscene Player — lightweight dialogue scenes rendered over the current room
// ─────────────────────────────────────────────────────────────────────────────

class CutscenePlayer {
  constructor() {
    this.reset();
  }

  reset() {
    this.active = false;
    this.sceneKey = null;
    this.lines = [];
    this.index = 0;
    this.title = '';
    this.caption = '';
    this.onComplete = null;
  }

  start(sceneKey, lines, options = {}) {
    this.active = true;
    this.sceneKey = sceneKey;
    this.lines = Array.isArray(lines) ? lines : [];
    this.index = 0;
    this.title = options.title || '';
    this.caption = options.caption || '';
    this.onComplete = options.onComplete || null;
  }

  update() {
    if (!this.active) return null;

    if (Input.wasPressed('Escape')) {
      return this._finish();
    }

    if (Input.wasPressed('Enter') || Input.wasPressed('Space') || Input.mouse.justClicked) {
      if (this.index < this.lines.length - 1) {
        this.index++;
      } else {
        return this._finish();
      }
    }

    return null;
  }

  draw(ctx, room) {
    if (room) {
      room.draw(ctx);
    } else {
      ctx.fillStyle = C.BG_TITLE;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    const current = this.lines[this.index] || { speaker: 'Narrator', text: '...' };
    const speaker = current.speaker || 'Narrator';
    const text = current.text || '';
    const panelX = 50;
    const panelY = CANVAS_H - 180;
    const panelW = CANVAS_W - 100;
    const panelH = 122;
    const speakerColor = speaker === 'Narrator' ? C.GOLD_B : C.WHITE;

    // Dim world behind the dialogue panel
    ctx.fillStyle = 'rgba(0,0,0,0.36)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Cinematic bars
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.fillRect(0, 0, CANVAS_W, 60);
    ctx.fillRect(0, CANVAS_H - 46, CANVAS_W, 46);

    // Scene heading
    if (this.title) {
      ctx.fillStyle = C.GOLD_B;
      ctx.font = `bold 22px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.title, CANVAS_W / 2, 24);
    }
    if (this.caption) {
      ctx.fillStyle = C.GOLD;
      ctx.font = `italic 12px serif`;
      ctx.fillText(this.caption, CANVAS_W / 2, 44);
    }

    // Dialogue panel
    ctx.fillStyle = 'rgba(8,8,18,0.88)';
    cutsceneRoundRect(ctx, panelX, panelY, panelW, panelH, 10);
    ctx.fill();

    ctx.strokeStyle = C.BORDER_GOLD;
    ctx.lineWidth = 2;
    cutsceneRoundRect(ctx, panelX, panelY, panelW, panelH, 10);
    ctx.stroke();

    ctx.fillStyle = speakerColor;
    ctx.font = `bold 16px serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(speaker, panelX + 18, panelY + 16);

    ctx.fillStyle = 'rgba(240,236,228,0.96)';
    ctx.font = `15px serif`;
    const lines = cutsceneWrapText(ctx, text, panelW - 36);
    lines.slice(0, 4).forEach((line, lineIndex) => {
      ctx.fillText(line, panelX + 18, panelY + 44 + lineIndex * 20);
    });

    ctx.fillStyle = 'rgba(212,160,23,0.85)';
    ctx.font = `11px 'Courier New', monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(
      `${this.index + 1}/${Math.max(this.lines.length, 1)}   ENTER/SPACE Next   ESC Skip`,
      panelX + panelW - 18,
      panelY + panelH - 18,
    );
  }

  _finish() {
    const result = {
      sceneKey: this.sceneKey,
      onComplete: this.onComplete,
    };
    this.reset();
    return result;
  }
}

function cutsceneWrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !currentLine) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

function cutsceneRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
