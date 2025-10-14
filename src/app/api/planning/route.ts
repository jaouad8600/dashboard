import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseISO, isWithinInterval, startOfWeek, endOfWeek, endOfDay } from 'date-fns';

type PlanningItem = { id: string; title?: string; start?: string; end?: string; groupId?: string };

function getDB() {
  const p = join(process.cwd(), 'data', 'app-data.json');
  if (!existsSync(p)) return { planning: { items: [] as PlanningItem[] } };
  try { return JSON.parse(readFileSync(p, 'utf8')); }
  catch { return { planning: { items: [] as PlanningItem[] } }; }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date'); // optioneel
  const startStr = searchParams.get('start'); // ISO
  const endStr = searchParams.get('end');     // ISO

  const db = getDB();
  let items: PlanningItem[] = Array.isArray(db?.planning?.items) ? db.planning.items : [];
  // verdedigend: alleen items met geldige start-string
  items = items.filter((it: any) => {
  const val = typeof it?.start==='string' ? it.start : '';
  if(!val) return false;
  try {
    const s = (typeof parseISO!=='undefined' ? parseISO(val) : new Date(val));
    return isWithinInterval(s, { start: weekStart, end: weekEnd });
  } catch { return false; }
});

  // start/end (van FullCalendar) heeft voorrang
  if (startStr && endStr) {
    let start: Date, end: Date;
    try { start = parseISO(startStr); } catch { start = new Date(startStr); }
    try { end   = parseISO(endStr); }   catch { end   = new Date(endStr); }
    items = items.filter(it => {
      try { return isWithinInterval(parseISO(it.start!), { start, end: endOfDay(end) }); }
      catch { return false; }
    });
    return NextResponse.json({ items }, { status: 200 });
  }

  // fallback: ?date = willekeurige dag → filter op week ma–zo
  if (dateStr) {
    const d = parseISO(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr);
    const weekStart = startOfWeek(d, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(d, { weekStartsOn: 1 });
    items = items.filter((it: any) => {
  const val = typeof it?.start==='string' ? it.start : '';
  if(!val) return false;
  try {
    const s = (typeof parseISO!=='undefined' ? parseISO(val) : new Date(val));
    return isWithinInterval(s, { start: weekStart, end: weekEnd });
  } catch { return false; }
});
        return isWithinInterval(s, { start: weekStart, end: endOfDay(weekEnd) });
      } catch { return false; }
    });
  }

  return NextResponse.json({ items }, { status: 200 });
}
