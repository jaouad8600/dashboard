export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { readDB } from "@/server/fsdb";

export async function GET() {
  const db = await readDB();
  const totaal = db.indicaties.length;
  const open = db.indicaties.filter((i: any) => i?.status === "OPEN").length;
  const inBehandeling = db.indicaties.filter((i: any) => i?.status === "BUSY").length;
  const afgerond = db.indicaties.filter((i: any) => i?.status === "DONE").length;
  return NextResponse.json({ open, inBehandeling, afgerond, totaal });
}
