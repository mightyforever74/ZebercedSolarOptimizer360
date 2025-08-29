// src/app/dashboard/analytics/components/SolarCityList.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Card, Typography } from "@material-tailwind/react";

// ❗ 81 il verisi: { city, monthly_daily_hours[], yearly_total_hours, daily_avg_hours, url }
import sunshineData from "@/data/mgm_sunshine_81_il.json";

const TABLE_HEAD = [
  "Şehir",
  "Yıllık Güneş Enerjisi (kWh/m²)",
  "Güneşlenme Süresi (saat/gün)",
  "Güneşlenme Süresi (saat/yıl)"
];

export type SolarCityRow = {
  city: string;
  "Yıllık Güneş Enerjisi Potansiyeli (kWh/m²)": string;
  "Günlük Ortalama Güneşlenme Süresi (saat/gün)"?: string;
  "Yıllık Ortalama Güneşlenme Süresi (saat/yıl)"?: string;
  
  ghi_min?: number;
  ghi_max?: number;
  ghi_mid?: number;
};

export type SolarCityListProps = {
  data: SolarCityRow[]; // Potansiyel kolonunu sağlayan mevcut tablon
  highlightCity?: string | null;
  onSelect?: (name: string) => void;
};

// Şehir adlarını güvenli eşlemek için normalize
const norm = (s: string) =>
  s.toLocaleLowerCase("tr").replace(/\s+/g, "").replace(/[’']/g, "");

export default function SolarCityList({
  data,
  highlightCity,
  onSelect,
}: SolarCityListProps) {
  const [q, setQ] = useState("");

  // MGM JSON -> Map( normalizedCity -> daily_avg_hours )
  const sunMap = useMemo(
    () =>
      new Map(
        (sunshineData as any[]).map((r) => [
          norm(r.city),
          Number(r.daily_avg_hours),
        ])
      ),
    []
  );

    // MGM JSON -> Map( normalizedCity -> daily_avg_hours )
  const yearMap = useMemo(
    () =>
      new Map(
        (sunshineData as any[]).map((r) => [
          norm(r.city),
          Number(r.yearly_total_hours),
        ])
      ),
    []
  );

  const fmt2 = (n: number) => n.toFixed(1);
  const fmt0 = (n: number) =>
  new Intl.NumberFormat("tr-TR").format(Math.round(n));
  // data + günlük ortalama birleşimi
  const merged = useMemo(
  () =>
    data.map((row) => {
      const d = sunMap.get(norm(row.city));    // number | undefined
      const yearly = yearMap.get(norm(row.city));  // number | undefined
      return {
        ...row,
        "Günlük Ortalama Güneşlenme Süresi (saat/gün)":
          Number.isFinite(d)
          ? (d as number).toFixed(2)              // 6.51 gibi
          : "-",
        "Yıllık Ortalama Güneşlenme Süresi (saat/yıl)":
          yearly != null ? fmt0(yearly) : "-",
      };
    }),
  [data, sunMap, yearMap]
);

  const filtered = useMemo(() => {
    const nq = q.trim().toLocaleLowerCase("tr");
    if (!nq) return merged;
    return merged.filter((row) =>
      row.city.toLocaleLowerCase("tr").includes(nq)
    );
  }, [q, merged]);

  return (
    <section className="tw-w-full tw-bg-white">
      <div className="tw-p-6">
        <Typography variant="lead" color="blue-gray" className="!tw-font-bold">
          Bulunduğunuz şehrin güneş enerjisi potansiyeli
        </Typography>
      </div>

      <Card className="tw-w-full tw-border tw-border-gray-300 tw-shadow-sm tw-px-6">
        <div className="tw-max-h-56 tw-overflow-auto">
          <table className="tw-w-full tw-min-w-max tw-text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="tw-bg-white tw-sticky tw-top-0 tw-z-10 tw-border-b tw-border-gray-300 tw-pb-3 tw-pt-4"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((row, idx) => {
                const isLast = idx === filtered.length - 1;
                const classes = isLast
                  ? "tw-py-3"
                  : "tw-py-3 tw-border-b tw-border-gray-200";

                const highlighted =
                  !!highlightCity &&
                  row.city
                    .toLocaleLowerCase("tr")
                    .includes(highlightCity.toLocaleLowerCase("tr"));

                return (
                  <tr
                    key={`${row.city}-${idx}`}
                    className={`hover:tw-bg-gray-50 ${
                      highlighted ? "tw-bg-amber-50" : ""
                    } ${onSelect ? "tw-cursor-pointer" : ""}`}
                  >
                    <td className={classes}>
                      <span className="tw-font-semibold">{row.city}</span>
                    </td>
                    <td className={classes}>
                      <Typography variant="small" className="tw-text-gray-600">
                        {row["Yıllık Güneş Enerjisi Potansiyeli (kWh/m²)"]}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography variant="small" className="tw-text-gray-600">
                        {row["Günlük Ortalama Güneşlenme Süresi (saat/gün)"] ??
                          "-"}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography variant="small" className="tw-text-black-600">
                        {row["Yıllık Ortalama Güneşlenme Süresi (saat/yıl)"] ??
                          "-"}
                      </Typography>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      
    </section>
  );
}
