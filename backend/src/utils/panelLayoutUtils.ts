// src/utils/panelLayoutUtils.ts

// ObstacleEditor is the source code!
/**
import { predictRLPanelLayout } from "../utils/predictRLPanelLayout";
import { calculateOptimalPanelLayout } from "../utils/calculatePanelPlacement";
import { convertPanelsToGrid } from "../utils/convertPanelsToGrid";



 * Engelleri normalize eder (pozisyon varsa korur, yoksa x/y'den kurar)
 * UI kodları (button/input/state) bu dosyada yoktur. Sadece işlevsellik içerir.
 * Engellerin tipi Obstacle obje şemasına tam uyumludur.
 * RL ve klasik modda aynı fonksiyon kullanılabilir.
 * Tüm hatalar try/catch ile kolayca yönetilebilir.
 */
// <-- Bu satır dosyayı ESM olarak işaretler

export type Point = { x: number; y: number };

export type Obstacle = {
  type?: string;
  width: number | string;
  height: number | string;
  position?: Point;
  x?: number;
  y?: number;
  orientation?: "portrait" | "landscape" | string;
};

export type InputData = {
  roof_width: number;
  roof_height: number;
  panel_width: number;
  panel_height: number;
  edge_margin: number;
  panel_gap: number;
  row_maintenance_gap: number;
  rows_before_gap: number;
  obstacles: Obstacle[];
  panel_power_watt: number;
};

export type PanelPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
  orientation?: "portrait" | "landscape" | string;
  id?: number;
};

export type CalcResponse = {
  panel_positions: PanelPosition[];
  total_panels: number;
  total_energy_kw: number;
  classic?: { total_panels: number; panel_positions: PanelPosition[] };
  ai_checker?: { total_panels: number; panel_positions: PanelPosition[] };
  rl?: { total_panels: number; panel_positions: PanelPosition[] };
  postprocess?: unknown;
};

export type ModeKey = "classic" | "ai_checker" | "rl";
export type Counts = Record<ModeKey, number>;

export type PostLayouts = {
  aligned?: any;
  extra_fill?: any;
  // backend ileride yeni anahtarlar eklerse sorun çıkmasın diye:
  [key: string]: any;
};

export function normalizeObstacles(obstacles: Obstacle[]): Obstacle[] {
  return (obstacles ?? []).map((obs) => {
    if (
      obs?.position &&
      typeof obs.position.x === "number" &&
      typeof obs.position.y === "number"
    ) {
      return obs;
    }
    return {
      ...obs,
      position: {
        x: typeof obs?.x === "number" ? obs.x : 0,
        y: typeof obs?.y === "number" ? obs.y : 0,
      },
    };
  });
}

export async function fetchPanelCalculationFromAPI(
  inputData: InputData,
  setData?: (positions: PanelPosition[]) => void,
  setSummary?: (s: { total_panels: number; total_energy_kw: number }) => void
): Promise<void> {
  const payload: InputData = {
    ...inputData,
    obstacles: normalizeObstacles(inputData.obstacles || []),
  };

  try {
    const res = await fetch("/api/panel/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await res.json()) as CalcResponse;

    setData?.(result.panel_positions ?? []);
    setSummary?.({
      total_panels: result.total_panels ?? 0,
      total_energy_kw: result.total_energy_kw ?? 0,
    });
  } catch (error) {
    console.error("Panel yerleşim API hatası:", error);
    setData?.([]);
    setSummary?.({ total_panels: 0, total_energy_kw: 0 });
  }
}

export const handleCalculatePanels = async (
  inputData: {
    roofWidth: number;
    roofHeight: number;
    panelWidth: number;
    panelHeight: number;
    edgeMargin: number;
    panelGap: number;
    rowMaintenanceGap: number;
    rowsBeforeGap: number;
    obstacles: Obstacle[];
    panelPowerWatt: number;
  },
  setData?: (positions: PanelPosition[]) => void,
  setSummary?: (s: { total_panels: number; total_energy_kw: number }) => void
): Promise<void> => {
  const payload: InputData = {
    roof_width: Number(inputData.roofWidth),
    roof_height: Number(inputData.roofHeight),
    panel_width: Number(inputData.panelWidth),
    panel_height: Number(inputData.panelHeight),
    edge_margin: Number(inputData.edgeMargin),
    panel_gap: Number(inputData.panelGap),
    row_maintenance_gap: Number(inputData.rowMaintenanceGap),
    rows_before_gap: Number(inputData.rowsBeforeGap),
    obstacles: normalizeObstacles(inputData.obstacles || []),
    panel_power_watt: Number(inputData.panelPowerWatt),
  };

  try {
    const res = await fetch("/api/panel/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await res.json()) as CalcResponse;

    const formatted: PanelPosition[] = (result.panel_positions ?? []).map(
      (panel, index) => ({
        ...panel,
        x: Number(panel.x),
        y: Number(panel.y),
        width: Number(panel.width),
        height: Number(panel.height),
        id: index,
      })
    );

    setData?.(formatted);
    setSummary?.({
      total_panels: result.total_panels ?? 0,
      total_energy_kw: result.total_energy_kw ?? 0,
    });
  } catch (error) {
    console.error("Yerleşim hatası:", error);
  }
};

export async function fetchBestAlgorithmLayout(payload: InputData): Promise<{
  bestKey: ModeKey;
  bestLayout: PanelPosition[];
  bestCount: number;
  counts: Counts;
  all: CalcResponse;
  post: PostLayouts; // <- tip artık PostLayouts
}> {
  const res = await fetch("/api/panel/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("panel/calculate failed");
  const json = (await res.json()) as CalcResponse;

  const counts: Counts = {
    classic: json.classic?.total_panels ?? 0,
    ai_checker: json.ai_checker?.total_panels ?? 0,
    rl: json.rl?.total_panels ?? 0,
  };

  const order: ModeKey[] = ["ai_checker", "rl", "classic"];
  const bestKey = order.reduce<ModeKey>((best, key) => {
    const cur = counts[key];
    const bestVal = counts[best];
    if (cur > bestVal) return key;
    if (cur === bestVal && order.indexOf(key) < order.indexOf(best)) return key;
    return best;
  }, "classic");

  const best = (json as any)[bestKey] ?? {
    panel_positions: [],
    total_panels: 0,
  };

  const postLayouts = ((json as any).postprocess ?? {}) as PostLayouts;

  return {
    bestKey,
    bestLayout: best.panel_positions ?? [],
    bestCount: best.total_panels ?? 0,
    counts,
    all: json,
    post: postLayouts, // <- tip artık PostLayouts
  };
}
