import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA = path.join(process.cwd(),'data','app-data.json');
type Indicatie = { id:string; groepId:string; datum:string; type:string; omschrijving?:string; status?:'open'|'afgehandeld'; createdAt?:string; updatedAt?:string };

function readDB(){
  if(!fs.existsSync(DATA)) return { indicaties:{items:[]}, groepen:[] };
  const db = JSON.parse(fs.readFileSync(DATA,'utf8')||'{}');
  db.indicaties = db.indicaties || { items: [] };
  return db;
}
function writeDB(db:any){ fs.writeFileSync(DATA, JSON.stringify(db,null,2)); }

export async function GET(req: Request){
  const url = new URL(req.url);
  const groepId = url.searchParams.get('groepId') || undefined;
  const status  = url.searchParams.get('status')  || undefined;
  const q       = (url.searchParams.get('q')||'').toLowerCase();
  const db = readDB(); let items:Indicatie[] = db.indicaties.items || [];
  if(groepId) items = items.filter(x=>x.groepId===groepId);
  if(status)  items = items.filter(x=>x.status===status);
  if(q) items = items.filter(x=> (x.type||'').toLowerCase().includes(q) || (x.omschrijving||'').toLowerCase().includes(q));
  return NextResponse.json({ items });
}

export async function POST(req: Request){
  const body = await req.json().catch(()=> ({} as any));
  const now = new Date().toISOString();
  const item:Indicatie = {
    id: body?.id || `ind_${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`,
    groepId: String(body?.groepId||'').trim(),
    datum: String(body?.datum||'').trim(),
    type: String(body?.type||'').trim(),
    omschrijving: String(body?.omschrijving||'').trim(),
    status: (body?.status==='afgehandeld'?'afgehandeld':'open'),
    createdAt: now, updatedAt: now
  };
  if(!item.groepId || !item.datum || !item.type){
    return NextResponse.json({ error:'groepId, datum en type zijn verplicht' },{ status:400 });
  }
  const db = readDB();
  db.indicaties.items.push(item); writeDB(db);
  return NextResponse.json({ item }, { status:201 });
}
