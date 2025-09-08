"use client";
import React, { useEffect, useRef, useState } from "react";
import css from "@/components/PanelVisualizer.module.css";

type ZoomShellProps = {
  width: number;
  height: number;
  children: React.ReactNode;
  initialScale?: number;
  maxScale?: number;
  minScale?: number;
};

export default function PanelZoomShell({
  width,
  height,
  children,
  initialScale = 1,
  maxScale = 3,
  minScale = 0.2,
}: ZoomShellProps) {
  const vpRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initialScale);

  const fit = () => {
    const vp = vpRef.current;
    if (!vp) return;
    const sx = (vp.clientWidth - 24) / width;
    const sy = (vp.clientHeight - 24) / height;
    const s = Math.max(minScale, Math.min(maxScale, Math.min(sx, sy)));
    setScale(Number(s.toFixed(2)));
    vp.scrollTo({ left: 0, top: 0 });
  };

  useEffect(() => {
    fit();
    const onResize = () => fit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [width, height]);

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();

    const vp = vpRef.current;
    if (!vp) return;

    const rect = vp.getBoundingClientRect();
    const mouseX = e.clientX - rect.left + vp.scrollLeft;
    const mouseY = e.clientY - rect.top + vp.scrollTop;

    const dir = e.deltaY > 0 ? -1 : 1;
    const next = Number(
      Math.min(maxScale, Math.max(minScale, scale + dir * 0.1)).toFixed(2)
    );

    const k = next / scale;
    const targetLeft = mouseX * k - (e.clientX - rect.left);
    const targetTop = mouseY * k - (e.clientY - rect.top);

    setScale(next);
    requestAnimationFrame(() => {
      vp.scrollLeft = targetLeft;
      vp.scrollTop = targetTop;
    });
  };

  // CSS değişkenlerini doğrudan DOM’a yazıyoruz
  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    vp.style.setProperty("--cw", `${width}px`);
    vp.style.setProperty("--ch", `${height}px`);
    vp.style.setProperty("--scale", String(scale));
  }, [width, height, scale]);

  return (
    <div ref={vpRef} className={css.pvViewport} onWheel={onWheel}>
      <div className={css.pvSizer} />
      <div className={css.pvStage}>{children}</div>

      {/* Zoom butonları: üstte ve ortalı */}
      <div className={css.pvZoom}>
        <button
          type="button"
          title="Yakınlaştır"
          onClick={() =>
            setScale((s) => Number(Math.min(maxScale, s + 0.1).toFixed(2)))
          }
        >
          +
        </button>
        <button
          type="button"
          title="Uzaklaştır"
          onClick={() =>
            setScale((s) => Number(Math.max(minScale, s - 0.1).toFixed(2)))
          }
        >
          −
        </button>
        <button type="button" title="Ekrana Sığdır" onClick={fit}>
          ↺
        </button>
      </div>
    </div>
  );
}
