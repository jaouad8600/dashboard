import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');

type Plan = { id?:string; title?:string; start?:string; end?:string; allDay?:boolean; groepId?:string };

export async function GET(req: Request){
  const url = new URL(req.url);
  const qStart = url.searchParams.get('start');
  const qEnd   = url.searchParams.get('end');
  const qDate  = url.searchParams.get('date'); // fallback

  let db:any={};
  try{ db = JSON.parse(await fs.readFile(DB_PATH,'utf8')); }catch{}
  let items: Plan[] = Array.isArray(db?.planning?.items) ? db.planning.items : [];

  const inRange = (s?:string)=>{
    if(!s) return false;
    const t = +new Date(s);
    if (qStart && qEnd) return t >= +new Date(qStart) && t <= +new Date(qEnd);
    if (qDate){
      const d = new Date(qDate);
      const a = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0,0,0,0).getTime();
      const b = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23,59,59,999).getTime();
      return t>=a && t<=b;
    }
    return true;
  };

  if (qStart || qDate) items = items.filter(x=>inRange(x.start));

  return NextResponse.json({ items }, { headers: { 'cache-control': 'no-store' } });
}
