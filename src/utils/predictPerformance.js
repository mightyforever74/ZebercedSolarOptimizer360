export async function predictPerformance(payload) {
  console.log("[ML API] Gönderilen payload:", payload);

  try {
    const res = await fetch("http://localhost:5004/predict-performance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("[ML API] Gelen response:", data); // ← output da loglanmalı
    return data;
  } catch (err) {
    console.error("❌ [ML API] Hata:", err);
    return null;
  }
}
