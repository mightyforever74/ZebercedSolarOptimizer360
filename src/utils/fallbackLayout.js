export function fallbackLayout(obstacles, roofWidth, roofHeight, panel) {
  const { width: pw, height: ph } = panel;
  const placedPanels = [];
  const cols = Math.floor(roofWidth / pw);
  const rows = Math.floor(roofHeight / ph);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = col * pw;
      const py = row * ph;

      const blocked = obstacles.some(
        (obs) =>
          // gerçekten içe giriyorsa çakışma: sınır temaslarını serbest bırakıyoruz
          px + pw > obs.position.x &&
          px < obs.position.x + obs.width &&
          py + ph > obs.position.y &&
          py < obs.position.y + obs.height
      );

      if (!blocked) {
        placedPanels.push({ x: px, y: py, width: pw, height: ph });
      }
    }
  }

  return placedPanels;
}
