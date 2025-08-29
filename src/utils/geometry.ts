// src/utils/geometry.ts
export type Rect = { x:number; y:number; width:number; height:number };

export function isObstacleInsideRoof(
  roofWidth: number,
  roofHeight: number,
  o: Rect | null | undefined
): boolean {
  if (!Number.isFinite(roofWidth) || !Number.isFinite(roofHeight)) return false;
  if (!o) return false;

  const x = Number(o.x), y = Number(o.y), w = Number(o.width), h = Number(o.height);
  if (![x, y, w, h].every(Number.isFinite)) return false;
  if (w <= 0 || h <= 0) return false;

  const left = x;
  const right = x + w;
  const top = y;
  const bottom = y + h;

  // Çatı (0,0) sol-üst kabulü ile: engel tamamen içeride mi?
  return left >= 0 && top >= 0 && right <= roofWidth && bottom <= roofHeight;
}

// İstersen kısmi taşmaları engellemek için "düzelterek" dönen versiyon:
export function clampObstacleToRoof(
  roofWidth: number,
  roofHeight: number,
  o: Rect
): Rect {
  const x = Math.max(0, Math.min(o.x, Math.max(0, roofWidth - o.width)));
  const y = Math.max(0, Math.min(o.y, Math.max(0, roofHeight - o.height)));
  const w = Math.max(0, Math.min(o.width, roofWidth));
  const h = Math.max(0, Math.min(o.height, roofHeight));
  return { x, y, width: w, height: h };
}
