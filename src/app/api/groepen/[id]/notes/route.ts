import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/server/fsdb';
import { randomUUID } from 'crypto';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json().catch(()=> ({}));
  const tekst = (b?.tekst ?? '').toString().trim();
  const auteur = (b?.auteur ?? '').toString().trim() || undefined;
  if (!tekst) return NextResponse.json({ error: 'tekst verplicht' }, { status: 400 });

  const db = await readDB();
  const g = db.groepen.list.find(x => x.id === params.id);
  if (!g) return NextResponse.json({ error: 'groep niet gevonden' }, { status: 404 });

  const note = { id: randomUUID(), tekst, auteur, createdAt: new Date().toISOString() };
  g.notities.unshift(note);
  await writeDB(db);
  return NextResponse.json({ ok: true, data: note }, { status: 201 });
}
