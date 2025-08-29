// root/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIX = "/Hesaplama";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname.startsWith(PROTECTED_PREFIX)) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/signin/basic";
      url.search = `?next=${encodeURIComponent(pathname + (search || ""))}`;
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/Hesaplama/:path*"],
};
