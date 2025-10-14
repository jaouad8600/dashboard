import { NextResponse } from 'next/server';
import fs from 'fs'; import path from 'path';
const DATA = path.join(process.cwd(),'data','app-data.json');
const uid = ()=> (Date.now().toString(36)+Math.random().toString(36).slice(2,8));
const read=()=> {
  if(!fs.existsSync(DATA)) return { mutaties:{items:[]}, groepen:[] };
  const db = JSON.parse(fs.readFileSync(DATA,'utf8')||'{}');
  db.mutaties = db.mutaties || { items: [] };
  return db;
};
const write=(db:any)=> fs.writeFileSync(DATA, JSON.stringify(db,null,2));

export async function GET(req:Request){
  const u = new URL(req.url);
  const groepId = u.searchParams.get('groepId')||'';
  const q = (u.searchParams.get('q')||'').toLowerCase();
  const db = read(); let items = db.mutaties.items||[];
  if(groepId) items = items.filter((x:any)=>x.groepId===groepId);
  if(q) items = items.filter((x:any)=> (x.notitie||'').toLowerCase().includes(q) || (x.actie||'').toLowerCase().includes(q));
  return NextResponse.json({ items });
}

export async function POST(req:Request){
  const body = await req.json().catch(()=> ({} as any));
  const item:any = {
    id: uid(),
    groepId: String(body.groepId||'').trim(),
    datum: String(body.datum||'').trim(),   // YYYY-MM-DD
    actie: String(body.actie||'').trim(),   // bijv. extra_sportmoment, materieel, etc.
    aantal: Number(body.aantal||0),
    notitie: String(body.notitie||'').trim(),
  };
  if(!item.groepId || !item.datum) return NextResponse.json({error:'groepId en datum verplicht'},{status:400});
  const db = read(); db.mutaties.items.push(item); write(db);
  return NextResponse.json({ item }, { status:201 });
}
