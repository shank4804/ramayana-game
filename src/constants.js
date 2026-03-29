// ─── Rendering ───────────────────────────────────────────────────────────────
const CANVAS_W    = 800;
const CANVAS_H    = 608;
const SCALE       = 3;          // each sprite-pixel → 3×3 canvas pixels
const TILE_PX     = 16;         // sprite pixels per tile
const TILE        = TILE_PX * SCALE;  // 48 canvas pixels per tile
const COLS        = Math.floor(CANVAS_W / TILE);   // 16
const ROWS        = Math.floor(CANVAS_H / TILE);   // 12
const CHAR_W      = 16;         // character sprite width  (sprite px)
const CHAR_H      = 24;         // character sprite height (sprite px)

// ─── Tile types ───────────────────────────────────────────────────────────────
const T_FLOOR   = 0;
const T_WALL    = 1;
const T_TREE    = 2;
const T_WATER   = 3;
const T_BRICK   = 4;
const T_PALACE  = 5;
const T_PILLAR  = 6;

// ─── Game states ──────────────────────────────────────────────────────────────
const STATE_TITLE          = 'title';
const STATE_PLAYING        = 'playing';
const STATE_LEVEL_COMPLETE = 'level_complete';
const STATE_GAME_OVER      = 'game_over';
const STATE_WIN            = 'win';

// ─── Player ───────────────────────────────────────────────────────────────────
const PLAYER_SPEED      = 3.2;      // tiles per second
const PLAYER_MAX_HP     = 5;
const ARROW_SPEED       = 7.5;      // tiles per second
const ARROW_COOLDOWN    = 0.38;     // seconds
const ARROW_RANGE       = 9;        // tiles
const INVINCIBLE_TIME   = 1.5;      // seconds

// ─── Enemies ──────────────────────────────────────────────────────────────────
const RAKSHASA_SPEED    = 1.6;
const GUARD_SPEED       = 1.9;
const RAVANA_SPEED      = 1.2;
const CHASE_DIST        = 6;        // tiles
const ATTACK_DIST       = 0.65;     // tiles
const PATROL_PAUSE_MIN  = 1.0;
const PATROL_PAUSE_MAX  = 2.5;

// ─── Ravana boss ──────────────────────────────────────────────────────────────
const RAVANA_MAX_HP              = 10;
const RAVANA_FIREBALL_COOLDOWN   = 2.0;
const FIREBALL_SPEED             = 3.0;

// ─── Animation ────────────────────────────────────────────────────────────────
const WALK_FRAME_DUR   = 0.12;   // seconds per walk frame
const IDLE_BOB_SPEED   = 2.0;    // bob cycles per second

// ─── Color palette (pixel-agents dark aesthetic) ──────────────────────────────
const C = {
  // Background / UI
  BG:           '#0d0d1a',
  BG_TITLE:     '#07071a',
  PANEL:        'rgba(0,0,0,0.70)',
  BORDER:       '#2a1a00',
  BORDER_GOLD:  '#5a3a00',

  // Rama
  SKIN:         '#e8b878',
  SKIN_S:       '#c49a50',    // shadow
  HAIR:         '#1a0d05',
  HAIR_M:       '#2c1810',
  BLUE_D:       '#0a2a5e',
  BLUE:         '#1a4f98',
  BLUE_L:       '#3a8fcf',
  GOLD_D:       '#c8940a',
  GOLD:         '#d4a017',
  GOLD_B:       '#ffd700',
  BOW_D:        '#5a3010',
  BOW:          '#8b6400',
  EYE:          '#1a0a00',
  TILAK:        '#cc2200',
  WHITE:        '#f0ece4',
  ARROW_TIP:    '#c0c0c0',

  // Rakshasa / Ravana
  RK_SKIN:      '#6b1a1a',
  RK_SKIN_L:    '#8b2a20',
  RK_HORN:      '#3a0a00',
  RK_EYE:       '#ffa500',
  RK_CLOTH:     '#1a0a00',
  RK_CLOTH_M:   '#2e1000',
  RK_CLAW:      '#c8a030',
  RV_CROWN:     '#a07000',
  RV_CROWN_B:   '#d4a017',
  FIREBALL:     '#ff4400',
  FIREBALL_L:   '#ffaa00',

  // Tiles – Forest
  FLOOR_G:      '#1e3a10',    // dark forest ground
  FLOOR_G2:     '#192f0c',
  GRASS_D:      '#152508',
  GRASS_L:      '#2a5016',
  TREE_BASE:    '#0d1e06',
  TREE_MID:     '#1a3a0a',
  TREE_TOP:     '#2a5e12',
  TREE_TRUNK:   '#3a2008',
  WATER_D:      '#060e22',
  WATER_M:      '#0a1a3e',
  WATER_L:      '#122a5a',
  WATER_SHIM:   '#1e4a8a',

  // Tiles – Lanka / Palace
  BRICK_D:      '#1a0800',
  BRICK_M:      '#3a1200',
  BRICK_L:      '#5a2000',
  BRICK_MORT:   '#0a0400',
  PALACE_D:     '#080818',
  PALACE_M:     '#10102e',
  PALACE_L:     '#1a1a4a',
  PALACE_GOLD:  '#2a1800',
  PILLAR_D:     '#0e0e24',
  PILLAR_L:     '#2a2a60',

  // HUD
  HP_FULL:      '#e03a3a',
  HP_EMPTY:     '#2a1010',
  HUD_TEXT:     '#ffd700',
  HUD_BG:       'rgba(0,0,0,0.6)',
};
