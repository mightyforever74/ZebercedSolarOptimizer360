//C:\Projects\solar-optimizer360\src\widgets\layout\auth-footer.tsx
import React from "react";
import Footer from "@/widgets/layout/footer";

type PropTypes = {
  brandName?: string;
  brandLink?: string;
  routes?: { name: string; path: string }[];
  className?: string;
};

export function AuthFooter(props: PropTypes) {
  return <Footer {...props} />;
}

export default AuthFooter;
