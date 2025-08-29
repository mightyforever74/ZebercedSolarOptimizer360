import { Card, Chip, Tooltip } from "@material-tailwind/react";
import { PanelCountChart } from "./PanelCountChart";
const algorithms = [
  {
    value: "classic",
    label: "Klasik/Grid Yöntemi",
    desc: "Sırayla satır/sütun yerleştirme (en hızlı, en stabil)",
    icon: "/img/classic.png",
  },
  {
    value: "ai_checker",
    label: "AI Checker (Yapay Zeka Denetimli)",
    desc: "Klasik yerleşim + akıllı hata/boşluk kontrolü",
    icon: "/img/ai_checker.png",
  },
  {
    value: "rl",
    label: "AI / Genetik Algoritma / RL",
    desc: "Tam otomatik yapay zeka ile en fazla paneli bul (daha gelişmiş, deneysel)",
    icon: "/img/rl.png",
  },
];

export default function AlgorithmRadioSelector({
  value,
  onChange,
  panelCounts,
}) {
  return (
    <Card className="w-[32rem] p-8 flex flex-col gap-6 bg-transparent shadow-none">
      <div className="tw-grid tw-w-full tw-max-w-xl tw-gap-6">
        Panel Yerleşimi İçin Hangi Algoritmayı Seçmek İstersiniz?
      </div>
      {algorithms.map((algo, idx) => (
        <label
          key={algo.value}
          className={`flex items-center gap-4 p-4 rounded cursor-pointer transition border ${
            value === algo.value
              ? "ring-4 ring-blue-400 border-blue-400"
              : "hover:bg-transparent border-gray-300"
          } bg-transparent${idx < algorithms.length - 1 ? " mb-8" : ""}`}
        >
          <img
            src={algo.icon}
            alt={algo.label}
            className="w-10 h-10 object-contain flex-shrink-0 mr-4"
            style={{ maxWidth: "2.5rem", maxHeight: "2.5rem" }}
          />{" "}
          <div className="flex flex-col flex-1 ml-2">
            <input
              type="radio"
              name="algorithm"
              value={algo.value}
              checked={value === algo.value}
              onChange={() => onChange(algo.value)}
              className="accent-blue-600 w-6 h-6"
            />
            <span className="font-bold text-lg text-green-700">
              <Tooltip content={algo.desc} placement="top">
                <span>{algo.label}</span>
              </Tooltip>
            </span>
          </div>
          <Chip
            value={
              panelCounts[algo.value] !== undefined
                ? `OPTİMUM PANEL SAYISI: ${panelCounts[algo.value]}`
                : "SONUÇ BEKLENİYOR"
            }
            variant="ghost"
            size="lg"
            className="rounded-full text-lg"
          />
        </label>
      ))}
      <PanelCountChart panelCounts={panelCounts} />
    </Card>
  );
}
