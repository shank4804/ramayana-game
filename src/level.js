// ─────────────────────────────────────────────────────────────────────────────
// Level utilities — map parsing and tile helpers
// The old Level class has been replaced by Room (room.js) + Chapters (chapters.js)
// ─────────────────────────────────────────────────────────────────────────────

// Helper: build flat tile array from a string map
// Characters: '.' floor  '#' tree  '~' water  'W' wall  'B' brick
//             'P' palace 'L' pillar
function parseMap(str) {
  const lines = str.trim().split('\n').map(l => l.trimEnd());
  const rows  = lines.length;
  const cols  = Math.max(...lines.map(l => l.length));
  const data  = [];
  for (let r = 0; r < rows; r++) {
    const line = lines[r].padEnd(cols, '#');
    for (let c = 0; c < cols; c++) {
      switch (line[c]) {
        case '.': data.push(T_FLOOR);  break;
        case '~': data.push(T_WATER);  break;
        case '#': data.push(T_TREE);   break;
        case 'W': data.push(T_WALL);   break;
        case 'B': data.push(T_BRICK);  break;
        case 'P': data.push(T_PALACE); break;
        case 'L': data.push(T_PILLAR); break;
        default:  data.push(T_FLOOR);  break;
      }
    }
  }
  return { data, cols, rows };
}

// Helper: tile center in canvas pixels
function tilemap_centerOf(tilemap, col, row) {
  return tilemap.tileCenterPx(col, row);
}
