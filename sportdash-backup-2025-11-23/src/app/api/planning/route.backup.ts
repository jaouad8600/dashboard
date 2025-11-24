import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseISO, isValid, addMinutes, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');

type PlanningItem = {
  id: string;
  groepId?: string;
  groupId?: string;
  title?: string;
  start: string;
  end?: string;
  durationMin?: number;
  color?: string;
};

function readDB(){
  try { return JSON.parse(fs.readFileSync(DB_PATH,'utf8')); }
  catch { return { groepen: [], planning: { items: [] } }; }
}
function writeDB(db:any){ fs.writeFileSync(DB_PATH, JSON.stringify(db,null,2)); }

function normalize(items:any[]):PlanningItem[] {
  const out:PlanningItem[] = [];
  for (const raw of items||[]) {
    if(!raw || typeof raw.start!=='string') continue;
    let s:Date; try { s = parseISO(raw.start); } catch { continue; }
    if(!isValid(s)) continue;
    let e:Date|undefined;
    if (typeof raw.end==='string') {
      try { const tmp = parseISO(raw.end); if(isValid(tmp)) e = tmp; } catch {}
    }
    if(!e) e = addMinutes(s, Number(raw.durationMin||60));
    out.push({
      id: String(raw.id || `${s.getTime()}-${Math.random().toString(36).slice(2,8)}`),
      groepId: raw.groepId || raw.groupId,
      groupId: raw.groupId || raw.groepId,
      title: raw.title || 'Sportmoment',
      start: s.toISOString(),
      end: e.toISOString(),
      color: raw.color || raw.kleurHex
    });
  }
  return out;
}

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');
  const db = readDB();
  db.planning = db.planning || {}; db.planning.items = db.planning.items || [];
  const normalized = normalize(db.planning.items);
  if (normalized.length !== db.planning.items.length) { db.planning.items = normalized; writeDB(db); }
  let items = normalized;

  if (dateParam) {
    let d:Date; try { d = parseISO(dateParam); } catch { d = new Date(); }
    if (!isValid(d)) d = new Date();
    const start = startOfWeek(d, { weekStartsOn: 1 });
    const end = endOfWeek(d, { weekStartsOn: 1 });
    items = items.filter(it => {
      try { return isWithinInterval(parseISO(it.start), { start, end }); }
      catch { return false; }
    });
  }
  return NextResponse.json({ items });
}

export async function POST(req: Request){
  const body = await req.json().catch(()=> ({}));
  if (!body?.start || typeof body.start !== 'string') {
    return NextResponse.json({ error: 'start (ISO) verplicht' }, { status: 400 });
  }
  let s:Date; try { s = parseISO(body.start); } catch { return NextResponse.json({ error:'Ongeldige start' }, { status:400 }); }
  if (!isValid(s)) return NextResponse.json({ error:'Ongeldige start' }, { status:400 });

  const e = body.end && typeof body.end==='string' && isValid(parseISO(body.end))
    ? parseISO(body.end)
    : addMinutes(s, Number(body.durationMin||60));

  const db = readDB();
  db.planning = db.planning || {}; db.planning.items = db.planning.items || [];
  const item:PlanningItem = {
    id: String(body.id || `${s.getTime()}-${Math.random().toString(36).slice(2,8)}`),
    groepId: body.groepId || body.groupId,
    groupId: body.groupId || body.groepId,
    title: body.title || 'Sportmoment',
    start: s.toISOString(),
    end: e.toISOString(),
    color: body.color || body.kleurHex
  };
  db.planning.items.push(item);
  writeDB(db);
  return NextResponse.json(item, { status: 201 });
}
