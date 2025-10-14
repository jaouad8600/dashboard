import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type Sportmoment = { id: string; groepId: string; datum: string; aanwezig: boolean };

const DATA = path.join(process.cwd(), 'data', 'app-data.json');

function readDB(): any {
  if (!fs.existsSync(DATA)) return { sportmomenten: { items: [] } };
  try {
    const j = JSON.parse(fs.readFileSync(DATA, 'utf8') || '{}');
    if (!j.sportmomenten || !Array.isArray(j.sportmomenten.items)) j.sportmomenten = { items: [] };
    return j;
  } catch {
    return { sportmomenten: { items: [] } };
  }
}
function writeDB(db: any) { fs.writeFileSync(DATA, JSON.stringify(db, null, 2)); }

function iso(d: Date): string {
  const p=(n:number)=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ws = searchParams.get('weekStart'); // YYYY-MM-DD
  const days = Number(searchParams.get('days') || 7);
  const db = readDB();

  let items: Sportmoment[] = db.sportmomenten.items;

  if (ws) {
    const start = new Date(ws);
    if (!isNaN(start.getTime())) {
      const end = new Date(start);
      end.setDate(start.getDate() + (isFinite(days) ? days : 7) - 1);
      items = items.filter(i => {
        const d = new Date(i.datum);
        return !isNaN(d.getTime()) && d >= start && d <= end;
      });
    }
  }

  return NextResponse.json({ items }, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(()=>null) as Partial<Sportmoment>;
  const groepId = String(body?.groepId || '').trim();
  const datumIn = String(body?.datum || '').trim();
  const aanwezig = Boolean(body?.aanwezig);

  if (!groepId || !datumIn) {
    return NextResponse.json({ error: 'groepId en datum zijn verplicht' }, { status: 400 });
  }

  const d = new Date(datumIn);
  if (isNaN(d.getTime())) {
    return NextResponse.json({ error: 'Ongeldige datum' }, { status: 400 });
  }
  const datum = iso(d);

  const db = readDB();
  const list: Sportmoment[] = db.sportmomenten.items;

  const idx = list.findIndex(x => x.groepId === groepId && x.datum === datum);

  if (!aanwezig) {
    // if turning OFF: remove record when exists
    if (idx >= 0) list.splice(idx, 1);
    writeDB(db);
    return NextResponse.json({ ok: true, removed: true }, { status: 200 });
  }

  if (idx >= 0) {
    list[idx].aanwezig = true;
  } else {
    list.push({ id: Date.now().toString(36), groepId, datum, aanwezig: true });
  }
  writeDB(db);
  return NextResponse.json({ ok: true }, { status: 201 });
}
