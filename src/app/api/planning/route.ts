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
  } catch { return { planning: { items: [] } }; }
}

function safeDate(v: any): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startQ = searchParams.get('start');
  const endQ   = searchParams.get('end');
  const dateQ  = searchParams.get('date'); // YYYY-MM-DD

  let items: any[] = readDB().planning.items;

  try {
    if (dateQ && !startQ && !endQ) {
      const d = safeDate(dateQ);
      if (d) {
        const day = d.getDay(); // 0..6
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((day + 6) % 7));
        monday.setHours(0,0,0,0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23,59,59,999);
        items = items.filter((it: any) => {
          const s = safeDate(it?.start);
          return !!(s && s >= monday && s <= sunday);
        });
      }
    } else if (startQ && endQ) {
      const s = safeDate(startQ);
      const e = safeDate(endQ);
      if (s && e) {
        items = items.filter((it: any) => {
          const si = safeDate(it?.start);
          return !!(si && si >= s && si <= e);
        });
      }
    }
  } catch { /* bij fout: ongewijzigde lijst terug */ }

  return NextResponse.json({ items }, { status: 200 });
}
