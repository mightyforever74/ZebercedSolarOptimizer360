// src/routes.jsx
import { Avatar, Typography } from "@material-tailwind/react";

import {
  Squares2X2Icon,
  ShoppingBagIcon,
  ClipboardDocumentIcon,
  PhotoIcon,
  ClipboardIcon,
  RectangleGroupIcon,
  CubeTransparentIcon,
  CameraIcon,
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";

const icon = {
  className: "tw-w-5 tw-h-5 tw-text-inherit",
};

const text = {
  color: "inherit",
  className: "tw-w-5 tw-grid place-items-center !tw-font-medium",
};

export const accountHeader = ({
  isMenuOpen,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => (
  <li
    className="tw-flex tw-justify-between tw-cursor-pointer tw-items-center tw-gap-2 tw-py-2 !tw-font-medium lg:tw-text-white tw-text-gray-900 hover:tw-bg-transparent"
    onClick={() => setIsMobileMenuOpen((cur) => !cur)}
  >
    Hesap Ayarları
    <ChevronDownIcon
      strokeWidth={2.5}
      className={`tw-hidden tw-h-3 tw-w-3 tw-transition-transform lg:tw-block ${
        isMenuOpen ? "tw-rotate-180" : ""
      }`}
    />
    <ChevronDownIcon
      strokeWidth={2.5}
      className={`tw-block tw-h-3 tw-w-3 tw-transition-transform lg:tw-hidden ${
        isMobileMenuOpen ? "tw-rotate-180" : ""
      }`}
    />
  </li>
);

export const routes = [
  {
    name: "Panel Asistanı",
    divider: true,
    icon: <Squares2X2Icon {...icon} />,
    pages: [
      { type: "header", render: accountHeader },
      {
        icon: <Typography {...text}></Typography>,
        name: "Çatınıza Panel Yerleştirin",
        path: "/Hesaplama/panel-asistani",
      },
    ],
  },
  {
    name: "Drone Yönetimi",
    title: "Drone İşlemleri",
    divider: true,
    icon: <CameraIcon {...icon} />,
    path: "/pages/pricing-page",
    pages: [
      {
        icon: <Typography {...text}></Typography>,
        name: "Drone İle Çatı Ölçümü",
        path: "/pages/pricing-page",
      },
    ],
  },

  
];
export default routes;


