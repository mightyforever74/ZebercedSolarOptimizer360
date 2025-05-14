export function calculateOptimalPanelLayout(obstacles, roofWidth, roofHeight) {
  const layouts = [
    { orientation: 'Yatay', width: 1.7, height: 1.1 },
    { orientation: 'Dikey', width: 1.1, height: 1.7 },
  ];

  const fitCount = ({ width: pw, height: ph }) => {
    const cols = Math.floor(roofWidth / pw);
    const rows = Math.floor(roofHeight / ph);
    let count = 0;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = x * pw;
        const py = y * ph;

        const blocked = obstacles.some(obs =>
          px < obs.position.x + obs.width &&
          px + pw > obs.position.x &&
          py < obs.position.y + obs.height &&
          py + ph > obs.position.y
        );

        if (!blocked) count++;
      }
    }
    return count;
  };

  const results = layouts.map(layout => {
    const count = fitCount(layout);
    return {
      orientation: layout.orientation,
      count,
      power: parseFloat((count * 570 / 1000).toFixed(2)),
    };
  });

  const [horizontal, vertical] = results;
  const best = horizontal.count >= vertical.count ? horizontal : vertical;

  return best;
}
