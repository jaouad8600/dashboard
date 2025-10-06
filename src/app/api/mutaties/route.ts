import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/serverStore";

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.mutaties || []);
}

export async function POST(req: Request) {
  const b = await req.json().catch(()=>({}));
  if (!b.titel) return NextResponse.json({ error:"titel verplicht" }, { status:400 });
  const db = await readDB();
  const m = {
    id: crypto.randomUUID(),
    titel: String(b.titel),
    type: b.type ? String(b.type) : undefined,
    datumISO: b.datumISO ? String(b.datumISO) : new Date().toISOString(),
    groepId: b.groepId ? String(b.groepId) : undefined,
    details: b.details ? String(b.details) : undefined,
  };
  db.mutaties.unshift(m);
  await writeDB(db);
  return NextResponse.json(m, { status:201 });
}
