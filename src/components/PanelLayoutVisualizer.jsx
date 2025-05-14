import React, { useEffect, useMemo, useState } from 'react';
import { calculateOptimalPanelLayout } from '../utils/calculatePanelPlacement';

export default function PanelLayoutVisualizer({ roofWidth, roofHeight, obstacles }) {
  const [panelDrawnCount, setPanelDrawnCount] = useState(0);
  const [layout, setLayout] = useState({ orientation: 'Yatay', count: 0 });
  const [hoveredPanel, setHoveredPanel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const pixelsPerMeter = 80;

  // 🧠 Optimize edilmiş boyut hesaplamaları
  const panelW = useMemo(() => layout.orientation === 'Yatay' ? 1.7 : 1.1, [layout.orientation]);
  const panelH = useMemo(() => layout.orientation === 'Yatay' ? 1.1 : 1.7, [layout.orientation]);

  const svgW = useMemo(() => roofWidth * pixelsPerMeter, [roofWidth]);
  const svgH = useMemo(() => roofHeight * pixelsPerMeter, [roofHeight]);

  const cols = Math.floor(roofWidth / panelW);
  const rows = Math.floor(roofHeight / panelH);

  const panels = [];
  let count = 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = x * panelW;
      const py = y * panelH;

      const blocked = obstacles.some(obs =>
        px < obs.position.x + obs.width &&
        px + panelW > obs.position.x &&
        py < obs.position.y + obs.height &&
        py + panelH > obs.position.y
      );

      if (!blocked) {
        panels.push({
          id: count + 1,
          x: px * pixelsPerMeter,
          y: svgH - (py + panelH) * pixelsPerMeter,
          width: panelW * pixelsPerMeter,
          height: panelH * pixelsPerMeter,
          px,
          py
        });
        count++;
      }
    }
  }

  useEffect(() => {
    const invalidObstacle = obstacles.find(
      obs =>
        obs.position.x + obs.width > roofWidth ||
        obs.position.y + obs.height > roofHeight
    );
    if (invalidObstacle) {
      setModalMessage(`🚫 Engel çatının dışına taşıyor! (${invalidObstacle.type}) konumu: x=${invalidObstacle.position.x}, y=${invalidObstacle.position.y}`);
      setShowModal(true);
      return;
    }

    const result = calculateOptimalPanelLayout(obstacles, roofWidth, roofHeight);
    setLayout(result);
    setPanelDrawnCount(count); // 🎯 Panel sayısını güncelle
  }, [roofWidth, roofHeight, obstacles, count]);

  return (
    <div>
      <h3 className="text-md font-semibold mb-2">Panel Yerleşimi ({layout.orientation})</h3>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md text-center">
            <p className="text-red-600 font-semibold mb-4">{modalMessage}</p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => setShowModal(false)}
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      <svg width={svgW} height={svgH} className="border border-gray-300 bg-white">
        {/* 🔺 Obstacles */}
        {obstacles.map((obs, index) => (
          <rect
            key={`obs-${index}`}
            x={obs.position.x * pixelsPerMeter}
            y={svgH - (obs.position.y + obs.height) * pixelsPerMeter}
            width={obs.width * pixelsPerMeter}
            height={obs.height * pixelsPerMeter}
            fill="rgba(255,0,0,0.6)"
            stroke="red"
          />
        ))}

        {/* 🔲 Panels */}
        {panels.map(panel => (
          <g key={panel.id}
            onMouseEnter={() => setHoveredPanel(panel)}
            onMouseLeave={() => setHoveredPanel(null)}
          >
            <rect
              x={panel.x}
              y={panel.y}
              width={panel.width}
              height={panel.height}
              rx="6" ry="6"
              fill={hoveredPanel?.id === panel.id ? '#4ade80' : '#9ca3af'}
              stroke="#333"
              strokeWidth="0.5"
              style={{ filter: 'drop-shadow(0px 0px 2px rgba(0,0,0,0.5))' }}
            />
            <text
              x={panel.x + panel.width / 2}
              y={panel.y + panel.height / 2}
              fontSize="10"
              fill="#fff"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {panel.id}
            </text>
            {hoveredPanel?.id === panel.id && (
              <text
                x={panel.x + 4}
                y={panel.y - 6}
                fontSize="10"
                fill="black"
              >
                ({panel.px.toFixed(1)}m, {panel.py.toFixed(1)}m)
              </text>
            )}
          </g>
        ))}
      </svg>

      <p className="text-sm text-gray-600 mt-2">
        Toplam yerleştirilen panel: {panelDrawnCount}
      </p>
    </div>
  );
}
