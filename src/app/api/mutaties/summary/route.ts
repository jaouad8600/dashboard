export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { listMutaties } from "@/lib/mutaties.store";

export async function GET() {
  const all = await listMutaties();
  const open = all.filter(m => m.status === "Open").length;
  const inBehandeling = all.filter(m => m.status === "In behandeling").length;
  const afgerond = all.filter(m => m.status === "Afgerond").length;
  const totaal = all.length;
  const laatste = all.slice(0, 5); // voor dashboard lijstje
  return NextResponse.json({ open, inBehandeling, afgerond, totaal, laatste });
}
