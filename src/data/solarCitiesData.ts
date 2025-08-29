// src/data/solarCitiesData.ts

// 1. Şehir, enlem, plaka datası
const cityLatitudes: Record<string, { name: string; latitude: number }> = {
  "01": { name: "Adana", latitude: 37.0 },
  "02": { name: "Adıyaman", latitude: 37.7648 },
  "03": { name: "Afyonkarahisar", latitude: 38.7567 },
  "04": { name: "Ağrı", latitude: 39.7191 },
  "05": { name: "Amasya", latitude: 40.6539 },
  "06": { name: "Ankara", latitude: 39.9208 },
  "07": { name: "Antalya", latitude: 36.8969 },
  "08": { name: "Artvin", latitude: 41.1828 },
  "09": { name: "Aydın", latitude: 37.845 },
  "10": { name: "Balıkesir", latitude: 39.6484 },
  "11": { name: "Bilecik", latitude: 40.1428 },
  "12": { name: "Bingöl", latitude: 39.0626 },
  "13": { name: "Bitlis", latitude: 38.3938 },
  "14": { name: "Bolu", latitude: 40.576 },
  "15": { name: "Burdur", latitude: 37.7203 },
  "16": { name: "Bursa", latitude: 40.1956 },
  "17": { name: "Çanakkale", latitude: 40.1553 },
  "18": { name: "Çankırı", latitude: 40.6013 },
  "19": { name: "Çorum", latitude: 40.5506 },
  "20": { name: "Denizli", latitude: 37.7765 },
  "21": { name: "Diyarbakır", latitude: 37.9144 },
  "22": { name: "Edirne", latitude: 41.6772 },
  "23": { name: "Elazığ", latitude: 38.6809 },
  "24": { name: "Erzincan", latitude: 39.7521 },
  "25": { name: "Erzurum", latitude: 39.9043 },
  "26": { name: "Eskişehir", latitude: 39.7767 },
  "27": { name: "Gaziantep", latitude: 37.0662 },
  "28": { name: "Giresun", latitude: 40.9128 },
  "29": { name: "Gümüşhane", latitude: 40.4591 },
  "30": { name: "Hakkari", latitude: 37.5744 },
  "31": { name: "Hatay", latitude: 36.4018 },
  "32": { name: "Isparta", latitude: 37.7648 },
  "33": { name: "Mersin", latitude: 36.8121 },
  "34": { name: "İstanbul", latitude: 41.0082 },
  "35": { name: "İzmir", latitude: 38.4192 },
  "36": { name: "Kars", latitude: 40.6167 },
  "37": { name: "Kastamonu", latitude: 41.3887 },
  "38": { name: "Kayseri", latitude: 38.7312 },
  "39": { name: "Kırklareli", latitude: 41.7351 },
  "40": { name: "Kırşehir", latitude: 39.1451 },
  "41": { name: "Kocaeli", latitude: 40.8533 },
  "42": { name: "Konya", latitude: 37.8716 },
  "43": { name: "Kütahya", latitude: 39.4192 },
  "44": { name: "Malatya", latitude: 38.3552 },
  "45": { name: "Manisa", latitude: 38.6191 },
  "46": { name: "Kahramanmaraş", latitude: 37.5737 },
  "47": { name: "Mardin", latitude: 37.3121 },
  "48": { name: "Muğla", latitude: 37.2153 },
  "49": { name: "Muş", latitude: 38.9462 },
  "50": { name: "Nevşehir", latitude: 38.6244 },
  "51": { name: "Niğde", latitude: 37.9667 },
  "52": { name: "Ordu", latitude: 40.9848 },
  "53": { name: "Rize", latitude: 41.0201 },
  "54": { name: "Sakarya", latitude: 40.7731 },
  "55": { name: "Samsun", latitude: 41.2867 },
  "56": { name: "Siirt", latitude: 37.9274 },
  "57": { name: "Sinop", latitude: 42.0267 },
  "58": { name: "Sivas", latitude: 39.7477 },
  "59": { name: "Tekirdağ", latitude: 40.978 },
  "60": { name: "Tokat", latitude: 40.3097 },
  "61": { name: "Trabzon", latitude: 41.0015 },
  "62": { name: "Tunceli", latitude: 39.108 },
  "63": { name: "Şanlıurfa", latitude: 37.1674 },
  "64": { name: "Uşak", latitude: 38.6823 },
  "65": { name: "Van", latitude: 38.4942 },
  "66": { name: "Yozgat", latitude: 39.8206 },
  "67": { name: "Zonguldak", latitude: 41.4564 },
  "68": { name: "Aksaray", latitude: 38.3687 },
  "69": { name: "Bayburt", latitude: 40.2586 },
  "70": { name: "Karaman", latitude: 37.1814 },
  "71": { name: "Kırıkkale", latitude: 39.8468 },
  "72": { name: "Batman", latitude: 37.8812 },
  "73": { name: "Şırnak", latitude: 37.4187 },
  "74": { name: "Bartın", latitude: 41.6356 },
  "75": { name: "Ardahan", latitude: 41.1105 },
  "76": { name: "Iğdır", latitude: 39.9237 },
  "77": { name: "Yalova", latitude: 40.65 },
  "78": { name: "Karabük", latitude: 41.2061 },
  "79": { name: "Kilis", latitude: 36.7184 },
  "80": { name: "Osmaniye", latitude: 37.0742 },
  "81": { name: "Düzce", latitude: 40.8438 },
};

// 2. Enleme göre kWh/m² aralığı
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function estimateGHIbyLat(latitude: number) {
  // 36° -> ~1800, 42° -> ~1500 (yaklaşık doğrusal)
  const ghiMid = 1800 + (latitude - 36) * (-50);
  const mid = clamp(ghiMid, 1350, 1850);
  const band = 50; // ±50
  const min = Math.round(mid - band);
  const max = Math.round(mid + band);
  return {
    ghi_min: min,
    ghi_max: max,
    ghi_mid: Math.round(mid),
    display: `${min} - ${max}`,
  };
}

export const solarCitiesData = Object.values(cityLatitudes).map((v) => {
  const est = estimateGHIbyLat(v.latitude);
  return {
    city: v.name,
    // string sütun
    "Yıllık Güneş Enerjisi Potansiyeli (kWh/m²)": `${est.ghi_min} - ${est.ghi_max}`,
    // sayısal alanlar (grafik/renkleme için güvenli)
    ghi_min: est.ghi_min,
    ghi_max: est.ghi_max,
    ghi_mid: est.ghi_mid,
  };
});


