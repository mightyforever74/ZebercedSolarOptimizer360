//çatıya panel yerleşimi için makine öğrenmesi (ML) tabanlı bir API'den sonuç almaya çalışır.
// Eğer ML API başarısız olursa, yedek bir algoritma ile panel yerleşimini hesaplar.
// Bu yedek algoritma, çatı ve engelleri dikkate alarak panel yerleşimini optimize eder.
import { fallbackLayout } from "../utils/fallbackLayout";

export async function calculateOptimalPanelLayout(
  obstacles,
  roofWidth,
  roofHeight
) {
  // 1. API payload logu
  console.log("[ML API] Gönderilen payload:", {
    roofWidth,
    roofHeight,
    obstacles,
  });

  try {
    const response = await fetch("http://localhost:5000/inference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roofWidth,
        roofHeight,
        obstacles,
      }),
    });

    // 2. API response logu
    const result = await response.json();
    console.log("[ML API] Gelen response:", result);

    if (!result || !result.layout || result.layout.length === 0) {
      throw new Error("Empty or invalid ML layout response");
    }

    // 3. Başarılı ise sonucu döndür, ayrıca logla
    console.log("[ML API] Başarılı: Panel yerleşim sonucu:", result.layout);
    return result;
  } catch (error) {
    // 4. API veya cevap hatasında fallback'a geçildiğini logla
    console.warn(
      "⚠️ [ML API] ML layout failed, fallback algoritması çalışıyor.",
      error
    );

    const layouts = [
      { orientation: "Yatay", width: 1.7, height: 1.1 },
      { orientation: "Dikey", width: 1.1, height: 1.7 },
    ];

    const results = layouts.map((layout) => {
      const placed = fallbackLayout(obstacles, roofWidth, roofHeight, layout);
      const count = placed.length;
      const power = parseFloat(((count * 570) / 1000).toFixed(2));

      // 5. Her oryantasyonda logla
      console.log(
        `[Fallback] ${layout.orientation} denendi: ${count} panel, toplam güç: ${power} kW`
      );
      if (placed.length) {
        console.log(`[Fallback] İlk panel örneği:`, placed[0]);
      }

      return {
        orientation: layout.orientation,
        count,
        power,
        layout: placed,
      };
    });

    // 6. En iyi fallback sonucu seç ve logla
    const best =
      results.length > 0
        ? results.reduce((a, b) => (a.count >= b.count ? a : b))
        : {
            layout: [],
            count: 0,
            power: 0,
            orientation: "fallback",
          };

    if (best.count === 0) {
      console.log(
        "[Fallback] Sonuç: Hiç panel yerleştirilemedi! (Çatı veya engelleri kontrol et)"
      );
    } else if (best.orientation === "fallback") {
      console.log("[Fallback] Hiçbir yöntem başarılı olamadı.");
    } else {
      console.log(
        `[Fallback] En iyi sonuç: ${best.count} panel (${best.orientation}), toplam güç: ${best.power} kW`
      );
    }

    return best;
  }
}
