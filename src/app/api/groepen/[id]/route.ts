import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH,'utf8')); }
  catch { return { groepen: [], planning: { items: [] } }; }
}
function writeDB(db:any){ fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

export async function PUT(req: Request, { params }: { params:{ id:string }}) {
  const patch = await req.json();
  const db = readDB();
  db.groepen = db.groepen || [];
  const i = db.groepen.findIndex((g:any)=>g.id===params.id);
  if(i===-1) db.groepen.push({ id: params.id, ...patch });
  else db.groepen[i] = { ...db.groepen[i], ...patch, id: params.id };
  writeDB(db);
  return NextResponse.json(db.groepen.find((g:any)=>g.id===params.id));
}
export async function GET(_req:Request, { params }: { params:{ id:string }}) {
  const db = readDB();
  const g = (db.groepen||[]).find((x:any)=>x.id===params.id);
  if(!g) return NextResponse.json({error:'Niet gevonden'},{status:404});
  return NextResponse.json(g);
}
