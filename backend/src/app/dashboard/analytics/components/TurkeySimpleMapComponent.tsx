// src/app/dashboard/analytics/components/TurkeySimpleMapComponent.tsx
"use client";

import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import provinces from "@/assets/maps/trMill.json"; // your existing GeoJSON/TopoJSON (provinces)

type Props = {
  onProvinceEnter?: (i: { id: string; name: string }) => void;
  onProvinceLeave?: () => void;
  onMarkerEnter?: (name: string) => void;
  onMarkerLeave?: () => void;
  markers?: { id: string; name: string; coordinates: [number, number] }[];
};

export default function TurkeySimpleMapComponent({ 
  onMarkerEnter,
  onMarkerLeave,
  markers = [],
}: Props) {
  return (
    <div className="tw-mt-12 tw-h-full tw-min-h-max lg:-tw-mt-24">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [35.2, 39.0], scale: 2600 }}
        width={900}
        height={700}
        style={{ width: "100%", height: "90vh" }} // ekranın %95 yüksekliğini kaplasın
      >
        <Geographies geography={provinces as any}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                className="tw-fill-[#dee2e7] tw-stroke-none"
              />
            ))
          }
        </Geographies>

        {markers.map((m) => (
          <Marker key={`${m.name}-${m.coordinates.join(",")}`} coordinates={m.coordinates}>
            <circle
              r={4}
              className="tw-fill-black tw-stroke-white tw-stroke-2 tw-cursor-pointer"
              onMouseEnter={() => onMarkerEnter?.(m.name)}
              onMouseLeave={() => onMarkerLeave?.()}
            />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
