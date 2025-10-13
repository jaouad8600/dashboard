import { NextResponse } from "next/server";
import { getIndicatiesSummary } from "@/server/store";
export async function GET() {
  const sum = await getIndicatiesSummary();
  return NextResponse.json(sum, { headers: { "cache-control": "no-store" } });
}
