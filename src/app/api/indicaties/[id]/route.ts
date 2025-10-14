import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA = path.join(process.cwd(),'data','app-data.json');

function readDB(){
  if(!fs.existsSync(DATA)) return { indicaties:{items:[]}};
  const db = JSON.parse(fs.readFileSync(DATA,'utf8')||'{}');
  db.indicaties = db.indicaties || { items: [] };
  return db;
}
function writeDB(db:any){ fs.writeFileSync(DATA, JSON.stringify(db,null,2)); }

export async function PUT(req: Request, { params }: { params:{ id:string }}){
  const id = params.id;
  const patch = await req.json().catch(()=> ({} as any));
  const db = readDB();
  const i = db.indicaties.items.findIndex((x:any)=>x.id===id);
  if(i<0) return NextResponse.json({ error:'Niet gevonden'},{ status:404 });
  db.indicaties.items[i] = { ...db.indicaties.items[i], ...patch, updatedAt: new Date().toISOString() };
  writeDB(db);
  return NextResponse.json({ item: db.indicaties.items[i] });
}

export async function DELETE(req: Request, { params }: { params:{ id:string }}){
  const id = params.id;
  const db = readDB();
  const before = db.indicaties.items.length;
  db.indicaties.items = db.indicaties.items.filter((x:any)=>x.id!==id);
  if(db.indicaties.items.length===before) return NextResponse.json({ error:'Niet gevonden'},{ status:404 });
  writeDB(db);
  return NextResponse.json({ ok:true });
}
