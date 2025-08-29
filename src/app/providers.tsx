// src/app/providers.tsx
"use client";

import React from "react";
import ThemeProvider from "@/components/ThemeProvider";
import theme from "@/theme";
import { MaterialTailwindControllerProvider } from "@/context";

export default function Providers({ children }: { children: React.ReactNode }) {
  // NOT: theme içindeki prevArrow/nextArrow/navigation gibi fonksiyonlar
  // artık client tarafında oluşturuluyor ve client provider'a veriliyor.
  return (
    <ThemeProvider value={theme}>
      <MaterialTailwindControllerProvider>
        {children}
      </MaterialTailwindControllerProvider>
    </ThemeProvider>
  );
}
