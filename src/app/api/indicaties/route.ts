import { NextResponse } from "next/server";
import { listIndicaties, addIndicatie } from "@/server/store";

export async function GET() {
  const data = await listIndicaties();
  return NextResponse.json(data, { headers: { "cache-control": "no-store" } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const it = await addIndicatie(body);
    return NextResponse.json(it, { headers: { "cache-control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Kon niet toevoegen" },
      { status: 400 },
    );
  }
}
