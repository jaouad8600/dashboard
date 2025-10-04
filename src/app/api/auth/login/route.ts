import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { email, password } = await req.json();
  const ok = email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
  if (!ok) return NextResponse.json({ ok:false, error:"Invalid credentials" }, { status: 401 });
  const res = NextResponse.json({ ok:true, user:{ email } });
  res.cookies.set(process.env.AUTH_COOKIE_NAME ?? "sd_auth", "1", { httpOnly:true, sameSite:"lax", path:"/", maxAge:60*60*8 });
  return res;
}
