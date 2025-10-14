import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseISO, isWithinInterval, startOfWeek, endOfWeek, endOfDay } from 'date-fns';

type PlanningItem = {
  id: string;
  title: string;
  start: string;   // ISO string (YYYY-MM-DD of YYYY-MM-DDTHH:mm)
  end?: string;    // ISO string
  allDay?: boolean;
  groepId?: string;
};

const DATA = path.join(process.cwd(), 'data', 'app-data.json');

function readDB(): any {
  if (!fs.existsSync(DATA)) return { planning: { items: [] } };
  try {
    const raw = fs.readFileSync(DATA, 'utf8') || '{}';
    const db = JSON.parse(raw);
    if (!db.planning || !Array.isArray(db.planning.items)) {
      db.planning = { items: [] };
    }
    return db;
  } catch {
    return { planning: { items: [] } };
  }
}

function writeDB(db: any) {
  fs.writeFileSync(DATA, JSON.stringify(db, null, 2));
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function safeParseISO(s?: string | null): Date | null {
  if (!s || typeof s !== 'string') return null;
  try { return parseISO(s); } catch { return null; }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qDate = url.searchParams.get('date');   // YYYY-MM-DD -> weekfilter (ma-zo)
  const qStart = url.searchParams.get('start'); // ISO
  const qEnd   = url.searchParams.get('end');   // ISO

  const db = readDB();
  let items: PlanningItem[] = Array.isArray(db.planning?.items) ? db.planning.items : [];

  // bereikfilter (voorrang)
  if (qStart && qEnd) {
    const s = safeParseISO(qStart);
    const e = safeParseISO(qEnd);
    if (s && e) {
      items = items.filter((it) => {
        const d = safeParseISO(it.start);
        return !!(d && isWithinInterval(d, { start: s, end: e }));
      });
    }
  } else if (qDate) {
    const d = safeParseISO(qDate);
    if (d) {
      const weekStart = startOfWeek(d, { weekStartsOn: 1 });
      const weekEnd   = endOfDay(endOfWeek(d, { weekStartsOn: 1 }));
      items = items.filter((it) => {
        const s = safeParseISO(it.start);
        return !!(s && isWithinInterval(s, { start: weekStart, end: weekEnd }));
      });
    }
  }

  return NextResponse.json({ items }, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Partial<PlanningItem>));
  const title = String(body.title ?? '').trim();
  const start = String(body.start ?? '').trim();

  if (!start) {
    return NextResponse.json({ error: 'start (ISO) is verplicht' }, { status: 400 });
  }

  const item: PlanningItem = {
    id: uid(),
    title: title || 'Item',
    start,
    end: body.end ? String(body.end) : undefined,
    allDay: Boolean(body.allDay),
    groepId: body.groepId ? String(body.groepId) : undefined,
  };

  const db = readDB();
  db.planning.items.push(item);
  writeDB(db);

  return NextResponse.json({ item }, { status: 201 });
}
