import { NextResponse } from "next/server";
export async function GET(req: Request) {
  const name = process.env.AUTH_COOKIE_NAME ?? "sd_auth";
  const cookie = (req.headers.get("cookie") ?? "").includes(`${name}=1`);
  if (!cookie) return NextResponse.json({ authenticated:false }, { status: 401 });
  return NextResponse.json({ authenticated:true, user:{ email: process.env.ADMIN_EMAIL } });
}
