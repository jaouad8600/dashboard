import { NextResponse } from "next/server";
import { getMutatiesSummary } from "@/server/store";
export async function GET() {
  const sum = await getMutatiesSummary();
  return NextResponse.json(sum, { headers:{ 'cache-control':'no-store' }});
}
