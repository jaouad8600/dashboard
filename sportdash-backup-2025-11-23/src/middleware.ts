import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const cookieName = process.env.AUTH_COOKIE_NAME ?? "sd_auth";
    const has = req.cookies.get(cookieName)?.value === "1";
    if (!has) return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
