import { chartsConfig } from "@/configs";

const websiteViewsChart = {
  type: "bar",
  height: 220,
  series: [
    {
      name: "Ziyaret",
      data: [50, 20, 10, 22, 50, 10, 40],
    },
  ],
  options: {
    ...chartsConfig,
    colors: "#388e3c",
    plotOptions: {
      bar: {
        columnWidth: "16%",
        borderRadius: 5,
      },
    },
    xaxis: {
      ...chartsConfig.xaxis,
      categories: ["Paz", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
    },
  },
};

const dailySalesChart = {
  type: "line",
  height: 220,
  series: [
    {
      name: "Fiyat Teklifi",
      data: [1, 1, 0, 0, 0, 0, 0, 335, 0],
    },
  ],
  options: {
    ...chartsConfig,
    colors: ["#0288d1"],
    stroke: {
      lineCap: "round",
    },
    markers: {
      size: 5,
    },
    xaxis: {
      ...chartsConfig.xaxis,
      categories: [
        "Ocak",
        "Şubat",
        "Mart",
        "Nisan",
        "Mayıs",
        "Haziran",
        "Temmuz",
        "Ağustos",
        "Eylül",
        "Ekim",
        "Kasım",
        "Aralık",
      ],
    },
  },
};



export const statisticsChartsData = [
  {
    color: "white",
    title: "Site Ziyaret Sayısı",
    description: "En iyi Kampanya Performansı",
    footer: "campaign sent 2 days ago",
    chart: websiteViewsChart,
  },
  {
    color: "white",
    title: "Aylık Fiyat Teklifleri",
    description: "...",
    footer: "aylık güncelleme",
    chart: dailySalesChart,
  },
  
];

export default statisticsChartsData;
