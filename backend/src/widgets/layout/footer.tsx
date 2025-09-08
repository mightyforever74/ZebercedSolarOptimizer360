import React from "react";

// @material-tailwind/react
import { Typography } from "@material-tailwind/react";

type PropTypes = {
  brandName?: string;
  brandLink?: string;
  routes?: { name: string; path: string }[];
  className?: string; // +++
};

export function Footer({
  brandName = "Zeberced Mühendislik",
  brandLink = "https://www.zebercedmuhendislik.com",
  routes = [    
    {
      name: "Hakkımızda",
      path: "https://www.zebercedmuhendislik.com/about",
    },
    { name: "Blog", path: "https://www.zebercedmuhendislik.com/contact" },
    { name: "Lisans", path: "https://www.zebercedmuhendislik.com/project" },
  ],
  className = "", // +++
}: PropTypes) {
  const year = new Date().getFullYear();

  return (
    <footer className={`tw-py-2 ${className}`}>
      {" "}
      {/* +++ */}
      <div className="tw-flex tw-w-full tw-flex-wrap tw-items-center tw-justify-center tw-gap-6 tw-px-2 md:tw-justify-between">
        <Typography variant="small" className="!tw-font-normal tw-text-inherit">
          &copy; {year}, {" "}
          <img
            src="/img/zebercedlogo.jpg"
            alt="Zeberced Mühendislik Logo"
            className="-tw-mt-1 tw-inline-block tw-h-10 tw-w-10 tw-text-gray-900"
          />{" "}
          <a
            href={brandLink}
            target="_blank"
            className="tw-transition-colors  tw-text-green-900 hover:tw-text-red-900 !tw-font-bold"
          >
            {brandName}
          </a>{" "}
          daha iyi bir dünya için.
        </Typography>
        <ul className="tw-flex tw-items-center tw-gap-4">
          {routes.map(({ name, path }: { name: string; path: string }) => (
            <li key={name}>
              <Typography
                as="a"
                href={path}
                target="_blank"
                variant="small"
                className="tw-py-0.5 tw-px-1 !tw-font-normal tw-text-inherit tw-transition-colors hover:tw-text-blue-gray-900"
              >
                {name}
              </Typography>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
