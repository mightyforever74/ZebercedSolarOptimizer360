import React, { useRef, useState, useEffect, useId } from "react";
import "./ObstacleEditor.css";
type Obstacle = {
  x: number; y: number; width: number; height: number;
  type?: string; position?: { x: number; y: number };
};

type ObstacleEditorProps = {
  roofWidth: number;
  roofHeight: number;
  obstacles: Obstacle[];
  placeByClick: boolean;
  obsWidth: string;
  obsHeight: string;
  mousePreview: { x: number; y: number } | null;
  onMousePlace: (x: number, y: number) => void;
  onMousePreview: (x: number, y: number) => void;
  showObstacles?: boolean;

  // Görsel/etkileşim ayarları (opsiyonel)
  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;
  padding?: number;
  showLabels?: boolean;
  showHud?: boolean;
  decimals?: number;

  // Yeni: ışık/renk ayarları
  sunAzimuthDeg?: number;     // 0=sağ, 90=aşağı, 180=sol, 270=yukarı (SVG koordinatı)
  sunIntensity?: number;      // 0..1 arası önerilir
  roofHue?: number;           // 210=soğuk mavi ton (default)
};

const ObstacleEditor: React.FC<ObstacleEditorProps> = ({
  roofWidth,
  roofHeight,
  obstacles = [],
  placeByClick,
  obsWidth,
  obsHeight,
  mousePreview,
  onMousePlace,
  onMousePreview,
  showObstacles = true,
  maxWidth = 650,
  minWidth = 320,
  maxHeight = 520,
  padding = 12,
  showLabels = true,
  showHud = true,
  decimals = 2,

  sunAzimuthDeg = 35,     // ışık sağ-üstten
  sunIntensity = 0.55,
  roofHue = 215,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(maxWidth);
  const uid = useId(); // <defs> id çakışmalarını engelle

  useEffect(() => {
    if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    const handleResize = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [maxWidth, minWidth]);

  const viewW = Math.min(containerWidth, maxWidth);
  const viewH = maxHeight;
  const scale =
    roofWidth > 0 && roofHeight > 0
      ? Math.min((viewW - 2 * padding) / roofWidth, (viewH - 2 * padding) / roofHeight)
      : 1;

  // Dinamik kiremit boyutu (px) — zoom'a göre değişir
  const tileW = Math.max(26, Math.min(60, Math.round(36 + scale * 0.10 * 100)));
  const tileH = Math.round(tileW * 0.66);

  // İkonik drop‑shadow ofseti (ışık yönüne göre)
  const rad = (sunAzimuthDeg * Math.PI) / 180;
  const shadowDx = Math.cos(rad) * 3.2;
  const shadowDy = Math.sin(rad) * 3.2;

  // Önizleme ölçüleri
  const nW = Number(obsWidth || 0);
  const nH = Number(obsHeight || 0);
  const hasPreviewSize = nW > 0 && nH > 0;

  // Çatı boyutları (padding dahil)
  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  /** Mouse event'ini, çatı dikdörtgenine göre (sol-alt referans) (x,y) metreye çevirir */
  function clientToRoofXY(
    e: React.MouseEvent<SVGSVGElement>,
    roofWidth: number,
    roofHeight: number,
    scale: number,
    padding: number
  ) {
    const svgRect = e.currentTarget.getBoundingClientRect();
    // Çatı px boyutları
    const roofPxW = roofWidth * scale;
    const roofPxH = roofHeight * scale;

    // SVG sol-üstten itibaren, çatının sol-üst köşesine göre px ofset
    const localX = (e.clientX - svgRect.left) - padding;
    const localY = (e.clientY - svgRect.top) - padding;

    const inside =
      localX >= 0 && localY >= 0 && localX <= roofPxW && localY <= roofPxH;

    // px -> metre dönüşümü (bizde referans sol-alt)
    let x = localX / scale;
    let y = roofHeight - (localY / scale);

    // Çatı sınırlarına kilitle
    x = clamp(x, 0, roofWidth);
    y = clamp(y, 0, roofHeight);

    return { x, y, inside };
  }

  // Mouse olayları: sol‑alt referans sistemine çevir
 function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
  if (!placeByClick) return;

  const { x, y, inside } = clientToRoofXY(e, roofWidth, roofHeight, scale, padding);
  // Engel boyutunu da hesaba kat: (x,y) engelin sol-alt köşesi
  const maxX = Math.max(0, roofWidth - Number(obsWidth || 0));
  const maxY = Math.max(0, roofHeight - Number(obsHeight || 0));

  // (İstersen inside değilse return edebilirsin)
  const px = clamp(x, 0, maxX);
  const py = clamp(y, 0, maxY);

  onMousePlace?.(Number(px.toFixed(decimals)), Number(py.toFixed(decimals)));
}

function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
  if (!placeByClick) return;

  const { x, y } = clientToRoofXY(e, roofWidth, roofHeight, scale, padding);
  const maxX = Math.max(0, roofWidth - Number(obsWidth || 0));
  const maxY = Math.max(0, roofHeight - Number(obsHeight || 0));

  const px = clamp(x, 0, maxX);
  const py = clamp(y, 0, maxY);

  onMousePreview?.(Number(px.toFixed(decimals)), Number(py.toFixed(decimals)));
}

// Benzersiz id'ler
const roofGradId = `roofGrad-${uid}`;
const roofTilesId = `roofTiles-${uid}`;
const innerShadowId = `innerShadow-${uid}`;
const tileShadowId = `tileShadow-${uid}`;
const vignetteId = `vignette-${uid}`;
const noiseId = `noise-${uid}`;
const obsShadowId = `obsShadow-${uid}`;
const obsGradId = `obsGrad-${uid}`;
const obsPrevGradId = `obsPrevGrad-${uid}`;

  // Işık yönlü lineer gradyan vektörü
const gx1 = 0, gy1 = 0;
const gx2 = Math.cos(rad), gy2 = Math.sin(rad);

  return (
    <div
      ref={containerRef}
      className={
        "tw-relative tw-bg-gray-100 tw-border tw-rounded-lg tw-shadow-sm tw-p-2 tw-flex tw-justify-center " +
        (maxWidth === 400 ? "tw-max-w-[400px]" : maxWidth === 650 ? "tw-max-w-[650px]" : "tw-max-w-[320px]")
      }
    >
      {/* Sol üstte canlı HUD */}
      {showHud && placeByClick && (
        <div className="tw-absolute tw-left-3 tw-top-3 tw-z-10 tw-text-xs tw-bg-white/90 tw-backdrop-blur tw-rounded tw-shadow tw-px-2 tw-py-1 tw-font-medium tw-text-blue-gray-700">
          {mousePreview ? `x: ${mousePreview.x.toFixed(decimals)} m,  y: ${mousePreview.y.toFixed(decimals)} m` : "x: –, y: –"}
        </div>
      )}

      <svg
        width={viewW}
        height={viewH}
        className="tw-bg-[#f8fafc] tw-block"
        onClick={placeByClick ? handleSvgClick : undefined}
        onMouseMove={placeByClick ? handleMouseMove : undefined}
      >
        <defs>
          {/* Çatı baz gradyanı (HSL ton üzerinden) */}
          <linearGradient id={roofGradId} x1={gx1} y1={gy1} x2={gx2} y2={gy2} gradientUnits="objectBoundingBox">
            <stop offset="0%"  stopColor={`hsl(${roofHue} 52% ${Math.round(86 - sunIntensity*10)}%)`} />
            <stop offset="60%" stopColor={`hsl(${roofHue} 40% ${Math.round(74 - sunIntensity*8)}%)`} />
            <stop offset="100%" stopColor={`hsl(${roofHue} 35% ${Math.round(66 - sunIntensity*6)}%)`} />
          </linearGradient>

          {/* Kiremit dokusu */}
          <pattern id={roofTilesId} x="0" y="0" width={tileW} height={tileH} patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width={tileW} height={tileH} fill="transparent" />
            {/* üst satır çizgisi */}
            <rect x="0" y="0" width={tileW} height={tileH * 0.66} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
            {/* kemerli çizgi (kiremit formu) */}
            <path d={`M 0 ${Math.round(tileH * 0.66)} Q ${Math.round(tileW/2)} ${tileH + 10} ${tileW} ${Math.round(tileH*0.66)}`} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
          </pattern>

          {/* İç gölge (derinlik) */}
          <filter id={innerShadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dx="-2" dy="-2" />
            <feGaussianBlur stdDeviation="3" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="#334155" floodOpacity="0.22" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>

          {/* Kiremit hafif gölgesi */}
          <filter id={tileShadowId} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.2" floodColor="#0f172a" floodOpacity="0.12" />
          </filter>

          {/* Vignette (kenarlara hafif kararma) */}
          <radialGradient id={vignetteId} cx="50%" cy="50%" r="65%">
            <stop offset="60%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
          </radialGradient>

          {/* Hafif gren (banding'i azaltır) */}
          <filter id={noiseId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" stitchTiles="stitch" seed="7" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0 0.02 0" />
            </feComponentTransfer>
            <feBlend in2="SourceGraphic" mode="multiply" />
          </filter>

          {/* Engeller için gölge ve gradyan */}
          <filter id={obsShadowId} x="-20%" y="-20%" width="160%" height="160%">
            <feDropShadow dx={shadowDx} dy={shadowDy} stdDeviation="2.2" floodColor="#111827" floodOpacity="0.28" />
          </filter>
          <linearGradient id={obsGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id={obsPrevGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Çatı gövde: gradyan + doku + iç gölge + vignette + gren */}
        <g filter={`url(#${noiseId})`}>
          <rect
            x={padding}
            y={padding}
            width={roofWidth * scale}
            height={roofHeight * scale}
            rx={10}
            ry={10}
            fill={`url(#${roofGradId})`}
            filter={`url(#${innerShadowId})`}
          />
          <rect
            x={padding}
            y={padding}
            width={roofWidth * scale}
            height={roofHeight * scale}
            fill={`url(#${roofTilesId})`}
            opacity={0.9}
            filter={`url(#${tileShadowId})`}
          />
          {/* Vignette üst katman */}
          <rect
            x={padding}
            y={padding}
            width={roofWidth * scale}
            height={roofHeight * scale}
            rx={10}
            ry={10}
            fill={`url(#${vignetteId})`}
            pointerEvents="none"
          />
        </g>

        {/* Kaydedilen engeller */}
        {showObstacles &&
          obstacles.map((obs, i) => {
            const gx = padding + obs.x * scale;
            const gy = padding + (roofHeight - obs.y - obs.height) * scale;
            const gw = obs.width * scale;
            const gh = obs.height * scale;
            return (
              <g key={i} filter={`url(#${obsShadowId})`}>
                <rect x={gx} y={gy} width={gw} height={gh} rx={4} ry={4} fill={`url(#${obsGradId})`} opacity={0.96} />
                {showLabels && (
                  <text className="oe-coord-label" x={gx + 8} y={gy + 18}>
                    ({obs.x.toFixed(decimals)}, {obs.y.toFixed(decimals)}) m
                  </text>
                )}
              </g>
            );
          })}

        {/* Önizleme (imleci takip eden engel + rehber çizgiler + etiketi) */}
        {placeByClick && mousePreview && hasPreviewSize && (
          <g>
            <line
              x1={padding + mousePreview.x * scale}
              y1={padding}
              x2={padding + mousePreview.x * scale}
              y2={padding + roofHeight * scale}
              stroke="#64748b"
              strokeDasharray="4 4"
              opacity={0.35}
            />
            <line
              x1={padding}
              y1={padding + (roofHeight - mousePreview.y) * scale}
              x2={padding + roofWidth * scale}
              y2={padding + (roofHeight - mousePreview.y) * scale}
              stroke="#64748b"
              strokeDasharray="4 4"
              opacity={0.35}
            />
            <rect
              x={padding + mousePreview.x * scale}
              y={padding + (roofHeight - mousePreview.y - nH) * scale}
              width={nW * scale}
              height={nH * scale}
              rx={4}
              ry={4}
              fill={`url(#${obsPrevGradId})`}
              opacity={0.6}
              stroke="#eab308"
              strokeWidth={1}
            />
            <text
              className="oe-coord-label"
              x={padding + mousePreview.x * scale + 6}
              y={padding + (roofHeight - mousePreview.y - nH) * scale - 6}
            >
              ({mousePreview.x.toFixed(decimals)}, {mousePreview.y.toFixed(decimals)}) m
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default ObstacleEditor;
