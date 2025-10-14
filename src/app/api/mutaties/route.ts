import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA = path.join(process.cwd(),'data','app-data.json');
type Mutatie = { id:string; groepId:string; datum:string; actie:string; aantal?:number; notitie?:string; createdAt?:string; updatedAt?:string };

function readDB(){
  if(!fs.existsSync(DATA)) return { mutaties:{items:[]}, groepen:[] };
  const db = JSON.parse(fs.readFileSync(DATA,'utf8')||'{}');
  db.mutaties = db.mutaties || { items: [] };
  return db;
}
function writeDB(db:any){ fs.writeFileSync(DATA, JSON.stringify(db,null,2)); }

export async function GET(req: Request){
  const url = new URL(req.url);
  const groepId = url.searchParams.get('groepId') || undefined;
  const q       = (url.searchParams.get('q')||'').toLowerCase();
  const from    = url.searchParams.get('from') || undefined;
  const to      = url.searchParams.get('to') || undefined;

  const db = readDB(); let items:Mutatie[] = db.mutaties.items || [];
  if(groepId) items = items.filter(x=>x.groepId===groepId);
  if(from) items = items.filter(x=>x.datum >= from);
  if(to)   items = items.filter(x=>x.datum <= to);
  if(q) items = items.filter(x=> (x.actie||'').toLowerCase().includes(q) || (x.notitie||'').toLowerCase().includes(q));
  return NextResponse.json({ items });
}

export async function POST(req: Request){
  const body = await req.json().catch(()=> ({} as any));
  const now = new Date().toISOString();
  const item:Mutatie = {
    id: body?.id || `mut_${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`,
    groepId: String(body?.groepId||'').trim(),
    datum: String(body?.datum||'').trim(),
    actie: String(body?.actie||'').trim(),
    aantal: Number.isFinite(body?.aantal)? Number(body.aantal) : undefined,
    notitie: String(body?.notitie||'').trim(),
    createdAt: now, updatedAt: now
  };
  if(!item.groepId || !item.datum || !item.actie){
    return NextResponse.json({ error:'groepId, datum en actie zijn verplicht' },{ status:400 });
  }
  const db = readDB();
  db.mutaties.items.push(item); writeDB(db);
  return NextResponse.json({ item }, { status:201 });
}
