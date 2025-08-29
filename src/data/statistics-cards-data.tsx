// data/statistics-cards-data.tsx
import {
  BanknotesIcon,
  HomeModernIcon,
  ChartBarIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";

export const statisticsCardsData = [
  {
    color: "gray",
    icon: HomeModernIcon,
    title: "25 Yıl Sonunda Güneş Paneli ",
    value: "+87%",
    footer: {
      color: "<tw-text-green-1></tw-text-green-1>00",
      value: "İstikrar",
      label: "Performans",
    },
  },
  {
    color: "gray",
    icon: BanknotesIcon,
    title: "30 yıl sonunda Güneş Paneli",
    value: "+83%",
    footer: {
      color: "tw-text-green-500",
      value: "Dayanıklılık",
      label: "Performans",
    },
  },  
  {
    color: "gray",
    icon: ChartBarIcon,
    title: "Günlük Kullanıcı Sayısı",
    value: "...",
    footer: {
      color: "tw-text-green-500",
      value: "+2%",
      label: "geçen hafta",
    },
  },
  {
    color: "gray",
    icon: UserPlusIcon,
    title: "Takipçilerimiz",
    value: "...",
    footer: {
      label: "Güncellendi",
    },
  },
];

export default statisticsCardsData;