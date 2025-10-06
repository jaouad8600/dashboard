import { NextResponse } from 'next/server';
import { readDB, writeDB, Indicatie } from '@/server/fsdb';
import { randomUUID } from 'crypto';

export async function GET() {
  const db = await readDB();
  return NextResponse.json({ data: db.indicaties }, { status: 200 });
}

export async function POST(req: Request) {
  const b = await req.json().catch(()=> ({}));
  const naam = (b?.naam ?? '').toString().trim();
  if (!naam) return NextResponse.json({ error: 'naam verplicht' }, { status: 400 });

  const now = new Date().toISOString();
  const item: Indicatie = {
    id: randomUUID(),
    naam,
    status: 'OPEN',
    inhoud: (b?.inhoud ?? '').toString(),
    createdAt: now,
    updatedAt: now,
  };
  const db = await readDB();
  db.indicaties.unshift(item);
  await writeDB(db);
  return NextResponse.json({ ok: true, data: item }, { status: 201 });
}
