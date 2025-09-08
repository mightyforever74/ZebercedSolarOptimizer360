import React, { useState, useEffect } from "react";
import calculateOptimalPanelLayout from "../utils/calculatePanelPlacement";
import fallbackLayout from "../utils/fallbackLayout";

export default function PanelLayoutVisualizer({
  obstacles = [],
  roofWidth,
  roofHeight,
  scale = 40,
}) {
  const [layout, setLayout] = useState([]);

  // 1️⃣ Fetch ML‐driven layout (with reward) or fallback
  useEffect(() => {
    async function loadLayout() {
      try {
        const result = await calculateOptimalPanelLayout(
          obstacles,
          roofWidth,
          roofHeight
        );
        setLayout(result.layout || []);
      } catch (err) {
        console.error("ML failed, using fallback:", err);
        const panelSpec = { width: roofWidth / 10, height: roofHeight / 10 };
        const fallback = fallbackLayout(
          obstacles,
          roofWidth,
          roofHeight,
          panelSpec
        );
        setLayout(fallback);
      }
    }
    loadLayout();
  }, [obstacles, roofWidth, roofHeight]);

  // DEBUG: log incoming count
  useEffect(() => {
    console.log("[Visualizer] received layout.length =", layout.length);
  }, [layout]);

  // Early exit
  if (!Array.isArray(layout) || layout.length === 0) return null;
  // Compute bounds so nothing gets clipped
  const maxX =
    Math.max(...layout.map((p) => Number(p.x) + Number(p.width))) * scale;
  const maxY =
    Math.max(...layout.map((p) => Number(p.y) + Number(p.height))) * scale;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${maxX} ${maxY}`}
      onLoad={() => {
        const drawn =
          document.querySelectorAll("svg > rect").length - obstacles.length;
        console.log(
          "[Visualizer] drew panel rects =",
          drawn,
          "(should = layout.length)"
        );
      }}
    >
      {/* Draw obstacles */}
      {obstacles.map((obs, idx) => {
        const ox = Number(obs.x ?? obs.position?.x ?? 0) * scale;
        const oy = Number(obs.y ?? obs.position?.y ?? 0) * scale;
        const ow = Number(obs.width ?? 1) * scale;
        const oh = Number(obs.height ?? 1) * scale;
        return (
          <rect
            key={`obs-${idx}`}
            x={ox}
            y={oy}
            width={ow}
            height={oh}
            fill="gray"
            stroke="black"
          />
        );
      })}

      {/* Draw panels */}
      {layout.map((panel, i) => {
        const x = Number(panel.x || 0) * scale;
        const y = Number(panel.y || 0) * scale;
        const w = Number(panel.width || 1) * scale;
        const h = Number(panel.height || 1) * scale;
        return (
          <rect
            key={`panel-${i}`}
            x={x}
            y={y}
            width={w}
            height={h}
            fill="green"
            stroke="white"
          />
        );
      })}
    </svg>
  );
}
