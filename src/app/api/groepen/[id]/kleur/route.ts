import { NextResponse } from 'next/server';
import { readDB, writeDB, Kleur } from '@/server/fsdb';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(()=> ({}));
  const kleur = body?.kleur as Kleur | undefined;
  if (!kleur) return NextResponse.json({ error: 'kleur verplicht' }, { status: 400 });

  const db = await readDB();
  const i = db.groepen.list.findIndex(g => g.id === params.id);
  if (i === -1) return NextResponse.json({ error: 'groep niet gevonden' }, { status: 404 });

  db.groepen.list[i].kleur = kleur;
  await writeDB(db);
  return NextResponse.json({ ok: true, data: db.groepen.list[i] }, { status: 200 });
}
