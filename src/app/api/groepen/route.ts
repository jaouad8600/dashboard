import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');

async function readDB(): Promise<any> {
  try { return JSON.parse(await fs.readFile(DB_PATH,'utf8')); } catch { return {}; }
}
async function writeDB(db:any){ await fs.mkdir(path.dirname(DB_PATH),{recursive:true}); await fs.writeFile(DB_PATH, JSON.stringify(db,null,2)); }

function normKleur(v?:string|null){
  if(!v) return null; const x=v.toLowerCase();
  if(['groen','green'].includes(x)) return 'groen';
  if(['geel','yellow'].includes(x)) return 'geel';
  if(['oranje','orange'].includes(x)) return 'oranje';
  if(['rood','red'].includes(x)) return 'rood';
  return null;
}
function sameId(g:any, id:string){
  const cand=String(g?.id ?? g?.slug ?? g?.name ?? g?.naam ?? '').toLowerCase();
  return cand===String(id).toLowerCase();
}

export async function GET(){
  const db=await readDB();
  const groepen = Array.isArray(db.groepen)? db.groepen : (db.groups ?? []);
  return NextResponse.json(groepen, { headers:{'cache-control':'no-store'} });
}

export async function PATCH(req:NextRequest){
  const body=await req.json().catch(()=>({}));
  const id=body?.id; const kleur = normKleur(body?.kleur ?? body?.color ?? body?.hex);
  if(!id || !kleur) return NextResponse.json({error:'id en kleur verplicht'}, {status:400, headers:{'cache-control':'no-store'}});
  const db=await readDB();
  const groepen = Array.isArray(db.groepen)? db.groepen : (db.groups ?? []);
  const idx = groepen.findIndex((g:any)=> sameId(g,id));
  if(idx===-1) return NextResponse.json({error:'Groep niet gevonden'}, {status:404, headers:{'cache-control':'no-store'}});
  const cur = groepen[idx] || {};
  groepen[idx] = { ...cur, kleur };
  db.groepen = groepen; db.groups = groepen;
  await writeDB(db);
  return NextResponse.json(groepen[idx], { headers:{'cache-control':'no-store'} });
}
