import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA = path.join(process.cwd(),'data','app-data.json');

type Row = { id:string; groepId:string; datum:string }; // id = `${groepId}:${datum}`

function readDB(){
  if(!fs.existsSync(DATA)) return { sportmomenten:{items:[]}, groepen:[] };
  const db = JSON.parse(fs.readFileSync(DATA,'utf8')||'{}');
  db.sportmomenten = db.sportmomenten || { items: [] };
  return db;
}
function writeDB(db:any){ fs.writeFileSync(DATA, JSON.stringify(db,null,2)); }

export async function GET(req: Request){
  const url = new URL(req.url);
  const start = url.searchParams.get('start') || undefined;
  const end   = url.searchParams.get('end')   || undefined;
  const groepId = url.searchParams.get('groepId') || undefined;

  const db = readDB();
  let items: Row[] = db.sportmomenten.items || [];
  if(groepId) items = items.filter(x=>x.groepId===groepId);
  if(start)   items = items.filter(x=>x.datum >= start);
  if(end)     items = items.filter(x=>x.datum <= end);
  return NextResponse.json({ items });
}

export async function POST(req: Request){
  const body = await req.json().catch(()=> ({} as any));
  const groepId = String(body?.groepId||'').trim();
  const datum   = String(body?.datum||'').trim(); // YYYY-MM-DD
  const on      = !!body?.on;

  if(!groepId || !datum) return NextResponse.json({ error:'groepId en datum verplicht'},{ status:400 });

  const db = readDB(); const id = `${groepId}:${datum}`;
  const idx = db.sportmomenten.items.findIndex((x:Row)=>x.id===id);

  if(on){
    if(idx===-1) db.sportmomenten.items.push({ id, groepId, datum });
  }else{
    if(idx>=0) db.sportmomenten.items.splice(idx,1);
  }
  writeDB(db);
  return NextResponse.json({ ok:true, id, on });
}
