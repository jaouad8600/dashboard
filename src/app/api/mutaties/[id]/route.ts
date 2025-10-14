import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA = path.join(process.cwd(),'data','app-data.json');

function readDB(){
  if(!fs.existsSync(DATA)) return { mutaties:{items:[]}};
  const db = JSON.parse(fs.readFileSync(DATA,'utf8')||'{}');
  db.mutaties = db.mutaties || { items: [] };
  return db;
}
function writeDB(db:any){ fs.writeFileSync(DATA, JSON.stringify(db,null,2)); }

export async function PUT(req: Request, { params }: { params:{ id:string }}){
  const id = params.id;
  const patch = await req.json().catch(()=> ({} as any));
  const db = readDB();
  const i = db.mutaties.items.findIndex((x:any)=>x.id===id);
  if(i<0) return NextResponse.json({ error:'Niet gevonden'},{ status:404 });
  db.mutaties.items[i] = { ...db.mutaties.items[i], ...patch, updatedAt: new Date().toISOString() };
  writeDB(db);
  return NextResponse.json({ item: db.mutaties.items[i] });
}

export async function DELETE(req: Request, { params }: { params:{ id:string }}){
  const id = params.id;
  const db = readDB();
  const before = db.mutaties.items.length;
  db.mutaties.items = db.mutaties.items.filter((x:any)=>x.id!==id);
  if(db.mutaties.items.length===before) return NextResponse.json({ error:'Niet gevonden'},{ status:404 });
  writeDB(db);
  return NextResponse.json({ ok:true });
}
