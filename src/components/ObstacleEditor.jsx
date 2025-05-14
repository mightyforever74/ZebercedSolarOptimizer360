import React, { useRef, useState, useEffect, useCallback } from 'react';
import { calculateOptimalPanelLayout } from '../utils/calculatePanelPlacement';

export default function ObstacleEditor({ roofWidth, roofHeight, onObstaclePlaced, onComplete }) {
  const debugMode = import.meta.env.MODE === 'development';

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [currentObstacle, setCurrentObstacle] = useState({ type: 'chimney', width: '', height: '' });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [obstacles, setObstacles] = useState([]);
  const [hoveredObstacleIndex, setHoveredObstacleIndex] = useState(null);
  const [drawEnabled, setDrawEnabled] = useState(false);
  const [isPlacing, setIsPlacing] = useState(true);
  const [manualX, setManualX] = useState(0);
  const [manualY, setManualY] = useState(0);
  const [panelStats, setPanelStats] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const [panelLayout, setPanelLayout] = useState([]);

  // ilk açılışta engelleri temizle
  useEffect(() => {
    setObstacles([]);
  }, []);

  function resetAfterAdd(newObstacle) {
    const updated = [...obstacles, newObstacle];
    setObstacles(updated);
    onObstaclePlaced(newObstacle);
    setCurrentObstacle({ type: 'chimney', width: '', height: '' });
    setPosition({ x: 0, y: 0 });
    setManualX(0);
    setManualY(0);
    setIsPlacing(true);
  }

  const getPixelsPerMeter = useCallback(() => {
    const maxCanvasWidth = containerRef.current?.offsetWidth || 800;
    const maxPixelsPerMeter = maxCanvasWidth / roofWidth;
    return Math.min(Math.floor(maxPixelsPerMeter), 100);
  }, [roofWidth]);

  const [pixelsPerMeter, setPixelsPerMeter] = useState(80);

  useEffect(() => {
    setPixelsPerMeter(getPixelsPerMeter());
    const handleResize = () => setPixelsPerMeter(getPixelsPerMeter());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getPixelsPerMeter]);

  const canvasWidth = roofWidth * pixelsPerMeter;
  const canvasHeight = roofHeight * pixelsPerMeter;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    obstacles.forEach((obs, index) => {
      const x = obs.position.x * pixelsPerMeter;
      const y = canvasHeight - (obs.position.y + obs.height) * pixelsPerMeter;
      const width = obs.width * pixelsPerMeter;
      const height = obs.height * pixelsPerMeter;

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x, y, width, height);

      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${index + 1}. ${obs.type}`, x + 4, y + 14);

      if (index === hoveredObstacleIndex) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(x + 2, y + 20, 160, 30);
        ctx.fillStyle = '#000';
        ctx.fillText(`${obs.width}m x ${obs.height}m`, x + 6, y + 32);
        ctx.fillText(`(x: ${obs.position.x}m, y: ${obs.position.y}m)`, x + 6, y + 44);
      }
    });

    if ((drawEnabled || isPlacing) && currentObstacle.width && currentObstacle.height) {
      ctx.fillStyle = '#f87171';
      ctx.fillRect(
        position.x * pixelsPerMeter,
        canvasHeight - (position.y + parseFloat(currentObstacle.height)) * pixelsPerMeter,
        parseFloat(currentObstacle.width) * pixelsPerMeter,
        parseFloat(currentObstacle.height) * pixelsPerMeter
      );
    }
  }, [canvasHeight, canvasWidth, currentObstacle, drawEnabled, isPlacing, obstacles, pixelsPerMeter, position, hoveredObstacleIndex]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / pixelsPerMeter;
    const y = (canvasHeight - (e.clientY - rect.top)) / pixelsPerMeter;
    setPosition({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });

    let found = null;
    obstacles.forEach((obs, index) => {
      const ox = obs.position.x;
      const oy = obs.position.y;
      const ow = obs.width;
      const oh = obs.height;
      if (x >= ox && x <= ox + ow && y >= oy && y <= oy + oh) {
        found = index;
      }
    });
    setHoveredObstacleIndex(found);
  };

  const handleMouseDown = () => {
    if ((drawEnabled || isPlacing) && currentObstacle.width && currentObstacle.height) {
      confirmObstacle();
      if (!drawEnabled) {
        setIsPlacing(false);
      } else {
        setDrawEnabled(false);
      }
    }
  };

  const placeWithManualCoordinates = () => {
    if (!currentObstacle.width || !currentObstacle.height) {
      alert("Lütfen önce engelin boyutlarını giriniz.");
      return;
    }

    if ((manualX === 0 && manualY === 0) && !debugMode) {
      alert("Lütfen engelin konumunu belirleyin (0,0 olamaz).");
      return;
    }

    const manualPosition = {
      x: parseFloat(manualX),
      y: parseFloat(manualY)
    };

    const newObstacle = {
      ...currentObstacle,
      position: manualPosition,
      width: parseFloat(currentObstacle.width),
      height: parseFloat(currentObstacle.height)
    };

    resetAfterAdd(newObstacle);
  };

  const confirmObstacle = () => {
    if (!currentObstacle.width || !currentObstacle.height) {
      alert("Lütfen önce engel boyutlarını giriniz.");
      return;
    }

    if ((position.x === 0 && position.y === 0) && !debugMode) {
      alert("Lütfen mouse ile engel yerini seçin (0,0 geçersiz).");
      return;
    }

    const newObstacle = {
      ...currentObstacle,
      position: { ...position },
      width: parseFloat(currentObstacle.width),
      height: parseFloat(currentObstacle.height)
    };

    resetAfterAdd(newObstacle);
  };

  const handleCalculatePanels = () => {
    const result = calculateOptimalPanelLayout(obstacles, roofWidth, roofHeight);
    setPanelStats(result);
    setPanelLayout(result.layout);
    console.log("Yerleşim Panel Koordinatları:", result.layout);
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      <h2 className="text-lg font-semibold">Engel Yerleşim Editörü</h2>

      {/* Engellerin tanımı */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Engel Tipi:</label>
          <select
            className="border p-2 rounded w-full"
            value={currentObstacle.type}
            onChange={(e) => setCurrentObstacle({ ...currentObstacle, type: e.target.value })}
          >
            <option value="chimney">Baca</option>
            <option value="ac_unit">Klima</option>
            <option value="window">Pencere</option>
            <option value="skylight">Çatı Işıklığı</option>
            <option value="other">Diğer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Genişlik (m):</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={currentObstacle.width}
            onChange={(e) => setCurrentObstacle({ ...currentObstacle, width: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Yükseklik (m):</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={currentObstacle.height}
            onChange={(e) => setCurrentObstacle({ ...currentObstacle, height: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">X Konumu (m):</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={manualX}
            onChange={(e) => setManualX(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Y Konumu (m):</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={manualY}
            onChange={(e) => setManualY(e.target.value)}
          />
        </div>
      </div>

      {/* 📍 🖱️ ♻️ butonları yatay şekilde */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button
          onClick={placeWithManualCoordinates}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          📍 Engeli Yerleştir
        </button>

        <div className="flex items-center gap-2">
          <label className="text-sm">🖱️ Mouse ile yerleştirmek istiyorum:</label>
          <input
            type="checkbox"
            checked={drawEnabled}
            onChange={() => {
              setDrawEnabled(!drawEnabled);
              setIsPlacing(true);
            }}
          />
        </div>

        <button
          onClick={() => {
            const confirmed = confirm("Daha önce girdiğiniz tüm engelleri silmek istiyor musunuz?");
            if (confirmed) {
              setObstacles([]);
            }
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          ♻️ Önceki Engelleri Temizle
        </button>
      </div>

      {/* Kanvas çizimi */}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border border-gray-400 max-w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      />

      {/* Panel Yerleşim Hesaplama */}
      <button
        onClick={handleCalculatePanels}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        ⚡ Panel Yerleşimini Hesapla
      </button>

      {panelStats && (
        <div className="bg-indigo-50 text-indigo-800 p-4 rounded mt-2 text-sm">
          Yapay zeka analizi sonucu:
          <br />
          Tercih edilen yön: <strong>{panelStats.orientation}</strong><br />
          Panel sayısı: <strong>{panelStats.count}</strong><br />
          ⚡ Tahmini Güç: <strong>{panelStats.power} kW</strong>
        </div>
      )}

      {panelStats && (
        <button
          onClick={onComplete}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4"
        >
          ✅ Tüm Engeller Yerleştirildi
        </button>
      )}
    </div>
  );
}
