import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/serverStore";

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const b = await req.json().catch(()=>({}));
  const db = await readDB();
  const it = (db.indicaties||[]).find(x=>x.id===params.id);
  if (!it) return NextResponse.json({ error:"not found" }, { status:404 });

  Object.assign(it, {
    naam: b.naam ?? it.naam,
    type: b.type ?? it.type,
    status: b.status ?? it.status,
    start: b.start ?? it.start,
    eind: b.eind ?? it.eind,
    opmerking: b.opmerking ?? it.opmerking,
  });
  await writeDB(db);
  return NextResponse.json(it);
}

export async function DELETE(_req: Request, { params }: { params: { id: string }}) {
  const db = await readDB();
  const before = (db.indicaties||[]).length;
  db.indicaties = (db.indicaties||[]).filter(x=>x.id!==params.id);
  if (db.indicaties.length === before) return NextResponse.json({ error:"not found" }, { status:404 });
  await writeDB(db);
  return NextResponse.json({ ok:true });
}
