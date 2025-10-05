import { NextResponse } from "next/server";
import { loadGroepen } from "@/lib/fsdb";

export async function GET() {
  const rows = await loadGroepen();
  return NextResponse.json(rows.filter(g => g.kleur === "red"));
}
