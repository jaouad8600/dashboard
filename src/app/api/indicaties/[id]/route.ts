import { NextResponse } from 'next/server';
import { readDB, writeDB, IndicatieStatus } from '@/server/fsdb';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json().catch(()=> ({}));
  const db = await readDB();
  const i = db.indicaties.findIndex(x => x.id === params.id);
  if (i === -1) return NextResponse.json({ error: 'indicatie niet gevonden' }, { status: 404 });

  if (typeof b?.naam === 'string') db.indicaties[i].naam = b.naam;
  if (typeof b?.inhoud === 'string') db.indicaties[i].inhoud = b.inhoud;
  if (b?.status) {
    const s = (b.status as string).toUpperCase() as IndicatieStatus;
    if (['OPEN','IN_BEHANDELING','AFGEROND'].includes(s)) db.indicaties[i].status = s;
  }
  db.indicaties[i].updatedAt = new Date().toISOString();
  await writeDB(db);
  return NextResponse.json({ ok: true, data: db.indicaties[i] }, { status: 200 });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const db = await readDB();
  const lenBefore = db.indicaties.length;
  db.indicaties = db.indicaties.filter(x => x.id !== params.id);
  if (db.indicaties.length === lenBefore) return NextResponse.json({ error: 'indicatie niet gevonden' }, { status: 404 });
  await writeDB(db);
  return NextResponse.json({ ok: true }, { status: 200 });
}
