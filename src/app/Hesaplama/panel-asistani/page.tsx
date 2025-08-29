// C:\Projects\solar-optimizer360\src\app\Hesaplama\panel-asistani\page.tsx
"use client";

import React, { useState } from "react";
import  {Typography}  from "@/components/MaterialTailwind";
import Steppers from "./components/stepper";

export default function WizardPage() {
  const [payload, setPayload] = useState<any>(null);
  const [results, setResults] = useState<any>(null);

  // Sadece hesaplama yapar
  const handlePanelCalculation = async (formData: any) => {
    try {
      const newPayload = {
        roof_width: Number(formData.roofWidth),
        roof_height: Number(formData.roofHeight),
        panel_width: Number(formData.panelWidth),
        panel_height: Number(formData.panelHeight),
        edge_margin: Number(formData.edgeMargin),
        panel_gap: Number(formData.panelGap),
        row_maintenance_gap: Number(formData.rowMaintenanceGap),
        rows_before_gap: Number(formData.rowsBeforeGap),
        obstacles: formData.obstacles || [],
        panel_power_watt: Number(formData.panelPowerWatt),
      };

      setPayload(newPayload);

      const res = await fetch("http://localhost:5005/api/panel/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hesaplama hatası");

      setResults(data);
      console.log("Hesaplama başarılı:", data);
    } catch (err) {
      console.error("Hesaplama sırasında hata:", err);
    }
  };

  return (
    <div className="tw-mb-4 tw-grid tw-h-[calc(100vh-144px)] tw-grid-cols-1 tw-place-items-center">
      <div className="tw-w-full tw-max-w-4xl">
        <div className="tw-text-center">
          <Typography variant="h4" className="tw-text-blue-gray-800">
            Güneş Panelinizi Yapay Zeka Yardımıyla Oluşturun!
          </Typography>
        </div>

        {/* ✅ Stepper’a props geçiyoruz */}
        <Steppers
          payload={payload}
          results={results}
          onCalculate={handlePanelCalculation}
        />
      </div>
    </div>
  );
}
