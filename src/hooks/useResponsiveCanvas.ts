import { useRef, useState, useEffect, useCallback } from "react";

export function useResponsiveCanvas(
  roofWidth: number,
  roofHeight: number,
  maxPixelsPerMeter: number = 100,
  initialPixelsPerMeter: number = 80
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pixelsPerMeter, setPixelsPerMeter] = useState(initialPixelsPerMeter);

  const canvasWidth = roofWidth * pixelsPerMeter;
  const canvasHeight = roofHeight * pixelsPerMeter;

  const getPixelsPerMeter = useCallback(() => {
    const maxCanvasWidth = containerRef.current?.offsetWidth || 800;
    const maxPxPerMeter = maxCanvasWidth / roofWidth;
    return Math.min(Math.floor(maxPxPerMeter), maxPixelsPerMeter);
  }, [roofWidth, maxPixelsPerMeter]);

  useEffect(() => {
    setPixelsPerMeter(getPixelsPerMeter());
    const handleResize = () => setPixelsPerMeter(getPixelsPerMeter());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getPixelsPerMeter]);

  return {
    containerRef,
    pixelsPerMeter,
    canvasWidth,
    canvasHeight,
  };
}
