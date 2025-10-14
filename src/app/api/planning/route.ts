import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA = path.join(process.cwd(), 'data', 'app-data.json');

function readDB(): any {
  if (!fs.existsSync(DATA)) return { planning: { items: [] } };
  try {
    const j = JSON.parse(fs.readFileSync(DATA, 'utf8') || '{}');
    if (!j.planning || !Array.isArray(j.planning.items)) j.planning = { items: [] };
    return j;
  } catch {
    return { planning: { items: [] } };
  }
}

function toDateSafe(v: any): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startQ = searchParams.get('start'); // ISO string
  const endQ   = searchParams.get('end');   // ISO string
  const weekQ  = searchParams.get('date');  // YYYY-MM-DD -> filter whole week (Mon-Sun)

  let items: any[] = readDB().planning.items;

  try {
    if (weekQ && !startQ && !endQ) {
      const d = toDateSafe(weekQ);
      if (d) {
        const day = d.getDay(); // 0=Sun..6=Sat
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((day + 6) % 7));
        monday.setHours(0,0,0,0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23,59,59,999);

        items = items.filter((it: any) => {
          const s = toDateSafe(it?.start);
          return !!(s && s >= monday && s <= sunday);
        });
      }
    } else if (startQ && endQ) {
      const s = toDateSafe(startQ);
      const e = toDateSafe(endQ);
      if (s && e) {
        items = items.filter((it: any) => {
          const si = toDateSafe(it?.start);
          return !!(si && si >= s && si <= e);
        });
      }
    }
  } catch {
    // swallow filter errors; return unfiltered list
  }

  return NextResponse.json({ items }, { status: 200 });
}
