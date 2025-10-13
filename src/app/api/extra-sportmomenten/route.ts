import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

const DB_PATH = 'data/app-data.json';

function ensureDb() {
  if (!existsSync('data')) mkdirSync('data');
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify({ groepen: [], planning: { items: [] }, extraSportmomenten: [], notities: {} }, null, 2));
  }
}
function readDb(): any {
  ensureDb();
  try {
    const raw = readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(raw || '{}');
    if (!Array.isArray(db.groepen)) db.groepen = [];
    if (!Array.isArray(db.extraSportmomenten)) db.extraSportmomenten = [];
    return db;
  } catch {
    return { groepen: [], extraSportmomenten: [] };
  }
}
function writeDb(db: any) { writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }
function genId(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function toYmd(d: string) { return (d||'').slice(0,10); }

export async function GET(req: NextRequest) {
  const db = readDb();
  const { searchParams } = new URL(req.url);
  const aggregate = searchParams.get('aggregate');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  let items = db.extraSportmomenten || [];

  if (start && end) {
    const s = toYmd(start), e = toYmd(end);
    items = items.filter((m: any) => {
      const d = toYmd(m?.datum || '');
      return d && d >= s && d <= e;
    });
  }

  if (!aggregate) {
    return NextResponse.json({ items });
  }

  // aggregate (optioneel binnen het filter-interval)
  const byGroup: Record<string, number> = {};
  for (const m of items) {
    if (!m || !m.groepId) continue;
    byGroup[m.groepId] = (byGroup[m.groepId] || 0) + 1;
  }
  const rows = (db.groepen || []).map((g: any) => ({
    groepId: g.id,
    groepNaam: g.naam || g.id,
    aantal: byGroup[g.id] || 0
  }));
  return NextResponse.json({ rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { groepId, datum, duurMinuten, reden, gebruiker } = body || {};
  if (!groepId) return NextResponse.json({ error: 'groepId is verplicht' }, { status: 400 });
  const db = readDb();
  const item = { id: genId(), groepId, datum: datum || new Date().toISOString(), duurMinuten: duurMinuten ?? 60, reden, gebruiker };
  db.extraSportmomenten.push(item);
  writeDb(db);
  return NextResponse.json(item, { status: 201 });
}

// DELETE ?id=...  of body: { id }
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id') || (await req.json().catch(() => ({}))).id;
  if (!id) return NextResponse.json({ error: 'id is verplicht' }, { status: 400 });
  const db = readDb();
  const before = db.extraSportmomenten.length;
  db.extraSportmomenten = db.extraSportmomenten.filter((it: any) => it.id !== id);
  writeDb(db);
  const deleted = before - db.extraSportmomenten.length;
  return NextResponse.json({ deleted });
}
