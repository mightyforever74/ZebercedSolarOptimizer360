// src/components/ObstacleManager.jsx

import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';

export default function ObstacleManager({ onCompleteObstacles }) {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [obsWidth, setObsWidth] = useState(1);
  const [obsHeight, setObsHeight] = useState(1);
  const [obstacles, setObstacles] = useState([]);

  // Tüm engelleri sil
  //const clearObstacles = () => {
  //setObstacles([]);
  //};

  // Yeni engel ekle
  const handleAdd = () => {
    const newObs = { x, y, width: obsWidth, height: obsHeight };
    setObstacles((prev) => [...prev, newObs]);
  };

  // Tüm engelleri tamamla ve üst bileşene bildir
  const handleComplete = () => {
    // Eğer hiç engel yoksa da devam etme mantığını değiştirmek istersen burayı güncelle
    onCompleteObstacles(obstacles);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">🚧 Engelleri Yerleştirin</h2>

      <div className="grid grid-cols-4 gap-4">
        <label className="flex flex-col">
          X (m):
          <Input
            type="number"
            value={x || ''}
            onChange={(e) => setX(parseFloat(e.target.value) || 0)}
          />
        </label>
        <label className="flex flex-col">
          Y (m):
          <Input
            type="number"
            value={y || ''}
            onChange={(e) => setY(parseFloat(e.target.value) || 0)}
          />
        </label>
        <label className="flex flex-col">
          Genişlik (m):
          <Input
            type="number"
            value={obsWidth || ''}
            onChange={(e) => setObsWidth(parseFloat(e.target.value) || 0)}
          />
        </label>
        <label className="flex flex-col">
          Yükseklik (m):
          <Input
            type="number"
            value={obsHeight || ''}
            onChange={(e) => setObsHeight(parseFloat(e.target.value) || 0)}
          />
        </label>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handleAdd}
          className="bg-brand-primary text-white hover:bg-brand-accent"
        >
          Ekle
        </Button>
        <Button
          onClick={() => setObstacles([])}
          className="bg-gray-200 text-brand-text hover:bg-gray-300"
        >
          Tümünü Sil
        </Button>
      </div>

      {obstacles.length > 0 && (
        <ul className="mt-4 list-disc list-inside text-sm text-brand-text">
          {obstacles.map((o, i) => (
            <li key={i}>
              Engel {i + 1}: x={o.x}, y={o.y}, w={o.width}, h={o.height}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <Button
          onClick={handleComplete}
          className="bg-brand-primary text-white hover:bg-brand-accent"
        >
          Devam Et
        </Button>
      </div>
    </div>
  );
}
