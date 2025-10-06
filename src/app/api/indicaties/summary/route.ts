import { NextResponse } from "next/server";
import { readDB } from "@/lib/serverStore";

export async function GET() {
  const db = await readDB();
  const items = db.indicaties || [];
  const open = items.filter(i => (i.status||"").toLowerCase().includes("open")).length;
  const inBehandeling = items.filter(i => (i.status||"").toLowerCase().includes("behandel")).length;
  const afgerond = items.filter(i => (i.status||"").toLowerCase().includes("afgerond")).length;
  const totaal = items.length;
  return NextResponse.json({ open, inBehandeling, afgerond, totaal });
}
