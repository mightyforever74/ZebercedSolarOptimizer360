export function calculateOptimalPanelLayout(obstacles, roofWidth, roofHeight) {
  const layouts = [
    { orientation: 'Yatay', width: 1.7, height: 1.1 },
    { orientation: 'Dikey', width: 1.1, height: 1.7 },
  ];

  const fitLayout = ({ width: pw, height: ph }) => {
    const cols = Math.floor(roofWidth / pw);
    const rows = Math.floor(roofHeight / ph);
    const placedPanels = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const px = col * pw;
        const py = row * ph;

        const blocked = obstacles.some(obs =>
          px < obs.position.x + obs.width &&
          px + pw > obs.position.x &&
          py < obs.position.y + obs.height &&
          py + ph > obs.position.y
        );

        if (!blocked) {
          placedPanels.push({ x: px, y: py, width: pw, height: ph });
        }
      }
    }

    return placedPanels;
  };

  const results = layouts.map(layout => {
    const placed = fitLayout(layout);
    return {
      orientation: layout.orientation,
      count: placed.length,
      power: parseFloat((placed.length * 570 / 1000).toFixed(2)),
      layout: placed
    };
  });

  const best = results.reduce((a, b) => (a.count >= b.count ? a : b));
  return best;
}
