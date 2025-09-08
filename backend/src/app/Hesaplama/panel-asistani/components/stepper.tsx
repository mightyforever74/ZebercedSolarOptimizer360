"use client";
import React, { useEffect, useState } from "react";
import ObstacleEditor from "@/components/ObstacleEditor";
import PanelVisualizer from "@/components/PanelVisualizer";
import CardWithList from "@/components/CardWithList";
import Link from "next/link";

import {
  Tabs,
  TabsHeader,
  Tab,
  TabsBody,
  TabPanel,
  Button,
  CardHeader,
  CardBody,
  CardFooter,   // ✅ buraya eklendi
  Checkbox,
  Typography,
  Input,
  Stepper,
  Step,
  Switch,
  Avatar,
  IconButton,
  Tooltip,
  Spinner,
} from "@material-tailwind/react";

import { PencilIcon, StarIcon } from "@heroicons/react/24/solid";
import {
  fetchBestAlgorithmLayout,
  type PostLayouts,
} from "@/utils/panelLayoutUtils";

const MTabs       = Tabs       as unknown as React.FC<any>;
const MTabsHeader = TabsHeader as unknown as React.FC<any>;
const MTab        = Tab        as unknown as React.FC<any>;
const MTabsBody   = TabsBody   as unknown as React.FC<any>;
const MTabPanel   = TabPanel   as unknown as React.FC<any>;

type Obstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: string;
  position?: { x: number; y: number };
};

type PanelParams = {
  edgeMargin: number;
  panelSpacingX: number;
  maintenanceGapEveryNRows: number;
  maintenanceGapHeight: number;
};

type Props = {};

type PanelResult = {
  vertical_panels: number;
  horizontal_panels: number;
  orientation: "dikey" | "yatay";
  panel_positions_vertical: any[];
  panel_positions_horizontal: any[];
  total_panels?: number;
  // ... diğer alanlar (ör: total_panels, checker_issues, vb.)
};

type AllAlgorithmSummary = {
  classic?: PanelResult;
  ai_checker?: PanelResult;
  rl?: PanelResult;
};

// ✅ Eklenen kısım
type StepperProps = {
  payload: any;
  results: any;
  onCalculate: (formData: any) => void | Promise<void>;
};

export default function Steppers({
  payload,
  results,
  onCalculate,
}: StepperProps) {
  
  // Genel state'ler
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);

  const [mousePreview, setMousePreview] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [placeByClick, setPlaceByClick] = useState<boolean>(false);
  const [x, setX] = useState<string>("");
  const [y, setY] = useState<string>("");
  const [obsWidth, setObsWidth] = useState("");
  const [obsHeight, setObsHeight] = useState("");
  const [lastSavedInfo, setLastSavedInfo] = useState("");

  const [roofWidth, setRoofWidth] = useState<string>("");
  const [roofHeight, setRoofHeight] = useState<string>("");
  const [orientation, setOrientation] = useState<string>("");
  const [gps, setGps] = useState<string>("");
  const [elevation, setElevation] = useState<string>("");
  const [slope, setSlope] = useState<string>("");

  const [showObstacles, setShowObstacles] = useState<boolean>(false);
  const [activeStep, setActiveStep] = React.useState(0);

  const [isLastStep, setIsLastStep] = useState<boolean>(false);
  const [isFirstStep, setIsFirstStep] = useState<boolean>(false);
  
  const [summary, setSummary] = useState<AllAlgorithmSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [algorithm, setAlgorithm] = useState("classic");

  const [panelCounts, setPanelCounts] = useState<{
    classic: number;
    ai_checker: number;
    rl: number;
  } | null>(null);

  // Panel parametreleri için state
  const [showInputs, setShowInputs] = useState(true);
  const [panelParams, setPanelParams] = useState({
    panelWidth: 1.134, // Panel genişliği (m)
    panelHeight: 2.278, // Panel yüksekliği (m)
    edgeMargin: 0.3, // Kenar boşluğu (m)
    panelGap: 0.12, // Panel arası boşluk (m)
    rowMaintenanceGap: 0.3, // Bakım boşluğu (m)
    rowsBeforeGap: 3, // Bakım sırası (satırda)
    panelPowerWatt: 595, // Panel gücü (W)
  });

  useEffect(() => {
  console.log("Parent’ta güncel engeller:", obstacles);
}, [obstacles]);

  // === DRAFT: STATE + HELPERS (BEGIN) ===
const [draftId, setDraftId] = useState<string | null>(null);
const API = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5005";

async function draftStart(initialInputs: any): Promise<string> {
  const res = await fetch(`${API}/api/panel/projects/draft/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: 1, project_name: "Stepper Projesi", inputs: initialInputs }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "draft/start hata");
  setDraftId(json.draft_id);
  return json.draft_id as string;           // ✅ id dön
}

async function upsertInputs(partial: any) {
  if (!draftId) return;
  await fetch(`${API}/api/panel/projects/draft/upsert-inputs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draft_id: draftId, inputs_partial: partial }),
  });
}

