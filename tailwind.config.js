/** @type {import('tailwindcss').Config} */

import withMT from "@material-tailwind/react/utils/withMT";

export default withMT({
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/theme/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/widgets/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},},
  plugins: [],
  prefix: "tw-",
  safelist: [
    "tw-bg-gradient-to-br",
    "tw-from-gray-900",
    "tw-to-gray-700",
    "tw-from-blue-400",
    "tw-to-blue-600",
    "tw-from-green-400",
    "tw-to-green-600",
    "tw-from-orange-400",
    "tw-to-orange-600",
    "tw-from-red-400",
    "tw-to-red-600",
    "tw-from-pink-400",
    "tw-to-pink-600",
    "tw-from-blue-gray-900",
    "tw-to-blue-gray-700",
  ],
});
