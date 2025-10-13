import { NextResponse } from 'next/server';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

type Entry = {
  id: string;
  groepId: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
};

const DB = join(process.cwd(), 'data', 'app-data.json');

function readDB() {
  if (!existsSync(DB)) return { sportmomenten: { items: [] }, groepen: { items: [] } };
  try { return JSON.parse(readFileSync(DB, 'utf8')); }
  catch { return { sportmomenten: { items: [] }, groepen: { items: [] } }; }
}
function writeDB(db: any) {
  writeFileSync(DB, JSON.stringify(db, null, 2), 'utf8');
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const start = url.searchParams.get('start'); // YYYY-MM-DD (optioneel)
  const end = url.searchParams.get('end');     // YYYY-MM-DD (optioneel)

  const db = readDB();
  const items: Entry[] = Array.isArray(db?.sportmomenten?.items) ? db.sportmomenten.items : [];

  // Aggregate count per groepId+date
  const key = (g: string, d: string) => `${g}|${d}`;
  const counts: Record<string, number> = {};
  for (const it of items) {
    if (!it?.groepId || !it?.date) continue;
    if (start && it.date < start) continue;
    if (end && it.date > end) continue;
    counts[key(it.groepId, it.date)] = (counts[key(it.groepId, it.date)] || 0) + 1;
  }
  return NextResponse.json({ counts }, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(()=>null) as { groepId?: string; date?: string; delta?: number };
  if (!body?.groepId || !body?.date) {
    return NextResponse.json({ error: 'groepId en date verplicht' }, { status: 400 });
  }
  const delta = Number.isFinite(body.delta) ? Math.trunc(Number(body.delta)) : 1;

  const db = readDB();
  db.sportmomenten = db.sportmomenten || { items: [] };
  db.sportmomenten.items = Array.isArray(db.sportmomenten.items) ? db.sportmomenten.items : [];

  if (delta > 0) {
    for (let i=0;i<delta;i++){
      (db.sportmomenten.items as Entry[]).push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
        groepId: body.groepId!,
        date: body.date!,
        createdAt: new Date().toISOString(),
      });
    }
  } else if (delta < 0) {
    let need = Math.abs(delta);
    db.sportmomenten.items = (db.sportmomenten.items as Entry[]).filter((e:Entry)=>{
      if (need>0 && e.groepId===body.groepId && e.date===body.date) { need--; return false; }
      return true;
    });
  }

  writeDB(db);

  // return new count for that cell
  const count = (db.sportmomenten.items as Entry[]).filter((e:Entry)=>e.groepId===body.groepId && e.date===body.date).length;
  return NextResponse.json({ ok: true, count }, { status: 201 });
}
