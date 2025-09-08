import React, { useState } from "react";
// Engel giriş alanları, “kaydet”, “engel sayacı”, “engelleri sil”
//  Props ile obstacles, setObstacles, triggerToast alır.
type Obstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  position: { x: number; y: number };
};

interface ObstacleInputsProps {
  obstacles: Obstacle[];
  setObstacles: React.Dispatch<React.SetStateAction<Obstacle[]>>;
  triggerToast: (msg: string, type?: string) => void;
}

export default function ObstacleInputs({
  obstacles,
  setObstacles,
  triggerToast,
}: ObstacleInputsProps) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [obsWidth, setObsWidth] = useState("");
  const [obsHeight, setObsHeight] = useState("");

  // Engel ekle
  const handleKaydet = () => {
    const _x = parseFloat(x);
    const _y = parseFloat(y);
    const _w = parseFloat(obsWidth);
    const _h = parseFloat(obsHeight);

    if (isNaN(_x) || isNaN(_y) || isNaN(_w) || isNaN(_h)) {
      triggerToast("Lütfen tüm alanları doldurun!", "error");
      return;
    }

    if (_x >= _w) {
      triggerToast("Yatay uzaklık engel genişliğinden küçük olmalı!", "error");
      return;
    }
    if (_y >= _h) {
      triggerToast("Dikey uzaklık engel uzunluğundan küçük olmalı!", "error");
      return;
    }

    const newObstacle: Obstacle = {
      x: _x,
      y: _y,
      width: _w,
      height: _h,
      type: "chimney", // İstersen burada type input ekleyebilirsin
      position: { x: _x, y: _y },
    };

    setObstacles([...obstacles, newObstacle]);
    triggerToast("Engel eklendi!", "success");

    setX("");
    setY("");
    setObsWidth("");
    setObsHeight("");
  };

  // Engelleri sil
  const handleEngelleriSil = () => {
    setObstacles([]);
    triggerToast("Tüm engeller silindi!", "info");
  };

  return (
    <div className="tw-flex tw-flex-col tw-gap-4">
      <div className="tw-flex tw-gap-4">
        <input
          type="number"
          value={x}
          onChange={(e) => setX(e.target.value)}
          placeholder="Yatay uzaklık x.x (m)"
          className="tw-w-full tw-border tw-p-2 tw-rounded"
        />
        <input
          type="number"
          value={y}
          onChange={(e) => setY(e.target.value)}
          placeholder="Dikey uzaklık x.x (m)"
          className="tw-w-full tw-border tw-p-2 tw-rounded"
        />
      </div>
      <div className="tw-flex tw-gap-4">
        <input
          type="number"
          value={obsWidth}
          onChange={(e) => setObsWidth(e.target.value)}
          placeholder="Engelin genişliği x.x (m)"
          className="tw-w-full tw-border tw-p-2 tw-rounded"
        />
        <input
          type="number"
          value={obsHeight}
          onChange={(e) => setObsHeight(e.target.value)}
          placeholder="Engelin uzunluğu x.x (m)"
          className="tw-w-full tw-border tw-p-2 tw-rounded"
        />
      </div>
      <div className="tw-flex tw-gap-4">
        <button
          className="tw-bg-blue-500 tw-text-white tw-px-4 tw-py-2 tw-rounded"
          onClick={handleKaydet}
        >
          Kaydet
        </button>
        <button
          className="tw-bg-red-500 tw-text-white tw-px-4 tw-py-2 tw-rounded"
          onClick={handleEngelleriSil}
        >
          Engelleri Sil
        </button>
      </div>
      <div>
        <span>Engel sayısı: <strong>{obstacles.length}</strong></span>
      </div>
    </div>
  );
}
