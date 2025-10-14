import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
export const revalidate = 0;

const PATH = 'data/app-data.json';
type Item = { groepId:string; datum:string; aanwezig:boolean };

function readDB(){
  const raw = fs.existsSync(PATH) ? fs.readFileSync(PATH,'utf8') : '{"sportmomenten":{"items":[]}}';
  try { return JSON.parse(raw); } catch { return { sportmomenten:{items:[]} }; }
}
function toDate(s:string){
  const [y,m,d] = (s||'').split('-').map(Number);
  if(!y||!m||!d) return null;
  return new Date(Date.UTC(y, m-1, d));
}
function ym(d:Date){ return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`; }

export async function GET(req: NextRequest){
  const url = new URL(req.url);
  const groepId = url.searchParams.get('groepId') || undefined;
  const db = readDB();
  const all: Item[] = db.sportmomenten?.items ?? [];
  const items = all.filter(x => (!groepId || x.groepId===groepId) && x.aanwezig);

  const now = new Date();
  const yStart = new Date(Date.UTC(now.getUTCFullYear(),0,1));
  const mStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const last30Start = new Date(now.getTime() - 30*24*60*60*1000);

  let allTime=0, thisYear=0, thisMonth=0, last30=0;
  const perMonth: Record<string, number> = {};

  for(const it of items){
    const d = toDate(it.datum);
    if(!d) continue;
    allTime++;
    if(d >= yStart) thisYear++;
    if(d >= mStart) thisMonth++;
    if(d >= last30Start) last30++;
    const k = ym(d);
    perMonth[k] = (perMonth[k]||0)+1;
  }

  return NextResponse.json({ groepId: groepId||null, totals:{ allTime, thisYear, thisMonth, last30 }, perMonth }, { status: 200 });
}
