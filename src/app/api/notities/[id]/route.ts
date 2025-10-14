import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');
async function readDB(){ try{ return JSON.parse(await fs.readFile(DB_PATH,'utf8')); }catch{ return {}; } }
async function writeDB(db:any){ await fs.mkdir(path.dirname(DB_PATH),{recursive:true}); await fs.writeFile(DB_PATH, JSON.stringify(db,null,2)); }

export async function DELETE(_req:NextRequest, {params}:{params:{id:string}}){
  const db=await readDB();
  const items = Array.isArray(db?.notities?.items)? db.notities.items : [];
  const idx = items.findIndex((n:any)=> String(n.id)===String(params.id));
  if(idx===-1) return NextResponse.json({error:'Notitie niet gevonden'}, {status:404, headers:{'cache-control':'no-store'}});
  const [removed]=items.splice(idx,1);
  db.notities.items = items;
  await writeDB(db);
  return NextResponse.json({ ok:true, removed }, { headers:{'cache-control':'no-store'} });
}

export async function PUT(req:NextRequest, {params}:{params:{id:string}}){
  const body=await req.json().catch(()=>({}));
  const db=await readDB();
  const items = Array.isArray(db?.notities?.items)? db.notities.items : [];
  const idx = items.findIndex((n:any)=> String(n.id)===String(params.id));
  if(idx===-1) return NextResponse.json({error:'Notitie niet gevonden'}, {status:404, headers:{'cache-control':'no-store'}});
  const cur = items[idx];
  const tekst = typeof body?.tekst==='string' ? body.tekst : cur.tekst;
  const archived = typeof body?.archived==='boolean' ? body.archived : cur.archived ?? false;
  items[idx] = { ...cur, tekst, archived, updatedAt: new Date().toISOString() };
  db.notities.items = items;
  await writeDB(db);
  return NextResponse.json(items[idx], { headers:{'cache-control':'no-store'} });
}
