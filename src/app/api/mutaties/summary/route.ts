import { NextResponse } from "next/server";
import { readDB } from "@/lib/serverStore";

export async function GET() {
  const db = await readDB();
  const lijst = db.mutaties || [];
  const totaal = lijst.length;
  // simpele categorisatie optioneel:
  const vandaag = new Date().toISOString().slice(0,10);
  const vandaagCount = lijst.filter(m => (m.datumISO||"").startsWith(vandaag)).length;
  return NextResponse.json({ totaal, vandaag: vandaagCount });
}
