import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
export const revalidate = 0;

const PATH = 'data/app-data.json';
type Item = { id:string; groepId:string; datum:string; aanwezig:boolean };

function readDB(){
  const raw = fs.existsSync(PATH) ? fs.readFileSync(PATH,'utf8') : '{"sportmomenten":{"items":[]}}';
  try { return JSON.parse(raw); } catch { return { sportmomenten:{items:[]} }; }
}
function writeDB(db:any){ fs.writeFileSync(PATH, JSON.stringify(db,null,2)); }

export async function GET(){
  const db = readDB();
  const items: Item[] = db.sportmomenten?.items ?? [];
  return NextResponse.json({ items }, { status: 200 });
}

export async function POST(req: NextRequest){
  const { groepId, datum, aanwezig } = await req.json();
  if(!groepId || !datum){
    return NextResponse.json({ error:'groepId en datum verplicht' }, { status: 400 });
  }
  const db = readDB();
  db.sportmomenten = db.sportmomenten || { items: [] };
  db.sportmomenten.items = Array.isArray(db.sportmomenten.items) ? db.sportmomenten.items : [];
  const idx = db.sportmomenten.items.findIndex((x:Item)=> x.groepId===groepId && x.datum===datum);
  if(idx>=0){
    db.sportmomenten.items[idx].aanwezig = !!aanwezig;
  } else {
    db.sportmomenten.items.push({ id:`${groepId}:${datum}`, groepId, datum, aanwezig:!!aanwezig });
  }
  writeDB(db);
  return NextResponse.json({ ok:true }, { status: 200 });
}
