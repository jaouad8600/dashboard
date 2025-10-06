import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/server/fsdb';

export async function PATCH(req: Request, { params }: { params: { id: string, noteId: string } }) {
  const b = await req.json().catch(()=> ({}));
  const tekst = b?.tekst as string | undefined;
  const auteur = b?.auteur as string | undefined;

  const db = await readDB();
  const g = db.groepen.list.find(x => x.id === params.id);
  if (!g) return NextResponse.json({ error: 'groep niet gevonden' }, { status: 404 });
  const n = g.notities.find(x => x.id === params.noteId);
  if (!n) return NextResponse.json({ error: 'notitie niet gevonden' }, { status: 404 });

  if (typeof tekst === 'string') n.tekst = tekst;
  if (typeof auteur === 'string') n.auteur = auteur || undefined;
  await writeDB(db);
  return NextResponse.json({ ok: true, data: n }, { status: 200 });
}

export async function DELETE(_: Request, { params }: { params: { id: string, noteId: string } }) {
  const db = await readDB();
  const g = db.groepen.list.find(x => x.id === params.id);
  if (!g) return NextResponse.json({ error: 'groep niet gevonden' }, { status: 404 });
  const lenBefore = g.notities.length;
  g.notities = g.notities.filter(x => x.id !== params.noteId);
  if (g.notities.length === lenBefore) return NextResponse.json({ error: 'notitie niet gevonden' }, { status: 404 });
  await writeDB(db);
  return NextResponse.json({ ok: true }, { status: 200 });
}
