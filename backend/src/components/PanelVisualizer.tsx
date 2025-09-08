// src/app/.../PanelVisualizer.tsx
// src/components/PanelVisualizer.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/components/PanelVisualizer.module.css";
import PanelZoomShell from "@/components/PanelZoomShell";

type Rect = { x: number; y: number; width: number; height: number };

type Props = {
  panels: Rect[];
  obstacles?: Rect[];
  /** px/metre */
  scale?: number;
  /** metre cinsinden (opsiyonel) */
  roofWidth?: number;
  roofHeight?: number;
  showLabels?: boolean;

  /** animasyon opsiyonları */
  animate?: boolean;
  intervalMs?: number;
  startDelayMs?: number;
  onComplete?: () => void;
};

export default function PanelVisualizer({
  panels,
  obstacles = [],
  scale = 40,
  roofWidth,
  roofHeight,
  showLabels = true,
  animate = false,
  intervalMs = 60,
  startDelayMs = 0,
  onComplete,
}: Props) {
  const [shownCount, setShownCount] = useState(animate ? 0 : panels.length);
  const timerRef = useRef<number | null>(null);

  // Paneller değiştiğinde animasyonu resetle
  useEffect(() => {
    if (!animate) {
      setShownCount(panels.length);
      return;
    }
    setShownCount(0);

    const startId = window.setTimeout(step, startDelayMs);

    function step() {
      setShownCount((n) => {
        const next = Math.min(n + 1, panels.length);
        if (next < panels.length) {
          timerRef.current = window.setTimeout(step, intervalMs);
        } else {
          timerRef.current = null;
          onComplete?.();
        }
        return next;
      });
    }

    return () => {
      window.clearTimeout(startId);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, panels, intervalMs, startDelayMs]);

  const visiblePanels = useMemo(
    () => panels.slice(0, shownCount),
    [panels, shownCount]
  );

  // Doğal (ölçekli) tuval boyutu — PanelZoomShell bu tuvali ölçekler ve kaydırır
  const canvasWidth =
    Math.ceil(
      (roofWidth ?? Math.max(0, ...panels.map((p) => p.x + p.width))) * scale
    ) + 20; // 10px iç boşluk solda/sağda
  const canvasHeight =
    Math.ceil(
      (roofHeight ?? Math.max(0, ...panels.map((p) => p.y + p.height))) * scale
    ) + 20; // 10px iç boşluk üst/alt

  return (
    <div className={styles.canvasWrap}>
      {/* 🔍 Zoom + pan + fit kabuğu */}
      <PanelZoomShell width={canvasWidth} height={canvasHeight}>
        <svg
          className={styles.canvasSvg}
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        >
          {/* Çatı arka planı */}
          <defs>
            <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e6eef7" />
              <stop offset="100%" stopColor="#cdd9e6" />
            </linearGradient>
            <pattern
              id="roofPattern"
              width="40"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <rect width="40" height="20" fill="url(#roofGrad)" />
              <path d="M0 20 H40" stroke="#aab8cc" strokeWidth="0.6" />
              <path d="M0 10 H40" stroke="#b7c4d6" strokeWidth="0.5" />
            </pattern>
          </defs>

          <rect
            x={10}
            y={10}
            width={canvasWidth - 20}
            height={canvasHeight - 20}
            fill="url(#roofPattern)"
            rx={16}
          />

          {/* Engeller */}
          {obstacles.map((o, i) => (
            <rect
              key={`ob-${i}`}
              x={10 + o.x * scale}
              y={10 + (canvasHeight - 20 - (o.y + o.height) * scale)}
              width={o.width * scale}
              height={o.height * scale}
              className={styles.obstacle}
            />
          ))}

          {/* Paneller */}
          {visiblePanels.map((p, i) => {
            const x = 10 + p.x * scale;
            const y = 10 + (canvasHeight - 20 - (p.y + p.height) * scale);
            const ww = p.width * scale;
            const hh = p.height * scale;

            return (
              <g
                key={`p-${i}`}
                className={`${styles.panel} ${animate ? styles.enter : ""}`}
              >
                <rect
                  x={x}
                  y={y}
                  width={ww}
                  height={hh}
                  rx={6}
                  className={styles.panelBody}
                />
                {/* panel iç çizgileri */}
                <g className={styles.panelGrid}>
                  <path d={`M ${x} ${y + hh / 2} H ${x + ww}`} />
                  <path d={`M ${x + ww / 2} ${y} V ${y + hh}`} />
                </g>
                {showLabels && (
                  <text x={x + 8} y={y + 18} className={styles.panelLabel}>
                    {`Panel ${i + 1}`}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </PanelZoomShell>

      {/* Animasyon sayacı / atla */}
      {animate && shownCount < panels.length && (
        <div className={styles.animInfo}>
          {shownCount} / {panels.length}
          <button
            className={styles.skipBtn}
            onClick={() => setShownCount(panels.length)}
            title="Animasyonu atla"
          >
            Atla
          </button>
        </div>
      )}
    </div>
  );
}

