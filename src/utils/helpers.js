// Geometri ve grid hesaplama fonksiyonları
export function rectanglesIntersect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function calculateBrutArea(points = []) {
  // Çokgen alanı hesaplama (shoelace formülü)
  const n = points.length;
  if (n < 3) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const { x: x1, y: y1 } = points[i];
    const { x: x2, y: y2 } = points[(i + 1) % n];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}
// Panel sayısını ve yönünü hesaplar
export function calculatePanelCount(
  roofWidth,
  roofHeight,
  panelWidth,
  panelHeight,
  obstacles = [],
  roofPolygon = []   // Bakım boşluğunun yüksekliği (örn. 30 cm)

) {
  // Polygon tanımlıysa, grid dışı koordinatlar atlanacak
  const insidePolygon = (rect) => {
    if (roofPolygon.length < 3) return true; // polygon yoksa tüm grid geçerli
    // Panelin merkez noktasını al
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    // Ray-casting algoritması
    let inside = false;
    for (let i = 0, j = roofPolygon.length - 1; i < roofPolygon.length; j = i++) {
      const xi = roofPolygon[i].x, yi = roofPolygon[i].y;
      const xj = roofPolygon[j].x, yj = roofPolygon[j].y;
      const intersect = ((yi > cy) !== (yj > cy)) &&
        (cx < (xj - xi) * (cy - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Varsayılan yön
  let countDefault = 0;
  const rowsDefault = Math.floor(roofHeight / panelHeight);
  const colsDefault = Math.floor(roofWidth / panelWidth);
  for (let r = 0; r < rowsDefault; r++) {
    for (let c = 0; c < colsDefault; c++) {
      const rect = { x: c * panelWidth, y: r * panelHeight, width: panelWidth, height: panelHeight };
      if (
        insidePolygon(rect) &&
        !obstacles.some(obs => rectanglesIntersect(rect, obs))
      ) {
        countDefault++;
      }
    }
  }

  // Döndürülmüş yön
  let countRotated = 0;
  const rowsRot = Math.floor(roofHeight / panelWidth);
  const colsRot = Math.floor(roofWidth / panelHeight);
  for (let r = 0; r < rowsRot; r++) {
    for (let c = 0; c < colsRot; c++) {
      const rect = { x: c * panelHeight, y: r * panelWidth, width: panelHeight, height: panelWidth };
      if (
        insidePolygon(rect) &&
        !obstacles.some(obs => rectanglesIntersect(rect, obs))
      ) {
        countRotated++;
      }
    }
  }

  return {
    count: Math.max(countDefault, countRotated),
    orientation: countDefault >= countRotated ? 'default' : 'rotated',
  };
}export function generatePanelLayout(
  roofWidth,
  roofHeight,
  panelWidth,
  panelHeight,
  obstacles = [],
  roofPolygon = []
) {
  const { orientation } = calculatePanelCount(
    roofWidth,
    roofHeight,
    panelWidth,
    panelHeight,
    obstacles,
    roofPolygon
  );
  const layout = [];
  const insidePolygon = rect => {
    if (roofPolygon.length < 3) return true;
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    let inside = false;
    for (let i = 0, j = roofPolygon.length - 1; i < roofPolygon.length; j = i++) {
      const xi = roofPolygon[i].x, yi = roofPolygon[i].y;
      const xj = roofPolygon[j].x, yj = roofPolygon[j].y;
      const intersect = ((yi > cy) !== (yj > cy)) &&
        (cx < (xj - xi) * (cy - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  if (orientation === 'default') {
    const rows = Math.floor(roofHeight / panelHeight);
    const cols = Math.floor(roofWidth / panelWidth);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rect = { x: c * panelWidth, y: r * panelHeight, width: panelWidth, height: panelHeight };
        if (insidePolygon(rect) && !obstacles.some(obs => rectanglesIntersect(rect, obs))) {
          layout.push(rect);
        }
      }
    }
  } else {
    const rows = Math.floor(roofHeight / panelWidth);
    const cols = Math.floor(roofWidth / panelHeight);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rect = { x: c * panelHeight, y: r * panelWidth, width: panelHeight, height: panelWidth };
        if (insidePolygon(rect) && !obstacles.some(obs => rectanglesIntersect(rect, obs))) {
          layout.push(rect);
        }
      }
    }
  }
  return layout;}
// panel layout fonksiyonu:Panel yerleşimi için çatı ve engel (obstacle) bilgisi ile, panelleri önce yatay (“default”) sonra dikey (“rotated”) yerleştirip, hangisinde daha fazla panel sığarsa onu seçiyor.

//rectanglesIntersect fonksiyonu ile engeller ve çatı sınırları ile çakışan paneller hariç tutuluyor.

//Eğer çatı poligon olarak tanımlıysa, panelin merkezi ray-casting yöntemiyle çatının içinde mi diye kontrol ediliyor.

//Hem panel sayısı hem de layout (koordinatlar) aynı mantıkla, iki yönlü (yatay-dikey) optimize ediliyor.