import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseISO, isWithinInterval, endOfDay } from 'date-fns';

type SportItem = { id: string; groupId: string; date: string }; // date = 'YYYY-MM-DD'

const DB_PATH = join(process.cwd(), 'data', 'app-data.json');

function readDB() {
  if (!existsSync(DB_PATH)) return { sportmomenten: { items: [] as SportItem[] } };
  try { return JSON.parse(readFileSync(DB_PATH, 'utf8')); }
  catch { return { sportmomenten: { items: [] as SportItem[] } }; }
}
function writeDB(db: any) { writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8'); }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startStr = searchParams.get('start'); // ISO of YYYY-MM-DD
  const endStr = searchParams.get('end');     // ISO of YYYY-MM-DD

  const db = readDB();
  let items: SportItem[] = Array.isArray(db?.sportmomenten?.items) ? db.sportmomenten.items : [];
  items = items.filter(it => typeof it?.date === 'string' && it.date);

  if (startStr && endStr) {
    const start = parseISO(startStr.length === 10 ? `${startStr}T00:00:00` : startStr);
    const end = parseISO(endStr.length === 10 ? `${endStr}T00:00:00` : endStr);
    items = items.filter(it => {
      try {
        const d = parseISO(`${it.date}T00:00:00`);
        return isWithinInterval(d, { start, end: endOfDay(end) });
      } catch { return false; }
    });
  }

  return NextResponse.json({ items }, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { groupId, date } = body as { groupId?: string; date?: string };
  if (!groupId || !date) return NextResponse.json({ error: 'groupId en date vereist' }, { status: 400 });

  const db = readDB();
  db.sportmomenten = db.sportmomenten || { items: [] };
  db.sportmomenten.items = Array.isArray(db.sportmomenten.items) ? db.sportmomenten.items : [];

  const idx = db.sportmomenten.items.findIndex((x: SportItem) => x.groupId === groupId && x.date === date);
  if (idx >= 0) {
    // toggle uit
    db.sportmomenten.items.splice(idx, 1);
  } else {
    db.sportmomenten.items.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`, groupId, date });
  }
  writeDB(db);
  return NextResponse.json({ ok: true }, { status: 201 });
}
