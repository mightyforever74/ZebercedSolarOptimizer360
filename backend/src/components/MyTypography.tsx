// src/components/Typography.tsx

import React from "react";

type TypographyProps = {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  className?: string;
  href?: string;
  target?: string;
  variant?: string; // İleride stil vermek için
};

export function Typography({
  as: Component = "p",
  children,
  className = "",
  ...props
}: TypographyProps) {
  return <Component className={className} {...props}>{children}</Component>;
}
