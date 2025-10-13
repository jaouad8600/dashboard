import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseISO, isWithinInterval, startOfWeek, endOfWeek, endOfDay } from 'date-fns';

type PlanningItem = { id: string; title?: string; start?: string; end?: string; groupId?: string };

function getDB() {
  const p = join(process.cwd(), 'data', 'app-data.json');
  if (!existsSync(p)) return { planning: { items: [] as PlanningItem[] } };
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return { planning: { items: [] as PlanningItem[] } };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date'); // YYYY-MM-DD of ISO
  const db = getDB();
  let items: PlanningItem[] = Array.isArray(db?.planning?.items) ? db.planning.items : [];

  // verdedigend filteren
  items = items.filter(it => typeof it?.start === 'string' && it.start);

  if (dateStr) {
    const d = parseISO(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr);
    const start = startOfWeek(d, { weekStartsOn: 1 });
    const end = endOfWeek(d, { weekStartsOn: 1 });
    items = items.filter(it => {
      try {
        const s = parseISO(it.start!);
        return isWithinInterval(s, { start, end: endOfDay(end) });
      } catch {
        return false;
      }
    });
  }

  return NextResponse.json({ items }, { status: 200 });
}
