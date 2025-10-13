import { NextResponse } from "next/server";
import { getRodeGroepen } from "@/server/store";
export async function GET() {
  const data = await getRodeGroepen();
  return NextResponse.json(data, { headers: { "cache-control": "no-store" } });
}
