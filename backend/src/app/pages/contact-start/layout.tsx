import React from "react";

export const metadata = {
  title: "Bize Ulaşın — Drone Randevusu | Solar Optimizer 360",
  description: "Proje adı, e-posta, konu ve mesajınızı gönderin. Ekip en kısa sürede dönüş yapar.",
  alternates: { canonical: "/pages/contact-start" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
