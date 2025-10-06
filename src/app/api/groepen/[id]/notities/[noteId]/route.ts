import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/serverStore";

export async function PATCH(req: Request, { params }: { params: { id: string, noteId: string }}) {
  const { tekst, auteur } = await req.json().catch(()=>({}));
  const db = await readDB();
  const g = db.groepen.find(x => x.id === params.id);
  if (!g) return NextResponse.json({ error:"groep not found" }, { status:404 });
  const n = g.notities.find(x => x.id === params.noteId);
  if (!n) return NextResponse.json({ error:"note not found" }, { status:404 });

  if (typeof tekst === "string") n.tekst = tekst;
  if (typeof auteur === "string") n.auteur = auteur;
  await writeDB(db);
  return NextResponse.json(n);
}

export async function DELETE(_req: Request, { params }: { params: { id: string, noteId: string }}) {
  const db = await readDB();
  const g = db.groepen.find(x => x.id === params.id);
  if (!g) return NextResponse.json({ error:"groep not found" }, { status:404 });
  const before = g.notities.length;
  g.notities = g.notities.filter(n => n.id !== params.noteId);
  if (g.notities.length === before) return NextResponse.json({ error:"note not found" }, { status:404 });
  await writeDB(db);
  return NextResponse.json({ ok:true });
}
