"use client";
import React, { useEffect, useMemo, useState } from "react";
import ClientTurkeyMap from "./components/ClientTurkeyMap";
import SolarCityList from "./components/SolarCityList";
import StatisticChart from "./components/statistics-chart";
import { solarCitiesData } from "@/data/solarCitiesData";
import type { SolarCityRow } from "./components/SolarCityList";
import StatisticsCards from "@/components/statistics-cards";
import statisticsCardsData from "@/data/statistics-cards-data"; // <-- EKLENDİ

type Mode = "independent" | "integrated";

const formatNumber = (n: number | null) =>
  n == null ? "..." : new Intl.NumberFormat("tr-TR").format(n);

export default function AnalyticsPage() {
  const [mode, setMode] = useState<Mode>("independent");
  const [highlightedCity, setHighlightedCity] = useState<string | null>(null);
  const [cityQuery, setCityQuery] = useState("");
  const [todayUsers, setTodayUsers] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  const handleCitySelectFromList = (cityName: string) => {
    setHighlightedCity(cityName);
    if (mode === "integrated") setCityQuery(cityName);
  };

  const handleCitySelectFromMap = (cityName: string | null) => {
    setHighlightedCity(cityName);
    if (mode === "integrated") setCityQuery(cityName ?? "");
  };

  const filteredCities = useMemo<SolarCityRow[]>(() => {
    const q = cityQuery.trim().toLocaleLowerCase("tr");
    if (!q) return solarCitiesData as SolarCityRow[];
    return (solarCitiesData as any).filter((it: any) =>
      Object.values(it).some((v) =>
        String(v ?? "")
          .toLocaleLowerCase("tr")
          .includes(q)
      )
    ) as SolarCityRow[];
  }, [cityQuery]);

  useEffect(() => {
    (async () => {
      try {
        const a = await fetch("/api/metrics/today-users");
        const b = await fetch("/api/metrics/total-users");
        const aj = await a.json();
        const bj = await b.json();
        setTodayUsers(aj.count ?? 0);
        setTotalUsers(bj.count ?? 0);
      } catch {
        setTodayUsers(0);
        setTotalUsers(0);
      }
    })();
  }, []);

  return (
    <div className="w-full min-h-screen p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Türkiye Güneş Haritası</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 tw-min-h-[440px]">
          <div className="tw-overflow-auto sm:tw-h-[45vh] lg:tw-h-[60vh]">
            <div className="tw-min-w-[720px] tw-min-h-[360px] tw-relative">
              <ClientTurkeyMap
                className="tw-absolute tw-inset-0"
                mode={mode}
                highlightedCityName={highlightedCity}
                onCitySelect={handleCitySelectFromMap}
              />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="tw-relative md:tw-w-80 tw-mb-3"
          >
            <input
              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded"
              placeholder="Şehirlerde ara"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
            />
            {cityQuery && (
              <button
                type="button"
                className="tw-absolute tw-right-10 tw-top-1/2 -tw-translate-y-1/2"
                onClick={() => setCityQuery("")}
                aria-label="Temizle"
              >
                ×
              </button>
            )}
            <button
              type="submit"
              className="tw-absolute tw-right-1 tw-top-1/2 -tw-translate-y-1/2"
              aria-label="Ara"
            >
              🔍
            </button>
          </form>
          <SolarCityList
            highlightCity={highlightedCity}
            onSelect={handleCitySelectFromList}
            data={filteredCities}
          />
        </div>
      </div>

      {/* Grafikler */}
      <StatisticChart />

      {/* Üst kartları dinamik besle */}
      <StatisticsCards
        cards={statisticsCardsData} // <-- EKLENDİ
        overrides={{
          "Günlük Kullanıcı Sayısı": formatNumber(todayUsers),
          Takipçilerimiz: formatNumber(totalUsers),
        }}
      />
    </div>
  );
}
