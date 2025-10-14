import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA = path.join(process.cwd(),'data','app-data.json');

function readDB(){
  if(!fs.existsSync(DATA)) return { groepen:[] };
  const db = JSON.parse(fs.readFileSync(DATA,'utf8')||'{}');
  db.groepen = Array.isArray(db.groepen) ? db.groepen : (Array.isArray(db.groups)? db.groups : []);
  return db;
}
function writeDB(db:any){ db.groups=db.groepen; fs.writeFileSync(DATA, JSON.stringify(db,null,2)); }

export async function PUT(req: Request, { params }: { params:{ id:string }}){
  const id = params.id;
  const patch = await req.json().catch(()=> ({} as any));
  const db = readDB();
  const i = db.groepen.findIndex((g:any)=>g.id===id);
  if(i<0) return NextResponse.json({ error:'Groep niet gevonden'},{ status:404 });
  db.groepen[i] = { ...db.groepen[i], ...patch, updatedAt: new Date().toISOString() };
  writeDB(db);
  return NextResponse.json({ item: db.groepen[i] });
}
