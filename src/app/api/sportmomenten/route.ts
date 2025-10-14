import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns';

const DATA_PATH = path.join(process.cwd(), 'data', 'app-data.json');

type Item = { groepId:string; date:string; createdAt?:string };

function readDB(){
  if(!fs.existsSync(DATA_PATH)) return { sportmomenten:{items:[] as Item[] } };
  const db = JSON.parse(fs.readFileSync(DATA_PATH,'utf8')||'{}');
  db.sportmomenten = db.sportmomenten || { items: [] };
  return db;
}

export async function GET(req: Request){
  const url = new URL(req.url);
  const ws = url.searchParams.get('weekStart');
  const we = url.searchParams.get('weekEnd');
  const agg = url.searchParams.get('aggregate') === '1';

  const db = readDB();
  let items: Item[] = db.sportmomenten.items || [];

  if (ws && we) {
    const start = parseISO(ws);
    const end   = parseISO(we);
    items = items.filter(it=>{
      try{
        const d = parseISO(it.date);
        return isWithinInterval(d,{start,end});
      }catch{ return false; }
    });
  }

  if (agg) {
    const byKey: Record<string,number> = {};
    for (const it of items) {
      const key = `${it.groepId}:${it.date}`;
      byKey[key] = (byKey[key]||0)+1;
    }
    return NextResponse.json({ aggregate: byKey });
  }
  return NextResponse.json({ items });
}

export async function POST(req: Request){
  const body = await req.json().catch(()=> ({} as any));
  const groepId = String(body?.groepId||'').trim();
  const dateStr = String(body?.date||'').trim(); // YYYY-MM-DD
  if(!groepId || !dateStr) return NextResponse.json({error:'groepId en date verplicht'}, {status:400});
  const db = readDB();
  const items: Item[] = db.sportmomenten.items || (db.sportmomenten.items = []);
  const exists = items.find(x=>x.groepId===groepId && x.date===dateStr);
  if(!exists){
    items.push({ groepId, date: dateStr, createdAt: new Date().toISOString() });
    fs.writeFileSync(DATA_PATH, JSON.stringify(db,null,2));
  }
  return NextResponse.json({ ok:true });
}

export async function DELETE(req: Request){
  const url = new URL(req.url);
  const groepId = String(url.searchParams.get('groepId')||'').trim();
  const dateStr = String(url.searchParams.get('date')||'').trim();
  if(!groepId || !dateStr) return NextResponse.json({error:'groepId en date verplicht'}, {status:400});
  const db = readDB();
  const before = db.sportmomenten.items.length;
  db.sportmomenten.items = db.sportmomenten.items.filter((x:Item)=> !(x.groepId===groepId && x.date===dateStr));
  if (db.sportmomenten.items.length !== before) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(db,null,2));
  }
  return NextResponse.json({ ok:true });
}
