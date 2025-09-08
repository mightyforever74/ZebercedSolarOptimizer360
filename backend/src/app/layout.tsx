// src/app/layout.tsx
import React from "react";
import Script from "next/script";
import { Roboto } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; // ✅ yeni client provider

// ---- Metadata (App Router) ----
export const metadata = {
  metadataBase: new URL("https://solaroptimizer360.com"),
  title: {
    default: "Solar Optimizer 360 — Çatı GES Tasarımı ve Keşif",
    template: "%s | Solar Optimizer 360",
  },
  description:
    "Solar Optimizer 360 ile çatı GES projelerinizi hesaplayın, panel yerleşimini optimize edin ve keşif randevusu alın.",
  keywords: [
    "güneş paneli",
    "çatı ges",
    "fotovoltaik",
    "solar",
    "panel yerleşimi",
    "drone keşif",
    "enerji verimliliği",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://solaroptimizer360.com/",
    title: "Solar Optimizer 360 — Çatı GES Tasarımı",
    description:
      "Girdi → hesapla → en uygun panel dizilimi. Keşif randevusu için bize ulaşın.",
    siteName: "Solar Optimizer 360",
    images: [{ url: "/og-cover.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@solaroptimizer360",
    title: "Solar Optimizer 360",
    description: "Çatı GES için hızlı hesap ve yerleşim optimizasyonu.",
    images: ["/og-cover.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: { index: true, follow: true },
};

// ---- Font ----
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

// ---- Analytics toggle ----
const isProd = process.env.NODE_ENV === "production";
const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS
  ? process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "1"
  : isProd;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        {/* Font Awesome (CDN) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
          integrity="sha512-xh6O/CkQoPOWDdYTDqeRdPCVd1Sp1XU9e3rFq5x2JQz6Q3cQ9cG1Hq1yqD5hN1V6AbC3tpjKQfYb5B9QfXgX7Q=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        {ENABLE_ANALYTICS && (
          <Script
            id="nepcha"
            strategy="afterInteractive"
            data-site="solaroptimizer360.com"
            src="https://api.nepcha.com/js/nepcha-analytics.js"
          />
        )}

        {/* SoftwareApplication JSON-LD */}
        <Script
          id="software-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "SolarOptimizer360",
              alternateName: "Solar Optimizer 360",
              applicationCategory: "WebApplication",
              operatingSystem: "Web",
              url: "https://solaroptimizer360.com",
              inLanguage: "tr",
              description:
                "Çatılardaki engellere göre yapay zekâ destekli en uygun güneş paneli yerleşimini hesaplar ve SVG ile görselleştirir.",
              featureList: [
                "AI-powered panel placement algorithm",
                "Obstacle-aware layout ve çakışma kontrolü",
                "SVG-based rooftop layout visualization",
                "Session tracking via LocalStorage",
                "Outdated obstacle auto-clearing",
              ],
              publisher: {
                "@type": "Organization",
                name: "Solar Optimizer 360",
              },
            }),
          }}
        />
      </head>
      <body className={roboto.className}>
        {/* Tüm Client provider’lar artık tek yerde, client tarafında çalışıyor */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
