export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { readDB } from "@/server/fsdb";

export async function GET() {
  const db = await readDB();
  const totaal = db.mutaties.length;
  // optioneel: tel 'open' per status
  const open = db.mutaties.filter((m: any) => m?.status === "OPEN").length;
  return NextResponse.json({ open, totaal });
}
