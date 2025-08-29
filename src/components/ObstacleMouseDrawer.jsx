// src/components/ObstacleMouseDrawer.jsx
import React, { useState } from "react";


export default function ObstacleMouseDrawer({
  roofWidth,
  roofHeight,
  width,
  height,
  engeller,
  setEngeller,
}) {
  const [currentXY, setCurrentXY] = useState({ x: 0, y: 0 });
  const scale = 600 / roofWidth;

  const canDraw =
    width > 0 && height > 0 && roofWidth > 0 && roofHeight > 0;

  return (
    <>
      {/* SVG ÇATI ÇİZİMİ */}
      {canDraw && (
        <svg
          width={roofWidth * scale}
          height={roofHeight * scale}
          style={{ border: "1px solid #ccc", margin: "24px auto", display: "block" }}
          onMouseMove={e => {
            const rect = e.target.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const xMeter = (mouseX / scale).toFixed(2);
            const yMeter = (roofHeight - mouseY / scale).toFixed(2);
            setCurrentXY({ x: Number(xMeter), y: Number(yMeter) });
          }}
         onClick={() => {
            if (!canDraw) return;
            setEngeller(engeller => [
              ...engeller,
              {
                x: currentXY.x,
                y: currentXY.y,
                width: Number(width),
                height: Number(height)
              }
            ]);
          }}
        >
          {/* Çatı */}
          <rect x={0} y={0} width={roofWidth * scale} height={roofHeight * scale} fill="#f9fafb" stroke="#333" />
          {/* Sabitlenen Engeller */}
          {engeller.map((obs, i) => (
            <rect
              key={i}
              x={obs.x * scale}
              y={(roofHeight - obs.y) * scale - obs.height * scale}
              width={obs.width * scale}
              height={obs.height * scale}
              fill="#d97706"
              opacity={0.8}
            />
          ))}
          {/* Mouse ile canlı engel (yarı saydam) */}
          {canDraw && (
            <rect
              x={currentXY.x * scale}
              y={(roofHeight - currentXY.y) * scale - height * scale}
              width={width * scale}
              height={height * scale}
              fill="#6ee7b7"
              opacity={0.6}
            />
          )}
        </svg>
      )}

      {/* Canlı XY göster */}
      {canDraw && (
        <div className="text-sm mt-2">
          X: <b>{currentXY.x}</b> m,&nbsp;
          Y: <b>{currentXY.y}</b> m
        </div>
      )}
    </>
  );
}
