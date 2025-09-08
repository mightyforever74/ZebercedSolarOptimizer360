// src/components/CardWithList.jsx
import React from "react";
import { Card, CardBody, Typography, Avatar } from "@material-tailwind/react";

export default function CardWithList({ panelCounts, setViewMode }) {
  const algoritims = [
    {
      algoritm_name: "Klasik Grid",
      algoritm_details: "Geometrik Hesaplama Yöntemi",
      algoritm_panel_result: panelCounts.classic ?? 0,
      image: "/img/classic.png",
    },
    {
      algoritm_name: "AI Checker",
      algoritm_details: "AI Kontrollü Hesaplama Yöntemi",
      algoritm_panel_result: panelCounts.ai_checker ?? 0,
      image: "/img/ai_checker.png",
    },
    {
      algoritm_name: "AI RL / Genetik",
      algoritm_details: "RL AI Kontrollü Hesaplama Yöntemi",
      algoritm_panel_result: panelCounts.rl ?? 0,
      image: "/img/rl.png",
    },
  ];

  return (
    <Card className="w-full max-w-xl mx-auto my-6">
      <CardBody>
        <div className="mb-4 flex items-center justify-between">
          <Typography variant="h5" color="blue-gray">
            Algoritmaların Panel Sonuçları
          </Typography>
        </div>
        <div className="divide-y divide-gray-200">
          {algoritims.map(
            (
              { algoritm_name, algoritm_details, algoritm_panel_result, image },
              index
            ) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 last:pb-0"
              >
                <div className="flex items-center gap-x-3">
                  <Avatar size="sm" src={image} alt={algoritm_name} />
                  <div>
                    <Typography color="blue-gray" variant="h6">
                      {algoritm_name}
                    </Typography>
                    <Typography variant="small" color="gray">
                      {algoritm_details}
                    </Typography>
                  </div>
                </div>
                <Typography color="blue-gray" variant="h6">
                  {algoritm_panel_result} panel
                </Typography>
              </div>
            )
          )}
        </div>
        {/* Görünüm modunu değiştiren butonlar */}
        <div className="tw-mt-3 tw-flex tw-gap-2">
          <button
            className="tw-btn tw-btn-sm"
            onClick={() => setViewMode("aligned")}
          >
            Panelleri tekrar hizala
          </button>
          <button
            className="tw-btn tw-btn-sm"
            onClick={() => setViewMode("extra")}
          >
            Ters yönde boşlukları doldur
          </button>
          <button
            className="tw-btn tw-btn-sm"
            onClick={() => setViewMode("best")}
          >
            Orijinal yerleşim
          </button>
        </div>
      </CardBody>
    </Card>
  );
}
