import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
export const revalidate = 0;

const PATH = 'data/app-data.json';
type PlanningItem = { id:string; naam?:string; title?:string; start?:string; end?:string; allDay?:boolean };

function readDB(){
  const raw = fs.existsSync(PATH) ? fs.readFileSync(PATH,'utf8') : '{"planning":{"items":[]}}';
  try { return JSON.parse(raw); } catch { return { planning:{items:[]} }; }
}
function inRange(s:string|undefined, start?:Date, end?:Date){
  if(!s) return false;
  const d = new Date(s);
  if(Number.isNaN(+d)) return false;
  if(start && d < start) return false;
  if(end   && d > end)   return false;
  return true;
}

export async function GET(req: NextRequest){
  const url = new URL(req.url);
  const date = url.searchParams.get('date');     // YYYY-MM-DD (centrum)
  const startQ = url.searchParams.get('start');  // ISO
  const endQ   = url.searchParams.get('end');    // ISO

  const db = readDB();
  let items: PlanningItem[] = Array.isArray(db.planning?.items) ? db.planning.items : [];

  let start: Date | undefined;
  let end:   Date | undefined;

  if(startQ && endQ){
    start = new Date(startQ); end = new Date(endQ);
  } else if(date){
    const d = new Date(date+'T00:00:00');
    const day = (d.getDay()+6)%7; // maandag=0
    start = new Date(d); start.setDate(d.getDate()-day); start.setHours(0,0,0,0);
    end   = new Date(start); end.setDate(start.getDate()+6); end.setHours(23,59,59,999);
  }

  if(start && end){
    items = items.filter(it => inRange(it.start, start, end));
  }

  return NextResponse.json({ items }, { status: 200 });
}
