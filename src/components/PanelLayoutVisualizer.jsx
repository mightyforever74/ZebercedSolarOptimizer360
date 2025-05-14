import React from 'react';

export default function PanelLayoutVisualizer({ panelLayout, roofWidth, roofHeight, pixelsPerMeter = 80 }) {
  const svgWidth = roofWidth * pixelsPerMeter;
  const svgHeight = roofHeight * pixelsPerMeter;

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-2">🔍 Panel Yerleşimi Görselleştirme</h3>
      <svg width={svgWidth} height={svgHeight} className="border border-gray-400 bg-white">
        <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="none" stroke="#999" strokeWidth="1" />
        {panelLayout.map((panel, index) => {
          const x = panel.x * pixelsPerMeter;
          const y = svgHeight - (panel.y + panel.height) * pixelsPerMeter;
          const width = panel.width * pixelsPerMeter;
          const height = panel.height * pixelsPerMeter;

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={width}
              height={height}
              fill="#22c55e"
              stroke="#14532d"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    </div>
  );
}
