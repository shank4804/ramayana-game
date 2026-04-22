// ─────────────────────────────────────────────────────────────────────────────
// Game — main loop + state machine
// States: title → chapter_intro → cutscene → playing → level_complete
//       → game_over → win
// ─────────────────────────────────────────────────────────────────────────────

const SAVE_KEY = 'ramayana-p0-save-v3';

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.state        = STATE_TITLE;
    this.room         = null;       // current Room instance
    this.chapterIndex = 0;
    this.score        = 0;

    this.lastTime     = 0;
    this.paused       = false;

    // Screen-transition overlay
    this.fadeAlpha    = 0;
    this.fadingOut    = false;
    this.fadeCallback = null;

    // Title / screen animation
    this.titleFrame   = 0;

    // Chapter intro overlay
    this.introTimer   = 0;

    // Player state carried between rooms
    this._playerState = null;
    this._roomStates  = {};
    this._storyFlags  = {};
    this._hasContinue = this._readSaveData() !== null;
    this.cutscene     = new CutscenePlayer();

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
      case STATE_CHAPTER_INTRO:  this._updateChapterIntro(dt);  break;
      case STATE_CUTSCENE:       this._updateCutscene(dt);      break;
      case STATE_PLAYING:        this._updatePlaying(dt);       break;
      case STATE_LEVEL_COMPLETE: this._updateLevelComplete(dt); break;
      case STATE_GAME_OVER:      this._updateGameOver(dt);      break;
      case STATE_WIN:            this._updateWin(dt);           break;
    }
  }

  _updateTitle(dt) {
    if (this._hasContinue && Input.wasPressed('KeyC')) {
      this._fadeToState(STATE_PLAYING, () => this._continueFromSave());
      return;
    }
    if (Input.wasPressed('Enter') || Input.wasPressed('Space') || Input.mouse.justClicked) {
      this._fadeToState(STATE_CHAPTER_INTRO, () => this._beginNewGame());
    }
  }

  _updateChapterIntro(dt) {
    this.introTimer -= dt;
    if (this.introTimer <= 0 || Input.wasPressed('Enter') || Input.wasPressed('Space') || Input.mouse.justClicked) {
      this._exitChapterIntro();
    }
  }

  _updateCutscene(dt) {
    const result = this.cutscene.update();
    if (!result) return;

    if (result.sceneKey) {
      this._storyFlags[result.sceneKey] = true;
      this._saveProgress(this.room?.id);
    }

    if (result.onComplete) {
      result.onComplete();
    } else {
      this.state = STATE_PLAYING;
    }
  }

  _updatePlaying(dt) {
    if (Input.wasPressed('KeyP') || Input.wasPressed('Escape')) {
      this.paused = !this.paused;
    }
    if (this.paused) return;

    const prevEnemies = this.room.enemies.length;
    this.room.update(dt);
    const killed = prevEnemies - this.room.enemies.length;
    if (killed > 0) this.score += killed * 100;

    // Player death
    if (this.room.player.dead) {
      this._fadeToState(STATE_GAME_OVER);
      return;
    }

    // Room transition (player walked to edge exit)
    if (this.room.transitionTo) {
      const { roomId, edge } = this.room.transitionTo;
      this._rememberCurrentRoom();
      this._playerState = this.room.getPlayerState();
      this._fadeToState(STATE_PLAYING, () => this._enterRoom(roomId, edge));
      return;
    }

    // Room/chapter complete
    if (this.room.complete) {
      this._rememberCurrentRoom();
      if (this.room.isFinalRoom || this.room.isChapterEnd) {
        this._handleChapterCompletion();
      }
    }
  }

  _updateLevelComplete(dt) {
    if (Input.wasPressed('Enter') || Input.wasPressed('Space') || Input.mouse.justClicked) {
      this._fadeToState(STATE_CHAPTER_INTRO, () => this._startChapter(this.chapterIndex));
    }
  }

  _updateGameOver(dt) {
    if (this._hasContinue && Input.wasPressed('KeyC')) {
      this._fadeToState(STATE_PLAYING, () => this._continueFromSave());
      return;
    }
    if (Input.wasPressed('Enter') || Input.wasPressed('Space') || Input.mouse.justClicked) {
      this._fadeToState(STATE_CHAPTER_INTRO, () => this._beginNewGame());
    }
  }

  _updateWin(dt) {
    if (Input.wasPressed('Enter') || Input.wasPressed('Space') || Input.mouse.justClicked) {
      this._clearSaveData();
      this._hasContinue = false;
      this.score = 0;
      this._playerState = null;
      this._roomStates = {};
      this._storyFlags = {};
      this.cutscene.reset();
      this.state = STATE_TITLE;
    }
  }

  // ── Room/Chapter management ────────────────────────────────────────────────

  _beginNewGame() {
    this.score = 0;
    this.paused = false;
    this._playerState = null;
    this._roomStates = {};
    this._storyFlags = {};
    this.cutscene.reset();
    this._clearSaveData();
    this._hasContinue = false;
    this._startChapter(0);
  }

  _startChapter(chapterIndex) {
    this.chapterIndex = chapterIndex;
    this.introTimer   = 3.0;
    const chapter     = CHAPTERS[chapterIndex];
    const firstRoom   = chapter.rooms[0];
    const spawn       = this._getRoomStartPosition(firstRoom);
    this._openRoom(firstRoom, spawn, this._playerState);
  }

  _enterRoom(roomId, fromEdge) {
    const roomDef = findRoomDef(roomId);
    if (!roomDef) return;

    // Update chapter index if crossing chapters
    this.chapterIndex = getChapterIndex(roomId);
    const spawn = this._getRoomEntryPosition(roomDef, fromEdge);
    this._openRoom(roomDef, spawn, this._playerState);
  }

  _openRoom(roomDef, spawn, playerState) {
    const roomOverride = {
      x: spawn.x,
      y: spawn.y,
      roomState: this._roomStates[roomDef.id] || null,
    };
    if (playerState && playerState.hp !== undefined) {
      roomOverride.hp = playerState.hp;
    }
    this.room = new Room(roomDef, roomOverride);
    this._playerState = null;
    this.paused = false;
    this.cutscene.reset();
    this._saveProgress(roomDef.id);
  }

  _exitChapterIntro() {
    const chapter = CHAPTERS[this.chapterIndex];
    const sceneKey = `chapter-${this.chapterIndex}-opening`;
    if (chapter.openingScene && !this._storyFlags[sceneKey]) {
      this._fadeToState(STATE_CUTSCENE, () => {
        this.cutscene.start(sceneKey, chapter.openingScene, {
          title: chapter.name,
          caption: chapter.subtitle,
          onComplete: () => {
            this.state = STATE_PLAYING;
            this._saveProgress(this.room?.id);
          },
        });
      });
      return;
    }

    this._fadeToState(STATE_PLAYING);
  }

  _handleChapterCompletion() {
    const nextChapter = this.chapterIndex + 1;
    const chapter = CHAPTERS[this.chapterIndex];
    const sceneKey = `chapter-${this.chapterIndex}-ending`;
    const isCampaignEnd = this.room.isFinalRoom || nextChapter >= CHAPTERS.length;

    if (!isCampaignEnd) {
      this._playerState = this.room.getPlayerState();
    }

    const finishChapter = () => {
      if (isCampaignEnd) {
        this._fadeToState(STATE_WIN);
      } else {
        this._fadeToState(STATE_LEVEL_COMPLETE, () => {
          this.chapterIndex = nextChapter;
        });
      }
    };

    if (chapter.endingScene && !this._storyFlags[sceneKey]) {
      this._fadeToState(STATE_CUTSCENE, () => {
        this.cutscene.start(sceneKey, chapter.endingScene, {
          title: `${chapter.name} Complete`,
          caption: chapter.subtitle,
          onComplete: finishChapter,
        });
      });
      return;
    }

    finishChapter();
  }

  _getRoomStartPosition(roomDef) {
    const tempMap = parseMap(roomDef.mapStr);
    const tempTilemap = new TileMap(tempMap.cols, tempMap.rows, tempMap.data);
    return tempTilemap.tileCenterPx(roomDef.playerStart.col, roomDef.playerStart.row);
  }

  _getRoomEntryPosition(roomDef, fromEdge) {
    const tempMap = parseMap(roomDef.mapStr);
    const tempTilemap = new TileMap(tempMap.cols, tempMap.rows, tempMap.data);
    const midCol = Math.floor(tempMap.cols / 2);
    const midRow = Math.floor(tempMap.rows / 2);

    switch (fromEdge) {
      case 'west':
        return tempTilemap.tileCenterPx(tempMap.cols - 2, midRow);
      case 'east':
        return tempTilemap.tileCenterPx(1, midRow);
      case 'north':
        return tempTilemap.tileCenterPx(midCol, tempMap.rows - 2);
      case 'south':
        return tempTilemap.tileCenterPx(midCol, 1);
      default:
        return this._getRoomStartPosition(roomDef);
    }
  }

  _rememberCurrentRoom() {
    if (!this.room) return;
    this._roomStates[this.room.id] = this.room.getRoomState();
  }

  _saveProgress(roomId) {
    const playerState = this.room ? this.room.getPlayerState() : this._playerState;
    if (!roomId || !playerState) return;

    const payload = {
      chapterIndex: this.chapterIndex,
      roomId,
      score: this.score,
      playerState,
      roomStates: this._roomStates,
      storyFlags: this._storyFlags,
    };

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      this._hasContinue = true;
    } catch (err) {
      console.warn('Unable to save game progress.', err);
    }
  }

  _continueFromSave() {
    const save = this._readSaveData();
    if (!save) {
      this._beginNewGame();
      return;
    }

    const roomDef = findRoomDef(save.roomId) || CHAPTERS[save.chapterIndex]?.rooms?.[0];
    if (!roomDef) {
      this._beginNewGame();
      return;
    }

    this.score = save.score || 0;
    this.chapterIndex = typeof save.chapterIndex === 'number'
      ? save.chapterIndex
      : getChapterIndex(roomDef.id);
    this._roomStates = save.roomStates || {};
    this._storyFlags = save.storyFlags || {};
    this._playerState = save.playerState || { hp: PLAYER_MAX_HP };
    this._openRoom(roomDef, this._getRoomStartPosition(roomDef), this._playerState);
  }

  _readSaveData() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.roomId || !findRoomDef(parsed.roomId)) return null;
      return parsed;
    } catch (err) {
      console.warn('Unable to read saved progress.', err);
      return null;
    }
  }

  _clearSaveData() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (err) {
      console.warn('Unable to clear saved progress.', err);
    }
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
      case STATE_CHAPTER_INTRO:  this._renderChapterIntro(ctx);  break;
      case STATE_CUTSCENE:       this._renderCutscene(ctx);      break;
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
    this.room.draw(ctx);
    const chapter = CHAPTERS[this.chapterIndex];
    HUD.draw(ctx, this.room.player, this.chapterIndex, chapter.name, this.score, this.room.def.name);

    // Pause overlay
    if (this.paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      this._drawCenteredText(ctx, 'PAUSED', CANVAS_H / 2 - 20, C.GOLD_B, `bold 32px serif`);
      this._drawCenteredText(ctx, 'Press P to resume', CANVAS_H / 2 + 20, C.GOLD, `14px 'Courier New'`);
    }
  }

  _renderCutscene(ctx) {
    this.cutscene.draw(ctx, this.room);
  }

  // ── Chapter intro screen ───────────────────────────────────────────────────
  _renderChapterIntro(ctx) {
    this._drawStarfield(ctx);

    const chapter = CHAPTERS[this.chapterIndex];
    const cx = CANVAS_W / 2;
    const introLines = Array.isArray(chapter.introText)
      ? chapter.introText
      : (chapter.introText ? [chapter.introText] : []);

    // Chapter number
    ctx.save();
    ctx.fillStyle = C.GOLD;
    ctx.font = `italic 16px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Chapter ${this.chapterIndex + 1}`, cx, CANVAS_H / 2 - 70);

    // Chapter name
    ctx.shadowColor = C.GOLD;
    ctx.shadowBlur  = 20 + Math.sin(this.titleFrame * 0.05) * 8;
    ctx.fillStyle   = C.GOLD_B;
    ctx.font        = `bold 36px serif`;
    ctx.fillText(chapter.name, cx, CANVAS_H / 2 - 28);
    ctx.restore();

    // Subtitle
    ctx.fillStyle = C.WHITE;
    ctx.font = `italic 14px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(chapter.subtitle, cx, CANVAS_H / 2 + 10);

    if (introLines.length > 0) {
      ctx.fillStyle = 'rgba(240,236,228,0.9)';
      ctx.font = `13px serif`;
      introLines.forEach((line, index) => {
        ctx.fillText(line, cx, CANVAS_H / 2 + 40 + index * 18);
      });
    }

    // Skip hint
    if (Math.floor(this.titleFrame / 30) % 2 === 0) {
      ctx.fillStyle = 'rgba(200,180,100,0.6)';
      ctx.font = `11px 'Courier New', monospace`;
      ctx.fillText('Press ENTER to continue', cx, CANVAS_H / 2 + 100);
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
      ctx.fillText(
        this._hasContinue ? 'Press C to continue or ENTER to begin anew' : 'Press ENTER or SPACE to begin',
        cx,
        cy + 65,
      );
    }

    // Controls
    ctx.fillStyle   = 'rgba(200,180,100,0.6)';
    ctx.font        = `11px 'Courier New', monospace`;
    ctx.fillText('Move: WASD / Arrow Keys     Shoot: Space / Click     Continue: C', cx, cy + 100);

    // Version watermark
    ctx.fillStyle   = 'rgba(255,255,255,0.2)';
    ctx.font        = `9px monospace`;
    ctx.textAlign   = 'right';
    ctx.fillText('v2.0', CANVAS_W - 8, CANVAS_H - 8);
  }

  // ── Level complete screen ──────────────────────────────────────────────────
  _renderLevelComplete(ctx) {
    if (this.room) this.room.draw(ctx);

    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const nextChapter = CHAPTERS[this.chapterIndex];
    this._drawCenteredText(ctx, 'Chapter Complete!', CANVAS_H / 2 - 60, C.GOLD_B, `bold 28px serif`);
    this._drawCenteredText(ctx, `Score: ${this.score}`, CANVAS_H / 2 - 20, C.GOLD, `bold 16px 'Courier New'`);
    if (nextChapter) {
      this._drawCenteredText(ctx, `Next: ${nextChapter.name}`, CANVAS_H / 2 + 18, C.WHITE, `italic 14px serif`);
      this._drawCenteredText(ctx, nextChapter.subtitle, CANVAS_H / 2 + 40, C.GOLD, `12px serif`);
    }

    if (Math.floor(this.titleFrame / 25) % 2 === 0) {
      this._drawCenteredText(ctx, 'Press ENTER / SPACE to continue', CANVAS_H / 2 + 76, C.GOLD, `12px 'Courier New'`);
    }
  }

  // ── Game over screen ───────────────────────────────────────────────────────
  _renderGameOver(ctx) {
    if (this.room) this.room.draw(ctx);

    ctx.fillStyle = 'rgba(30,0,0,0.80)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    this._drawCenteredText(ctx, 'RAMA HAS FALLEN', CANVAS_H / 2 - 40, '#ff4444', `bold 30px serif`);
    this._drawCenteredText(ctx, 'The demons rejoice...', CANVAS_H / 2, C.GOLD, `italic 15px serif`);
    this._drawCenteredText(ctx, `Final Score: ${this.score}`, CANVAS_H / 2 + 40, C.WHITE, `bold 14px 'Courier New'`);

    if (Math.floor(this.titleFrame / 25) % 2 === 0) {
      const prompt = this._hasContinue
        ? 'Press C to continue from autosave or ENTER to restart'
        : 'Press ENTER to try again';
      this._drawCenteredText(ctx, prompt, CANVAS_H / 2 + 80, C.GOLD, `12px 'Courier New'`);
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

    // Draw Rama
    ctx.save();
    ctx.translate(cx - 8 * SCALE, CANVAS_H / 2 - 30);
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
    ctx.fillStyle = C.BG_TITLE;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = 'rgba(255,255,200,0.6)';
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
