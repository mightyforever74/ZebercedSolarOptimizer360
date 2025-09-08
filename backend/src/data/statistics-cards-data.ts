
import {
  BanknotesIcon,
  HomeModernIcon,
  ChartBarIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";


export const statisticsCardsData = [
  {
    color: "gray",
    icon: ChartBarIcon,
    title: "Bookings",
    value: "100",
    footer: {
      color: "tw-text-green-500",
      value: "+55%",
      label: "Alt Bilgi",
    },
  },
  {
    color: "gray",
    icon: ChartBarIcon,
    title: "Today's Users",
    value: "2,300",
    footer: {
      color: "tw-text-green-500",
      value: "+2%",
      label: "than last month",
    },
  },
  {
    color: "gray",
    icon: HomeModernIcon,
    title: "Revenue",
    value: "34k",
    footer: {
      color: "tw-text-green-500",
      value: "+1%",
      label: "than yesterday",
    },
  },
  {
    color: "gray",
    icon: UserPlusIcon,
    title: "Followers",
    value: "+91",
    footer: {
      label: " Just updated",
    },
  },
];

export default statisticsCardsData;