async function upsertOutputs(partial: any) {
  if (!draftId) return;
  await fetch(`${API}/api/panel/projects/draft/upsert-outputs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draft_id: draftId, outputs_partial: partial }),
  });
}

  // Stepper ileri/geri
  const handleNext = () => !isLastStep && setActiveStep((cur) => cur + 1);
  const handlePrev = () => !isFirstStep && setActiveStep((cur) => cur - 1);

// Panel hesaplama fonksiyonu
const handlePanelCalculation = async () => {
  setLoading(true);
  try {
    const payload = {
      roof_width: Number(roofWidth),
      roof_height: Number(roofHeight),
      panel_width: Number(panelParams.panelWidth),
      panel_height: Number(panelParams.panelHeight),
      edge_margin: Number(panelParams.edgeMargin),
      panel_gap: Number(panelParams.panelGap),
      row_maintenance_gap: Number(panelParams.rowMaintenanceGap),
      rows_before_gap: Number(panelParams.rowsBeforeGap),
      obstacles: obstacles.map((o) => ({
        x: Number(o.x),
        y: Number(o.y),
        width: Number(o.width),
        height: Number(o.height),
      })),
      panel_power_watt: Number(panelParams.panelPowerWatt),
    };

    // 1) Hesap öncesi: mevcut form girdilerini taslağa yaz
    const inputsForDraft = {
      ...payload,
      orientation,
      gps,
      elevation: Number(elevation),
      slope: Number(slope),
    };
    if (!draftId) {
      await draftStart(inputsForDraft);     // taslak yoksa oluştur
    } else {
      await upsertInputs(inputsForDraft);   // taslak varsa güncelle
    }

    // 2) Hesaplama (mevcut akış)
    const api = await fetchBestAlgorithmLayout(payload);

    setPanelCounts({
      classic: api.counts.classic ?? 0,
      ai_checker: api.counts.ai_checker ?? 0,
      rl: api.counts.rl ?? 0,
    });
    setSummary(api.all as any);
    setAlgorithm(api.bestKey);
    setPostLayouts(api.post); // { aligned:{...}, extra_fill:{...} }

    // 3) Hesap biter bitmez: çıktıları DB’ye yaz
    const outPanels =
      api.post?.extra_fill?.total_panels ??
      api.post?.aligned?.total_panels ??
      api.all?.classic?.total_panels ?? 0;

    const outKW =
      api.post?.extra_fill?.total_energy_kw ??
      api.post?.aligned?.total_energy_kw ??
      (api.all?.classic?.total_panels
        ? (api.all.classic.total_panels * (payload.panel_power_watt ?? 0)) / 1000
        : 0);

    const outLayout =
      api.post?.extra_fill?.panel_positions ??
      api.post?.aligned?.panel_positions ??
      [];

    await upsertOutputs({
      panel_count: outPanels,
      total_energy_kw: Number(outKW),
      panel_layout: outLayout,
    });
  } catch (err: any) {
    console.error(err);
    alert(`Hesaplama sırasında hata: ${err?.message ?? String(err)}`);
  } finally {
    setLoading(false);
  }
};    

  // ENGEL EKLEME SONRASI GÜNCEL STATE'İ LOGLA
  useEffect(() => {
    console.log("Parent’ta güncel engeller:", obstacles);
  }, [obstacles]);
  // Tab içerikleri

  function VerticalTabs() {
    const data = [
      {
        label: "Çatı Kenar Boşluğu",
        value: "edgeMargin",
        desc: `Paneller ile çatı kenarı arasında en az 30 cm boşluk bırakılmalıdır.
Bu, bina yönetmeliklerine uyum ve sistemin güvenliği açısından önemlidir.`,
      },
      {
        label: "Paneller Arası Mesafe",
        value: "panelSpacing",
        desc: `Yatay ve dikeyde 12 cm boşluk bırakılır. Bu, panellerin genleşip büzülmesini ve fiziksel teması önler.`,
      },
      {
        label: "Satır Arası Bakım Boşluğu",
        value: "maintenanceGap",
        desc: `Her 3 sırada bir, fazladan 30 cm boşluk bırakılır; projede bakım kolaylığı ve mevzuat için önemlidir.`,
      },
    ];
const [activeTab, setActiveTab] = useState<string>(data[0]?.value ?? "classic");

    return (
      <MTabs
        value={activeTab}
        orientation="horizontal"
        onChange={(val: any) => setActiveTab(String(val))}
      >
        <MTabsHeader className="w-48">
          {data.map(({ label, value }) => (
            <MTab key={value} value={String(value)}>
              {label}
            </MTab>
          ))}
        </MTabsHeader>

        <MTabsBody>
          {data.map(({ value, desc }) => (
            <MTabPanel
              key={value}
              value={String(value)}
              className="py-2 w-full"
              style={{ minHeight: 80, maxHeight: 180, overflowY: "auto" }}
            >
              <div className="whitespace-pre-wrap text-sm">{desc}</div>
            </MTabPanel>
          ))}
        </MTabsBody>
      </MTabs>
    );
  }
  // MANUEL ENGEL EKLEME
  function handleManualSaveObstacle() {
    if (!x || !y || !obsWidth || !obsHeight) {
      setLastSavedInfo("Tüm alanları doldurun");
      setTimeout(() => setLastSavedInfo(""), 2000);
      return;
    }
    const newObs = {
      x: parseFloat(x),
      y: parseFloat(y),
      width: parseFloat(obsWidth),
      height: parseFloat(obsHeight),
    };

    // Aynı engel zaten var mı kontrolü
    const isDuplicate = obstacles.some(
      (obs) =>
        Math.abs(obs.x - newObs.x) < 0.01 &&
        Math.abs(obs.y - newObs.y) < 0.01 &&
        Math.abs(obs.width - newObs.width) < 0.01 &&
        Math.abs(obs.height - newObs.height) < 0.01
    );
    if (isDuplicate) {
      setLastSavedInfo("Bu engel zaten mevcut!");
      setTimeout(() => setLastSavedInfo(""), 2000);
      return;
    }

    // Çatı boyutlarını double'a çevir
    const rw = parseFloat(roofWidth);
    const rh = parseFloat(roofHeight);

    // VALIDASYON!
    if (!isObstacleInsideRoof(newObs, rw, rh)) {
      setLastSavedInfo("Hata: Engel çatı sınırları dışında!");
      setTimeout(() => setLastSavedInfo(""), 2500);
      return;
    }

    setObstacles((prev) => [...prev, newObs]);
    setLastSavedInfo(`${obstacles.length + 1}. Engel kaydedildi`);
    setTimeout(() => setLastSavedInfo(""), 2000);
    setX("");
    setY("");
    setObsWidth("");
    setObsHeight("");
  }

  function handleMousePreview(x: number, y: number) {
    setMousePreview({ x, y });
  }

  // MOUSE İLE ENGEL EKLEME
  function handleMousePlace(xPos: number, yPos: number) {
    if (!obsWidth || !obsHeight) return;
    const newObs = {
      x: xPos,
      y: yPos,
      width: parseFloat(obsWidth),
      height: parseFloat(obsHeight),
    };

    // Aynı engel zaten var mı kontrolü
    const isDuplicate = obstacles.some(
      (obs) =>
        Math.abs(obs.x - newObs.x) < 0.01 &&
        Math.abs(obs.y - newObs.y) < 0.01 &&
        Math.abs(obs.width - newObs.width) < 0.01 &&
        Math.abs(obs.height - newObs.height) < 0.01
    );
    if (isDuplicate) {
      setLastSavedInfo("Bu engel zaten mevcut!");
      setTimeout(() => setLastSavedInfo(""), 2000);
      return;
    }

    const rw = parseFloat(roofWidth);
    const rh = parseFloat(roofHeight);
            

    if (!isObstacleInsideRoof(newObs, rw, rh)) {
      setLastSavedInfo("Hata: Engel çatı sınırları dışında!");
      setTimeout(() => setLastSavedInfo(""), 2500);
      return;
    }

    setObstacles((prev) => [...prev, newObs]);
    setLastSavedInfo(`${obstacles.length + 1}. Engel kaydedildi`);
    setTimeout(() => setLastSavedInfo(""), 2000);
    setX("");
    setY("");
    setObsWidth("");
    setObsHeight("");
  }

  // ENGELLERİ SİL
  function handleDeleteObstacles() {
    setObstacles([]);
    setLastSavedInfo("Tüm engeller silindi");
    setTimeout(() => setLastSavedInfo(""), 2000);
  }

  // summary, API’den gelen yanıtın tamamı (classic, ai_checker, rl)
  type AlgoKey = "classic" | "ai_checker" | "rl";
  const selectedAlgoSummary = algorithm
    ? (summary?.[algorithm as AlgoKey] as any)
    : undefined;
    // Görünüm modu ve postprocess layout state'i
  const [viewMode, setViewMode] = useState<"aligned" | "extra">("extra");
  const [postLayouts, setPostLayouts] = useState<PostLayouts>({});

  // Panel dizisini seçerken
  const panelsToShow = React.useMemo(() => {
    if (viewMode === "aligned" && postLayouts?.aligned)
      return postLayouts.aligned.panel_positions ?? [];
    if (viewMode === "extra" && postLayouts?.extra_fill)
      return postLayouts.extra_fill.panel_positions ?? [];
    // aksi halde algoritmanın kendi sonucu (RL ise panel_positions, diğerleri dikey/yatay)
    if (selectedAlgoSummary) {
      if (selectedAlgoSummary.orientation === "ai")
        return selectedAlgoSummary.panel_positions ?? [];
      if (selectedAlgoSummary.orientation === "dikey")
        return selectedAlgoSummary.panel_positions_vertical ?? [];
      return selectedAlgoSummary.panel_positions_horizontal ?? [];
    }
    return [];
  }, [viewMode, postLayouts, selectedAlgoSummary]);

  // --- final özet/çıktı tercih sırası: extra_fill > aligned > classic ---
const finalPanels =
  postLayouts?.extra_fill?.total_panels ??
  postLayouts?.aligned?.total_panels ??
  summary?.classic?.total_panels ??
  0;

const finalKW =
  postLayouts?.extra_fill?.total_energy_kw ??
  postLayouts?.aligned?.total_energy_kw ??
  (summary?.classic
    ? ((summary.classic.total_panels ?? 0) * (payload?.panel_power_watt ?? panelParams.panelPowerWatt ?? 0)) / 1000
    : 0);

const finalLayout =
  (viewMode === "extra"
    ? postLayouts?.extra_fill?.panel_positions
    : postLayouts?.aligned?.panel_positions) ??
  panelsToShow ??
  [];


  // Render:
  return (
    <CardBody className="tw-mt-16 tw-w-full tw-border tw-border-blue-gray-100 tw-shadow-sm">
      <CardHeader
        floated={false}
        shadow={false}
        variant="gradient"
        color="gray"
        className="tw-grid tw-h-20 tw-place-items-center"
      >
        <div className="tw-w-full tw-px-20 tw-pt-5 tw-pb-16">
          <Stepper
            activeStep={activeStep}
            isLastStep={(value) => setIsLastStep(value)}
            isFirstStep={(value) => setIsFirstStep(value)}
            lineClassName="tw-bg-white/50"
            activeLineClassName="tw-bg-white"
          >
            <Step
              className="tw-h-4 tw-w-4 !tw-bg-blue-gray-50 !tw-text-white/75"
              activeClassName="tw-ring-0 !tw-bg-white !tw-text-white"
              completedClassName="!tw-bg-white !tw-text-white"
              onClick={() => setActiveStep(0)}
            >
              <div className="tw-absolute tw-top-6 -tw-bottom-[2.3rem] tw-w-max tw-text-center tw-text-xs">
                <Typography
                  color="inherit"
                  className="tw-text-xs tw-uppercase !tw-font-normal"
                >
                  Çatı
                </Typography>
              </div>
            </Step>
            <Step
              className="tw-h-4 tw-w-4 !tw-bg-blue-gray-50 tw-text-white/75"
              activeClassName="tw-ring-0 !tw-bg-white tw-text-white"
              completedClassName="!tw-bg-white !tw-text-white"
              onClick={() => setActiveStep(1)}
            >
              <div className="tw-absolute tw-top-6 -tw-bottom-[2.3rem] tw-w-max tw-text-center tw-text-xs">
                <Typography
                  color="inherit"
                  className="tw-text-xs tw-uppercase !tw-font-normal"
                >
                  Engel
                </Typography>
              </div>
            </Step>

            <Step
              className="tw-h-4 tw-w-4 !tw-bg-blue-gray-50 tw-text-white/75"
              activeClassName="tw-ring-0 !tw-bg-white tw-text-white"
              completedClassName="!tw-bg-white !tw-text-white"
              onClick={() => setActiveStep(2)}
            >
              <div className="tw-absolute tw-top-6 -tw-bottom-[2.3rem] tw-w-max tw-text-center tw-text-xs">
                <Typography
                  color="inherit"
                  className="tw-text-xs tw-uppercase !tw-font-normal"
                >
                  Yönetmelik
                </Typography>
              </div>
            </Step>
            <Step
              className="tw-h-4 tw-w-4 !tw-bg-blue-gray-50 tw-text-white/75"
              activeClassName="tw-ring-0 !tw-bg-white tw-text-white"
              completedClassName="!tw-bg-white !tw-text-white"
              onClick={() => setActiveStep(3)}
            >
              <div className="tw-absolute tw-top-6 -tw-bottom-[2.3rem] tw-w-max tw-text-center tw-text-xs">
                <Typography
                  color="inherit"
                  className="tw-text-xs tw-uppercase !tw-font-normal"
                >
                  Panel Yerleştirme
                </Typography>
              </div>
            </Step>
          </Stepper>
        </div>
      </CardHeader>
      <CardBody className="tw-flex tw-flex-col">
        {activeStep === 0 && (
          <React.Fragment>
            {/* Çatı bilgileri giriş formları */}

            <div className="tw-grid tw-w-full tw-max-w-2xl tw-place-self-center">
              <Typography
                variant="h5"
                color="blue-gray"
                className="tw-mb-3 tw-mt-6 tw-text-center !tw-font-normal"
              >
                Lütfen alan boyutlarını giriniz.
              </Typography>
              <Typography
                variant="paragraph"
                className="tw-text-center !tw-text-blue-gray-500"
              >
                Güneş paneli yerleştilecek alanın metre cinsinden boyutlarını
                giriniz.
              </Typography>
            </div>
            <div className="tw-mt-8 tw-flex tw-w-full tw-flex-col tw-justify-center tw-gap-x-20 md:tw-flex-row">
              <div className="tw-relative stw-elf-center">
                <Avatar
                  src="/img/GüneşPaneli.jpg"
                  size="xxl"
                  alt="avatar"
                  variant="rounded"
                />

                <div className="tw-relative tw-bottom-5 -tw-right-[5.8rem]">
                  <Tooltip content="Edit" placement="top">
                    <IconButton variant="gradient" size="sm">
                      <PencilIcon className="tw-h-3 tw-w-3" />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>

              <div className="tw-grid tw-w-full tw-max-w-xl tw-gap-6">
                <Input
                  variant="standard"
                  label="Genişlik x.x (m)"
                  value={roofWidth}
                  onChange={(e) => setRoofWidth(e.target.value)}
                />
                <Input
                  variant="standard"
                  label="Yükseklik x.x (m)"
                  value={roofHeight}
                  onChange={(e) => setRoofHeight(e.target.value)}
                />

                <Typography
                  variant="paragraph"
                  className="tw-text-left !tw-text-blue-gray-500"
                >
                  Güneş paneli yerleştirilen alanın cephesini giriniz.
                  <br />
                  <span className="tw-block tw-text-sm tw-text-gray-500">
                    Yönü derece cinsinden girin. (Kuzey=0°, Doğu=90°,
                    Güney=180°, Batı=270°)
                  </span>
                </Typography>

                <Input
                  variant="standard"
                  label="Cephe xxx °"
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                />

                <Typography
                  variant="paragraph"
                  className="tw-text-left !tw-text-blue-gray-500"
                >
                  GPS koordinatlarını giriniz.
                  <span className="tw-block tw-text-sm tw-text-gray-500">
                    "Örn:Konum Kuzey ve Doğu olmak üzere 41.0082, 28.9784"
                  </span>
                </Typography>

                <Input
                  variant="standard"
                  label="Konum xx.xxx , xx.xxx"
                  value={gps}
                  onChange={(e) => setGps(e.target.value)}
                />

                <Typography
                  variant="paragraph"
                  className="tw-text-left !tw-text-blue-gray-500"
                >
                  Güneş paneli yerleştirilmiş alanın deniz seviyesinden
                  yüksekliğini giriniz.
                  <br />
                </Typography>

                <Input
                  variant="standard"
                  label=" xxxx metre"
                  value={elevation}
                  onChange={(e) => setElevation(e.target.value)}
                />

                <Typography
                  variant="paragraph"
                  className="tw-text-left !tw-text-blue-gray-500"
                >
                  Güneş paneli yerleştirilmiş alanın eğimi derece olarak
                  giriniz.
                  <br />
                  <span className="tw-block tw-text-sm tw-text-gray-500">
                    Örn: Çatının veya güneş paneli arazisinin xx°
                  </span>
                </Typography>

                <Input
                  variant="standard"
                  label="Eğim açısı xx °"
                  value={slope}
                  onChange={(e) => setSlope(e.target.value)}
                />
                <br />
              </div>
            </div>
          </React.Fragment>
        )}
        {activeStep === 1 && (
          <React.Fragment>
            {/* Alan çizimi ve interaktif engel yerleştirme */}
            
            <div className="tw-flex tw-items-center tw-justify-between tw-w-full">
              <Typography
                variant="paragraph"
                className="tw-text-left !tw-text-blue-gray-500"
              >
                <span>{obstacles.length}. Engeli yerleştirdiniz</span>
              </Typography>
            </div>{" "}
            <br />
            <span className="tw-block tw-text-sm tw-text-gray-500">
              Referans noktası sol alt noktadır.
            </span>
            <div className="tw-flex tw-justify-between tw-items-center tw-w-full tw-mt-6">
              <div className="tw-flex tw-items-center">
                {/* ✅ Switch: “Engeli çizim üzerinden yerleştirmek istiyorum” */}
                <Switch
                  id="mouse-place"
                  checked={placeByClick}
                  onChange={(e) => {
                    setPlaceByClick(e.target.checked);
                    if (e.target.checked) {
                      setShowObstacles(true); // Seçildiğinde engelleri de göster
                    }
                  }}
                  label="Engeli çizim üzerinden yerleştirmek istiyorum"
                  color="gray"
                  labelProps={{
                    className:
                      "tw-text-sm !tw-font-normal tw-text-blue-gray-300",
                  }}
                  className="tw-my-2"
                />
              </div>

              {/* ✅ "Engelleri kaydet" butonu */}
              {!placeByClick && (
                <Button
                  className="tw-flex tw-gap-2"
                  variant="gradient"
                  onClick={handleManualSaveObstacle} // 👈 Fonksiyonu ekledik!
                >
                  kaydet
                </Button>
              )}
            </div>
            {/* Son işlem info mesajı */}
            {lastSavedInfo && (
              <div className="tw-mt-2 tw-text-green-700 tw-font-semibold">
                {lastSavedInfo}
              </div>
            )}
            {!placeByClick && (
              <div className="tw-mb-4 tw-mt-8 tw-flex tw-w-full tw-flex-col tw-gap-6 md:tw-flex-row">
                <Input
                  type="number"
                  label="Yatay uzaklık x.x (m)"
                  value={x}
                  onChange={(e) => setX(e.target.value)}
                  className="tw-w-full tw-border tw-p-2 tw-rounded"
                />
                <Input
                  type="number"
                  label=" Dikey uzaklık x.x (m)"
                  value={y}
                  onChange={(e) => setY(e.target.value)}
                  className="tw-w-full"
                />
              </div>
            )}{" "}
            <br />
            <div className="tw-flex tw-gap-4">
              <br />
              <br />
              <Input
                label="Engelin genişliği x.x (m)"
                value={obsWidth}
                onChange={(e) => setObsWidth(e.target.value)}
                className="tw-w-full"
              />
              <Input
                label="Engelin uzunluğu x.x (m)"
                value={obsHeight}
                onChange={(e) => setObsHeight(e.target.value)}
                className="tw-w-full"
              />
            </div>
            <br />
            <br />
            {/* ✅ 3) “Alan ve engelleri göster” butonu  */}
            <div className="tw-flex tw-justify-between tw-items-center tw-w-full tw-mt-6">
              <div className="tw-flex tw-items-center">
                <Checkbox
                  id="show-obstacles"
                  checked={placeByClick || showObstacles}
                  onChange={(e) => {
                    // Sadece showObstacles'ı değiştir, placeByClick'i etkilemesin
                    setShowObstacles(e.target.checked);
                  }}
                  color="blue-gray"
                />
                <label
                  htmlFor="mouse-place"
                  className="tw-text-blue-gray-500 hover:tw-bg-blue-gray-500 hover:tw-text-white tw-text-sm"
                >
                  Alan ve engelleri göster
                </label>
              </div>
              <br />
              <br />

              {/* ✅ 4) “Engelleri sil” butonu  */}
              <div className="tw-flex tw-items-center tw-mt-6">
                <Button
                  className="tw-flex tw-gap-2"
                  variant="gradient"
                  onClick={handleDeleteObstacles}
                >
                  Engelleri Sil
                </Button>
              </div>
            </div>
            {(showObstacles || placeByClick) && (
              <ObstacleEditor
                roofWidth={parseFloat(roofWidth)}
                roofHeight={parseFloat(roofHeight)}
                obstacles={obstacles}
                placeByClick={placeByClick}
                obsWidth={obsWidth}
                obsHeight={obsHeight}
                mousePreview={mousePreview}
                onMousePlace={handleMousePlace}
                onMousePreview={handleMousePreview}
                showObstacles={showObstacles}
                sunAzimuthDeg={45} // 0=sağ, 90=aşağı, 180=sol, 270=yukarı
                sunIntensity={2}
                roofHue={20}
              />
            )}
            <br />
            <br />
            <div className="tw-col-span-1 tw-mt-6 tw-mb-10 tw-px-16">
              <div className="lg:tw-mt-12">
                <Typography variant="h3" color="blue-gray">
                  Alan üzerine Panel çizimi için hazır mısınız?
                </Typography>

                <div className="tw-mt-2 tw-flex tw-gap-1 !tw-text-blue-gray-500">
                  <StarIcon className="tw-h-5 tw-w-5" />
                  <StarIcon className="tw-h-5 tw-w-5" />
                  <StarIcon className="tw-h-5 tw-w-5" />
                  <StarIcon className="tw-h-5 tw-w-5" />
                  <StarIcon className="tw-h-5 tw-w-5" />
                </div>

                <div className="tw-mt-6 tw-grid tw-w-full tw-gap-1 !tw-text-blue-gray-500">
                  <div className="tw-mt-2 tw-px-3">
                    <div className="tw-flex tw-items-baseline tw-gap-2">
                      <span className="tw-h-1.5 tw-w-1.5 tw-rounded-full tw-bg-blue-gray-500" />
                      <Typography variant="paragraph">
                        Alan boyutlarını girdiniz mi?
                      </Typography>
                    </div>
                    <div className="tw-flex tw-items-baseline tw-gap-2">
                      <span className="tw-h-1.5 tw-w-1.5 tw-rounded-full tw-bg-blue-gray-500" />
                      <Typography variant="paragraph">
                        Alanın teknik resmini ve ya resmini yükleyebilirsiniz.
                      </Typography>
                    </div>

                    {/* ✅ 5) “Alanın keşfi için drone uçuşuna randevu alınız” butonu  */}

                    <div className="tw-flex tw-items-baseline tw-gap-2">
                      <span className="tw-h-1.5 tw-w-1.5 tw-rounded-full tw-bg-blue-gray-500" />
                      <Typography variant="paragraph">
                        Alanın keşfi için drone uçuşuna randevu alınız!
                      </Typography>
                      <div className="tw-flex tw-flex-col tw-items-end tw-gap-4 tw-text-right tw-ml-auto">
                        <Link
                          href="/pages/contact-start"
                          className="tw-ml-auto"
                        >
                          <Button
                            type="button"
                            size="sm"
                            variant="gradient"
                            className="tw-w-32 tw-bg-blue-500"
                          >
                            bize ulaşın
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="tw-flex tw-justify-between tw-items-center tw-w-full tw-mt-6">
              <div className="tw-flex tw-items-center">
                <Checkbox
                  onChange={async () => {
                    await handlePanelCalculation(); // Klasik hesaplama
                  }}
                  id="panel-yerlesimini-hesapla"
                  color="blue-gray"
                />
                <label className="tw-text-blue-gray-500 hover:tw-bg-blue-gray-500 hover:tw-text-white tw-text-sm">
                  Klasik Grid Yöntemi İle Panel Sayısı Hesapla
                </label>
              </div>

              {/* Spinner hesaplama sürerken gösterilsin */}
              {loading ? (
                <Spinner color="green" />
              ) : (
                summary &&
                summary.classic && (
                  <div className="tw-mt-2 tw-text-blue-gray-700 tw-text-sm">
                    Toplam Panel: <b>{summary.classic.total_panels ?? "-"}</b> |
                    Yön: <b>{summary.classic.orientation ?? "-"}</b>
                  </div>
                )
              )}
            <br />
            <br />            
          </div>         
        </React.Fragment>
        )}        
        {activeStep === 2 && (
          <React.Fragment>
            <h2 className="tw-text-lg tw-font-semibold tw-mb-4">
              Panel Hesaplama Ayarları
            </h2>
            <VerticalTabs />
            <div className="tw-p-6">
              <Switch
                id="panel-settings"
                label="Tavsiye Edilen Başlangıç Değerlerini Değiştirmek İstiyorum"
                checked={showInputs}
                onChange={() => setShowInputs((v) => !v)}
                color="gray"
                labelProps={{
                  className: "tw-text-sm !tw-font-normal tw-text-blue-gray-300",
                }}
                className="tw-my-2"
              />

              {showInputs && (
                <div className="tw-grid tw-w-full tw-max-w-xl tw-gap-6">
                  <div className="tw-col-span-1">
                    <Typography variant="h6" color="blue-gray">
                      Çatı Kenar Boşluğu (m)
                    </Typography>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.3"
                      className="tw-mt-2"
                      value={panelParams.edgeMargin}
                      onChange={(e) =>
                        setPanelParams({
                          ...panelParams,
                          edgeMargin: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="tw-col-span-1">
                    <Typography variant="h6" color="blue-gray">
                      Paneller Arası Mesafe (m)
                    </Typography>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.12"
                      className="tw-mt-2"
                      value={panelParams.panelGap}
                      onChange={(e) =>
                        setPanelParams({
                          ...panelParams,
                          panelGap: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="tw-col-span-1">
                    <Typography variant="h6" color="blue-gray">
                      Satır Arası Bakım Boşluğu (m)
                    </Typography>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.3"
                      className="tw-mt-2"
                      value={panelParams.rowMaintenanceGap}
                      onChange={(e) =>
                        setPanelParams({
                          ...panelParams,
                          rowMaintenanceGap: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="tw-col-span-1">
                    <Typography variant="h6" color="blue-gray">
                      Kaç Satırda Bir Bakım Boşluğu?
                    </Typography>
                    <Input
                      type="number"
                      min="1"
                      placeholder="3"
                      className="tw-mt-2"
                      value={panelParams.rowsBeforeGap}
                      onChange={(e) =>
                        setPanelParams({
                          ...panelParams,
                          rowsBeforeGap: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>{" "}
                </div>
              )}
            </div>
          </React.Fragment>        
        )}
        {activeStep === 3 && (
          <React.Fragment>
            {/* Görünüm modu seçici */}
            <div className="tw-grid tw-w-full tw-max-w-xl tw-gap-6">
              {panelCounts && (
                <CardWithList
                  panelCounts={{
                    classic: panelCounts.classic ?? 0,
                    ai_checker: panelCounts.ai_checker ?? 0,
                    rl: panelCounts.rl ?? 0,
                  }}
                  setViewMode={setViewMode}
                />
              )}
            </div>
            <div className="tw-flex tw-gap-4 tw-mb-4">
              <Button
                size="sm"
                variant={viewMode === "aligned" ? "gradient" : "outlined"}
                onClick={() => setViewMode("aligned")}
              >
                Animasyon
              </Button>
              <br />
              <Button
                size="sm"
                variant={viewMode === "extra" ? "gradient" : "outlined"}
                onClick={() => setViewMode("extra")}
              >
                İlave Ters Yön Dolgu
              </Button>
            </div>
            {/* Animasyon alanı dış sarmalayıcı */}
            <div id="printable-animation">
              {finalLayout.length > 0 && (
                <PanelVisualizer
                  panels={finalLayout}
                  obstacles={obstacles}
                  scale={60}
                  animate
                  intervalMs={100}
                  startDelayMs={0.1}
                  onComplete={() => console.log("Animasyon tamam")}
                />
              )}        
             

              {/* Proje Özeti Kartı */}
              <div className="tw-mt-6 tw-p-4 tw-border tw-rounded-lg tw-bg-gray-50">
                <h3 className="tw-font-bold tw-text-lg tw-mb-2">Proje Özeti</h3>
                <ul className="tw-list-disc tw-pl-5 tw-text-sm tw-text-gray-700">
                  <li>
                    Çatı Boyutları: {roofWidth ? `${Number(roofWidth)}m` : "m"} × {roofHeight ? `${Number(roofHeight)}m` : "m"}
                  </li>
                  <li>
                    Panel Ölçüleri: {panelParams.panelWidth ? `${Number(panelParams.panelWidth)}m` : "m"} ×{" "}
                    {panelParams.panelHeight ? `${Number(panelParams.panelHeight)}m` : "m"}
                  </li>
                  <li>Kenar Boşluğu: {panelParams.edgeMargin ?? "m"}{panelParams.edgeMargin != null ? "m" : ""}</li>
                  <li>Panel Boşluğu: {panelParams.panelGap ?? "m"}{panelParams.panelGap != null ? "m" : ""}</li>
                  <li>
                    Bakım Boşluğu: {panelParams.rowMaintenanceGap ?? "m"}{panelParams.rowMaintenanceGap != null ? "m" : ""} /{" "}
                    {panelParams.rowsBeforeGap ?? "—"} satırda
                  </li>
                  <li>Engeller: {Array.isArray(obstacles) && obstacles.length > 0 ? `${obstacles.length} adet` : "Yok"}</li>
                </ul>

                <hr className="tw-my-2" />
                <p className="tw-font-semibold">
                  Sonuç: {finalPanels} panel → {finalKW.toFixed(2)} kW
                </p>

                {/* Kaydet Butonu */}
                <div className="tw-mt-4 tw-flex tw-gap-2">                  
                  {false && (
                    <Button color="green" onClick={async () => { /* commit hazır olunca aç */ }}>
                      Projeyi Kaydet
                    </Button>
                  )}
                </div>
              </div>              
            </div>
          </React.Fragment>
        )}
      <CardFooter className="tw-flex tw-justify-between">
          <Button
            color="gray"
            onClick={handlePrev}
            disabled={isFirstStep}
            variant="outlined"
          >
            Prev
          </Button>
          <Button onClick={handleNext} variant="gradient" disabled={isLastStep}>
            Next
          </Button>
      </CardFooter>
      </CardBody>
    </CardBody>
    );
  }// Çatı sınırı kontrol fonksiyonu

function isObstacleInsideRoof(
  obs: { x: number; y: number; width: number; height: number },
  roofWidth: number,
  roofHeight: number
): boolean {
  try {
    // Sayısallaştır ve hızlı doğrula
    const x  = Number(obs?.x);
    const y  = Number(obs?.y);
    const w  = Number(obs?.width);
    const h  = Number(obs?.height);
    const rw = Number(roofWidth);
    const rh = Number(roofHeight);

    if (![x, y, w, h, rw, rh].every(Number.isFinite)) return false;
    if (w <= 0 || h <= 0 || rw <= 0 || rh <= 0)       return false;

    // Tamamen çatı içinde mi?
    return x >= 0 && y >= 0 && x + w <= rw && y + h <= rh;
  } catch {
    // Olası runtime hatalarında güvenli geri dönüş
    return false;
  }
}