// src/app/dashboard/analytics/components/ClientTurkeyMap.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";

// SSR'de çalışmasın → "self is not defined" çözülür
const TurkeyMapNoSSR = dynamic(() => import("./TurkeyMapViaWorldAtlas"), {
  ssr: false,
});

type Mode = "independent" | "integrated";

export default function ClientTurkeyMap({
  mode = "independent",
  highlightedCityName,
  onCitySelect,
}: {
  mode?: Mode;
  highlightedCityName?: string | null;
  onCitySelect?: (name: string | null) => void;
}) {
  const handleHoverFromMap = (city: string | null) => {
    if (mode === "integrated") onCitySelect?.(city);
  };

  return (
    <div className="tw-w-full tw-h-full">
      <TurkeyMapNoSSR onHoverCity={handleHoverFromMap} />
    </div>
  );
}
