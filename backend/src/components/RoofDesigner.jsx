// src/components/RoofDesigner.jsx
import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';


export default function RoofDesigner({ onRoofComplete }) {
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [area, setArea] = useState(0);

  // Kullanıcı “Onayla ve Devam Et”e bastığında çalışır
  const handleComplete = () => {
    const brut = length * width;
    setArea(brut);

    // Üst bileşene çatının ölçüsünü bildir
    onRoofComplete({
      width: length,       // x ekseni
      height: width,       // y ekseni
      points: [],          // Canvas çizimi eklenecekse doldurulur
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Çatının Ölçülerini Girin</h2>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col">
          Uzunluk (m):
          <Input
            type="number"
            value={length || ''}
            onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
            placeholder="Örn. 20"
          />
        </label>

        <label className="flex flex-col">
          Genişlik (m):
          <Input
            type="number"
            value={width || ''}
            onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
            placeholder="Örn. 20"
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <Button
          onClick={handleComplete}
          className="bg-brand-primary text-white hover:bg-brand-accent"
        >
          Onayla ve Devam Et
        </Button>

        <p className="text-sm text-brand-muted">
          Brüt Alan: <strong>{area.toFixed(2)}</strong> m²
        </p>
      </div>
    </div>
  );
}
