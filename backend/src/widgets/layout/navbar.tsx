"use client";
import React from "react";
import type { ReactNode } from "react";
import routes from "@/routes";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

// @material-tailwind/react
import {
  Navbar as MTNavbar,
  Collapse,
  Typography,
  IconButton,
  List,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";

// @heroicons/react
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardIcon,
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/solid";
import { ChartBarSquareIcon } from "@heroicons/react/24/outline";

// SADECE sayfa menüleri (User YOK)
const pagesMenuItems = [ 
  {
    title: "Panel Asistanı",
    description:
      "Yapay zeka destekli solar panel hesaplama algoritmalarımızı keşfedin.",
    icon: ChartBarSquareIcon,
    path: "/Hesaplama/panel-asistani",
  },
];

function PagesMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const router = useRouter();

  const renderItems = pagesMenuItems.map(
    ({ icon: Icon, title, description, path }, key) => (
      <MenuItem
        key={key}
        className="tw-flex tw-items-center tw-gap-3 tw-rounded-lg"
        onClick={() => router.push(path)}
      >
        <div className="tw-flex tw-items-center tw-justify-center tw-rounded-lg !tw-bg-blue-gray-50 tw-p-2">
          <Icon className="tw-h-6 tw-w-6 tw-text-gray-900 tw-stroke-2" />
        </div>
        <div>
          <Typography
            variant="h6"
            color="blue-gray"
            className="tw-flex tw-items-center tw-text-sm !tw-font-bold"
          >
            {title}
          </Typography>
          <Typography
            variant="paragraph"
            className="tw-text-xs !tw-font-medium !tw-text-blue-gray-500"
          >
            {description}
          </Typography>
        </div>
      </MenuItem>
    )
  );

  return (
    <>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        placement="bottom"
        allowHover
      >
        <MenuHandler>
          <Typography
            as="div"
            variant="small"
            className="!tw-font-medium lg:tw-text-white tw-text-gray-900 lg:tw-w-max tw-w-full"
          >
            <li
              className="tw-w-full tw-justify-between tw-flex cursor-pointer tw-items-center tw-gap-2 tw-py-2 !tw-font-medium hover:tw-bg-transparent"
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              Pages
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
          </Typography>
        </MenuHandler>
        <MenuList className="tw-hidden tw-max-w-screen-xl tw-rounded-xl lg:tw-block">
          <ul className="tw-grid tw-grid-cols-3 tw-gap-y-2 tw-outline-none tw-outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <div className="tw-block lg:tw-hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </>
  );
}

// Auth menüsü: cookie'den me → email + Çıkış (ya da giriş/kayıt/reset)
export function AuthMenu() {
  const [user, setUser] = React.useState<{
    email: string;
    role?: string;
  } | null>(null);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const search = useSearchParams();

  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch("http://localhost:5005/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (r.status === 200) {
          const j = await r.json();
          setUser(j.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    })();
  }, []);

  const logout = async () => {
    try {
      await fetch("http://localhost:5005/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      try {
        localStorage.removeItem("jwt");
      } catch {}
      const here =
        pathname + (search?.toString() ? `?${search!.toString()}` : "");
      if (here.startsWith("/Hesaplama")) {
        router.replace(`/auth/signin/basic?next=${encodeURIComponent(here)}`);
      } else {
        router.replace("/dashboard/analytics");
      }
      router.refresh();
    } catch {
      router.replace("/auth/signin/basic");
    }
  };

  if (!user) {
    // Girişsiz menü (Giriş/Kayıt/Reset)
    const loggedOut = (
      <div>
        <MenuItem
          className="tw-flex tw-items-center tw-gap-2"
          onClick={() => router.push("/auth/signin/basic")}
        >
          <ArrowRightOnRectangleIcon className="tw-h-4 tw-w-4 tw-text-gray-900" />
          Kullanıcı Girişi
        </MenuItem>
        <MenuItem
          className="tw-flex tw-items-center tw-gap-2"
          onClick={() => router.push("/auth/signup/basic-signup")}
        >
          <ClipboardIcon className="tw-h-4 tw-w-4 tw-text-gray-900" />
          Kayıt Olun
        </MenuItem>
        <MenuItem
          className="tw-flex tw-items-center tw-gap-2"
          onClick={() => router.push("/auth/reset/basic-reset")}
        >
          <ArrowPathIcon className="tw-h-4 tw-w-4 tw-text-gray-900" />
          Şifreyi Yenileme
        </MenuItem>
      </div>
    );
    return (
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        placement="bottom"
        allowHover
      >
        <MenuHandler>
          <Typography
            as="div"
            variant="small"
            className="tw-font-medium lg:tw-w-max tw-w-full"
          >
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
          </Typography>
        </MenuHandler>
        <MenuList className="tw-rounded-xl tw-hidden lg:tw-block">
          {loggedOut}
        </MenuList>
      </Menu>
    );
  }

  // Girişli menü (email + Çıkış)
  const loggedIn = (
    <div>
      <MenuItem className="tw-flex tw-items-center tw-gap-2 tw-cursor-default">
        <span className="tw-text-xs tw-rounded-full tw-bg-blue-gray-100 tw-text-blue-gray-700 tw-px-2 tw-py-[2px]">
          {user.email}
        </span>
      </MenuItem>
      <MenuItem
        onClick={logout}
        className="tw-text-sm tw-text-red-600 hover:tw-bg-red-50"
      >
        Çıkış
      </MenuItem>
    </div>
  );

  return (
    <Menu
      open={isMenuOpen}
      handler={setIsMenuOpen}
      placement="bottom"
      allowHover
    >
      <MenuHandler>
        <Typography
          as="div"
          variant="small"
          className="tw-font-medium lg:tw-w-max tw-w-full"
        >
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
        </Typography>
      </MenuHandler>
      <MenuList className="tw-rounded-xl tw-hidden lg:tw-block">
        {loggedIn}
      </MenuList>
    </Menu>
  );
}

