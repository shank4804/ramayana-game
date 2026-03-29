// ─────────────────────────────────────────────────────────────────────────────
// TileMap — grid world + BFS pathfinding (adapted from pixel-agents)
// All positions stored as tile coordinates; rendering converts via TILE.
// ─────────────────────────────────────────────────────────────────────────────

class TileMap {
  constructor(cols, rows, data) {
    this.cols  = cols;
    this.rows  = rows;
    this.tiles = data; // flat array, row-major
  }

  get(col, row) {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return T_WALL;
    return this.tiles[row * this.cols + col];
  }

  isWalkable(col, row) {
    const t = this.get(col, row);
    return t === T_FLOOR || t === T_BRICK || t === T_PALACE;
  }

  // Pixel → tile coordinate
  tileAt(px2, py) {
    return {
      col: Math.floor(px2 / TILE),
      row: Math.floor(py  / TILE),
    };
  }

  // Tile center → canvas pixel
  tileCenterPx(col, row) {
    return {
      x: col * TILE + TILE / 2,
      y: row * TILE + TILE / 2,
    };
  }

  // BFS — returns array of {col,row} from start (exclusive) to goal (inclusive)
  // or null if unreachable.  Borrowed directly from pixel-agents tileMap.ts.
  findPath(startCol, startRow, goalCol, goalRow) {
    if (startCol === goalCol && startRow === goalRow) return [];

    const key = (c, r) => `${c},${r}`;
    const visited = new Set([key(startCol, startRow)]);
    const queue  = [{ col: startCol, row: startRow, path: [] }];

    while (queue.length) {
      const { col, row, path } = queue.shift();
      const neighbours = [
        { col: col,     row: row - 1 },
        { col: col,     row: row + 1 },
        { col: col - 1, row: row     },
        { col: col + 1, row: row     },
      ];
      for (const nb of neighbours) {
        const k = key(nb.col, nb.row);
        if (visited.has(k)) continue;
        visited.add(k);

        const isGoal = nb.col === goalCol && nb.row === goalRow;
        if (!isGoal && !this.isWalkable(nb.col, nb.row)) continue;

        const newPath = [...path, { col: nb.col, row: nb.row }];
        if (isGoal) return newPath;
        queue.push({ col: nb.col, row: nb.row, path: newPath });
      }
    }
    return null; // unreachable
  }

  draw(ctx, frame) {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const type = this.get(col, row);
        drawTile(ctx, type, col * TILE, row * TILE, frame);
      }
    }
  }
}
