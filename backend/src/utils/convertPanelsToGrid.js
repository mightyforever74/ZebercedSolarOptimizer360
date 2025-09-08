/**
 * RL panel koordinat listesini 2D grid'e çevirir.
 * @param {Array} panels - [{x, y, width, height}, ...]
 * @param {number} roofWidth
 * @param {number} roofHeight
 * @returns {number[][]} - 2D grid (1: panel, 0: boş)
 */
export function convertPanelsToGrid(panels, roofWidth, roofHeight) {
  // grid'i sıfırlarla başlat
  const grid = Array.from({ length: roofHeight }, () =>
    Array(roofWidth).fill(0)
  );

  panels.forEach(panel => {
    for (let dy = 0; dy < panel.height; dy++) {
      for (let dx = 0; dx < panel.width; dx++) {
        const y = panel.y + dy;
        const x = panel.x + dx;
        if (
          y >= 0 && y < roofHeight &&
          x >= 0 && x < roofWidth
        ) {
          grid[y][x] = 1;
        }
      }
    }
  });

  return grid;
}