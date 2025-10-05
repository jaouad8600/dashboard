import { NextResponse } from "next/server";
import { loadGroepen } from "@/lib/fsdb";

export async function GET() {
  const rows = await loadGroepen();
  // Sorteer op naam voor consistentie
  rows.sort((a,b)=>a.naam.localeCompare(b.naam,"nl"));
  return NextResponse.json(rows);
}
