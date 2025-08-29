// src/app/dashboard/analytics/components/TurkeyMapViaWorldAtlas.tsx
"use client";
import "@/styles/jvectormap.css";
import "@/styles/sun-choropleth.css";

import React, { useRef, useEffect, useMemo } from "react";
import { VectorMap } from "@react-jvectormap/core";
import trMill from "@/assets/maps/trMill.json";
import sunshineData from "@/data/mgm_sunshine_81_il.json"; // MGM betiği çıktısı
import { solarCitiesData } from "@/data/solarCitiesData";   // tooltip’teki kWh/m²

export type MapHoverProps = { onHoverCity?: (name: string | null) => void };

// --- Enerji aralığı (kWh/m²) → tooltip için
const ENERGY_MAP = new Map(
  solarCitiesData.map((d) => [
    d.city,
    d["Yıllık Güneş Enerjisi Potansiyeli (kWh/m²)"],
  ])
);

// --- normalize
const norm = (s: string) =>
  String(s ?? "")
    .toLocaleLowerCase("tr")
    .replace(/\s+/g, "")
    .replace(/[’']/g, "");

// --- MGM JSON (81 il) → city -> günlük saat
const DAILY_HOURS_MAP = new Map<string, number>(
  (sunshineData as any[]).map((r) => [norm(r.city), Number(r.daily_avg_hours)])
);

// --- JVectorMap dosyasından güvenilir şehir adı al
function nameFromCode(code: string | number): string {
  const key = String(code);
  const anyMap: any = trMill as any;
  const paths = anyMap?.paths ?? anyMap?.content?.paths;
  const mapName = paths?.[key]?.name;
  return typeof mapName === "string" && mapName.trim() ? mapName.trim() : key;
}

// solarCitiesData içindeki asıl şehir adını bul (tooltip için)
const CITY_INDEX = new Map<string, string>(
  solarCitiesData.map((d: any) => [norm(d.city), d.city])
);

const REGION_STYLE = {
  initial: { fill: "#dee2e7", stroke: "none" },
  hover: {
    fill: "#fcba03",
    stroke: "#000",
    ["stroke-width"]: 2,
    cursor: "pointer",
  },
} as const;

// --- Choropleth: eşik ve renkler (8 sınıf, mavi → kırmızı)
const BINS = [2.8, 5.7, 6.2, 6.5, 6.8, 7.1, 7.3, 7.5, 8.2]; // 8 aralık için 9 işaret
const COLORS = [
  "#2b6cb0",
  "#3399ff",
  "#5cc8ff",
  "#7fe3c1",
  "#fff59d",
  "#ffcc80",
  "#ff8a65",
  "#ef5350",
];

function binIndex(v: number) {
  for (let i = 0; i < BINS.length - 1; i++) {
    if (v < BINS[i + 1]) return i;
  }
  return BINS.length - 2; // son sınıf
}

export default function TurkeyMapViaWorldAtlas({ onHoverCity }: MapHoverProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  // Bölge kodu → renk sınıfı ve gerçek günlük değer
  const { valuesByCode, dailyByCode, missing } = useMemo(() => {
    const anyMap: any = trMill as any;
    const paths = anyMap?.paths ?? anyMap?.content?.paths ?? {};
    const v: Record<string, number> = {};
    const d: Record<string, number> = {};
    const m: string[] = [];

    Object.keys(paths).forEach((code) => {
      const cityName = nameFromCode(code);
      const canonical = CITY_INDEX.get(norm(cityName)) ?? cityName;
      const daily = DAILY_HOURS_MAP.get(norm(canonical));

      if (typeof daily === "number" && !Number.isNaN(daily)) {
        v[code] = binIndex(daily); // sınıf
        d[code] = daily;           // tooltip’te göster
      } else {
        // ÖNEMLİ: veri yoksa HİÇ değer yazma → gri kalsın, 0’a düşmesin
        m.push(`${code} – ${canonical}`);
      }
    });

    return { valuesByCode: v, dailyByCode: d, missing: m };
  }, []);

  // Eksik veri raporu (dev için)
  useEffect(() => {
    if (missing.length) {
      console.warn("Güneşlenme verisi bulunamayan iller:", missing);
    }
  }, [missing]);

  // ---- Debounce / Clear (hover eventlerini sıkıştır)
  const sendTimer = useRef<number | null>(null);
  const clearTimer = useRef<number | null>(null);
  const lastSent = useRef<string | null>(null);

  const queueSend = (name: string) => {
    if (clearTimer.current) {
      window.clearTimeout(clearTimer.current);
      clearTimer.current = null;
    }
    if (sendTimer.current) window.clearTimeout(sendTimer.current);
    sendTimer.current = window.setTimeout(() => {
      if (lastSent.current !== name) {
        onHoverCity?.(name);
        lastSent.current = name;
      }
    }, 600);
  };

  const queueClear = () => {
    if (sendTimer.current) {
      window.clearTimeout(sendTimer.current);
      sendTimer.current = null;
    }
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
    clearTimer.current = window.setTimeout(() => {
      onHoverCity?.(null);
      lastSent.current = null;
    }, 250);
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.addEventListener("mouseleave", queueClear);
    return () => el.removeEventListener("mouseleave", queueClear);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="tw-relative tw-mt-4 lg:-tw-mt-2 tw-h-[420px] tw-min-h-[420px] tw-w-full"
    >
      <VectorMap
        map={trMill as any}
        backgroundColor="transparent"
        zoomOnScroll={false}
        regionStyle={REGION_STYLE as any}
        // --- Renk katmanı
        series={{
          regions: [
            {
              attribute: "fill",
              values: valuesByCode, // { "TR-01": 0..7 } — eksiklerde yok → gri
              scale: COLORS,        // 8 renk
              normalizeFunction: "linear",
            },
          ],
        }}
        // Tooltip
        onRegionTipShow={(e: any, label: any, code: string | number) => {
          const rawCity = nameFromCode(code);
          const city = CITY_INDEX.get(norm(rawCity)) ?? rawCity;

          const daily = dailyByCode[String(code)];
          const dailyTxt =
            typeof daily === "number" && !Number.isNaN(daily)
              ? `${daily.toFixed(2)} s/gün`
              : "veri yok";

          const rangeTxt = ENERGY_MAP.get(city) ?? "-";

          label.html(`
            <div class="jv-tip">
              <div class="jv-city">${city}</div>
              <div class="jv-row">Günlük ortalama: <b class="jv-daily">${dailyTxt}</b></div>
              <div class="jv-row">Yıllık potansiyel: <b class="jv-energy">${rangeTxt}</b></div>
            </div>
          `);
        }}
        // Hover → üst bileşene gönder
        onRegionOver={(e: any, code: string | number) => {
          const rawCity = nameFromCode(code);
          const canonical = CITY_INDEX.get(norm(rawCity)) ?? rawCity;
          queueSend(canonical);
        }}
        onRegionOut={() => queueClear()}
      />

      {/* Legend */}
      <div className="sun-legend">
        <div className="sun-legend__title">
          Ortalama Güneşlenme Süresi (saat/gün)
        </div>
        <div className="sun-legend__bar">
          {COLORS.map((_, i) => (
            <span key={i} className={`sun-legend__swatch c${i}`} />
          ))}
        </div>
        <div className="sun-legend__ticks">
          {BINS.map((b, i) => (
            <span key={i}>{b}</span>
          ))}
        </div>
      </div>

      {/* Bileşene özel stiller + Safari uyumluluğu */}
      <style jsx>{`
        .sun-legend {
          position: absolute;
          left: 12px;
          bottom: 10px;
          background: rgba(255, 255, 255, 0.92); /* fallback */
          -webkit-backdrop-filter: blur(2px);
          backdrop-filter: blur(2px);
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 8px 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          max-width: calc(100% - 24px);
        }
        .sun-legend__title {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          white-space: nowrap;
        }
        .sun-legend__bar {
          display: grid;
          grid-template-columns: repeat(${COLORS.length}, 1fr);
          gap: 2px;
          height: 10px;
          margin-bottom: 4px;
        }
        .sun-legend__swatch {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 2px;
        }
        .sun-legend__ticks {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #6b7280;
          -webkit-user-select: none; /* Safari */
          user-select: none;
        }

        /* Tooltip küçük stili */
        :global(.jvectormap-tip) {
          font-size: 14px;
          padding: 8px 10px;
          border-radius: 8px;
        }
        :global(.jvectormap-tip .jv-city) {
          font-weight: 700;
          color: #111827;
          margin-bottom: 2px;
        }
        :global(.jvectormap-tip .jv-row) {
          line-height: 1.25rem;
        }
        :global(.jvectormap-tip .jv-daily) {
          color: #ea580c;
          font-weight: 700;
        }
        :global(.jvectormap-tip .jv-energy) {
          color: #16a34a;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
