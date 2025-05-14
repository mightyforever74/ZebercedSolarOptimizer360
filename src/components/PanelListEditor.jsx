import React from 'react';

export default function PanelListEditor({ panels, onSelect, onRemove }) {
  return (
    <div className="w-full max-w-xs bg-gray-100 p-4 rounded shadow-md overflow-y-auto h-[500px]">
      <h3 className="text-lg font-semibold mb-4">🧩 Panel Listesi</h3>
      <ul className="space-y-2">
        {panels.map(panel => (
          <li key={panel.id} className="p-2 bg-white rounded shadow flex justify-between items-center hover:bg-gray-50">
            <div className="text-sm">
              <strong># {panel.id}</strong><br />
              x: {panel.px.toFixed(1)}m<br />
              y: {panel.py.toFixed(1)}m
            </div>
            <div className="flex flex-col items-end space-y-1">
              <button
                onClick={() => onSelect(panel)}
                className="text-blue-600 hover:underline text-xs"
              >
                İncele
              </button>
              <button
                onClick={() => onRemove(panel.id)}
                className="text-red-600 hover:underline text-xs"
              >
                Kaldır
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
