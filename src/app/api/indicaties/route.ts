import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/serverStore";

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.indicaties || []);
}

export async function POST(req: Request) {
  const b = await req.json().catch(()=>({}));
  if (!b.naam) return NextResponse.json({ error:"naam verplicht" }, { status:400 });
  const db = await readDB();
  const item = {
    id: crypto.randomUUID(),
    naam: String(b.naam),
    type: b.type ? String(b.type) : undefined,
    status: b.status ? String(b.status) : "Open",
    start: b.start ? String(b.start) : undefined,
    eind: b.eind ? String(b.eind) : undefined,
    opmerking: b.opmerking ? String(b.opmerking) : undefined,
  };
  db.indicaties.unshift(item);
  await writeDB(db);
  return NextResponse.json(item, { status:201 });
}