function NavList() {
  return (
    <List className="tw-mt-4 tw-mb-6 tw-p-0 lg:tw-mt-0 lg:tw-mb-0 lg:tw-flex-row lg:tw-p-1 lg:tw-gap-6">
      <PagesMenu />
            <AuthMenu />
            <div className="lg:tw-hidden">
              <AuthMenu />
            </div>
    </List>
  );
}

export function Navbar() {
  const [openNav, setOpenNav] = React.useState(false);
  React.useEffect(() => {
    const h = () => window.innerWidth >= 960 && setOpenNav(false);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  return (
    <MTNavbar color="transparent" shadow={false} className="tw-absolute">
      <div className="tw-flex tw-items-center tw-justify-between">
        <Typography
          as={Link}
          href="/dashboard/analytics"
          variant="h6"
          className="tw-cursor-pointer tw-py-1.5"
        >
          Solar Optimizer 360
        </Typography>
        <div className="tw-hidden lg:tw-block">
          <NavList />
        </div>
        <IconButton
          variant="text"
          color="white"
          className="lg:tw-hidden"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon className="tw-h-6 tw-w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="tw-h-6 tw-w-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>
      <Collapse open={openNav}>
        <div className="tw-container tw-mx-auto tw-rounded-lg tw-bg-white tw-px-6 tw-pt-1 tw-pb-5">
          <NavList />
        </div>
      </Collapse>
    </MTNavbar>
  );
}

type MenuCtx = {
  isMenuOpen: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (fn: (cur: boolean) => boolean) => void;
};

type HeaderItem = {
  type: "header";
  render: (args: MenuCtx) => React.ReactNode;
};

type LinkItem = {
  icon?: React.ReactNode;
  name: string;
  path: string;
};

type RouteItem = HeaderItem | LinkItem;

type RouteSection = {
  name: string;
  pages: RouteItem[];
};
export function PagesOf(section: RouteSection, ctx: MenuCtx) {
  const router = useRouter();
  const { isMenuOpen, isMobileMenuOpen, setIsMobileMenuOpen } = ctx;

  return section.pages.map((item: RouteItem, idx: number) => {
    // header satırı
    if ("type" in item && item.type === "header" && typeof item.render === "function") {
      return (
        <React.Fragment key={`hdr-${idx}`}>
          {item.render({ isMenuOpen, isMobileMenuOpen, setIsMobileMenuOpen })}
        </React.Fragment>
      );
    }

    // normal link satırı
    const link = item as LinkItem;
    return (
      <MenuItem key={link.path} onClick={() => router.push(link.path!)}>
        {link.icon}
        <span>{link.name}</span>
      </MenuItem>
    );
  });
}

