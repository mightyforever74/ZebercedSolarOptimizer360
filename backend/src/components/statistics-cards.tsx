// src/components/statistics-cards.tsx
"use client";
import React from "react";
import { Card, CardBody, Typography } from "@/components/MaterialTailwind";

export type StatIcon = React.ElementType;
export type StatFooter = { color?: string; value?: string; label?: string };
export type StatCardItem = {
  color: string;
  icon: StatIcon;
  title: string;
  value: string | number;
  footer?: StatFooter;
};

export type StatisticsCardsProps = {
  cards: StatCardItem[]; // <-- veri dışarıdan geliyor
  overrides?: Record<string, string | number>; // (title -> value)
};

export default function StatisticsCards({ cards, overrides }: StatisticsCardsProps) {
  const data = cards.map((card) => {
    const hasOverride =
      overrides && Object.prototype.hasOwnProperty.call(overrides, card.title);
    const value = hasOverride ? String((overrides as any)[card.title]) : card.value;
    return { ...card, value };    // <-- 🌟 buradaki yazım hatası düzeltildi (".card" değil "...card")
  });
  
  return (
    <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6">
      {data.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="tw-shadow-md tw-rounded-2xl">
            <CardBody>
              <div className="tw-flex tw-items-center tw-gap-3">
                <Icon className="tw-w-8 tw-h-8 tw-text-black-700" />
                <Typography variant="h6" className="!tw-font-semibold">
                  {card.title}
                </Typography>
              </div>

              <Typography variant="h2" className="!tw-font-normal tw-my-2">
                {card.value}
              </Typography>

              {card.footer && (
                <Typography className={card.footer.color ?? "tw-text-gray-500"}>
                  {card.footer.value && <span>{card.footer.value} </span>}
                  {card.footer.label}
                </Typography>
              )}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
