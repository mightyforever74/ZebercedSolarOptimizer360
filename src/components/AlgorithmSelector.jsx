// AlgorithmSelector.jsx
import React from "react";

const algorithmDescriptions = {
  classic: "Klasik/Grid: Hızlı ve basit yerleşim.",
  ai_checker: "AI Checker: Yapay zeka ile doğrulama.",
  rl: "AI / Genetic / RL: Gelişmiş optimizasyon algoritmaları.",
};

export default function AlgorithmSelector({ value, onChange }) {
  return (
    <div>
      <label htmlFor="algorithm-select" className="block font-medium mb-1">
        Algoritma seçimi için hazır mısınız?
      </label>
      <select
        id="algorithm-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-2 py-1"
      >
        <option value="classic">Klasik/Grid</option>
        <option value="ai_checker">AI Checker</option>
        <option value="rl">AI / Genetic / RL</option>
      </select>
      <div className="text-xs text-gray-500 mt-2">
        {algorithmDescriptions[value]}
      </div>
    </div>
  );
}
