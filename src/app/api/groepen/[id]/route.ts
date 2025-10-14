import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
export const revalidate = 0;

const PATH = 'data/app-data.json';

function readDB(){
  const raw = fs.existsSync(PATH) ? fs.readFileSync(PATH,'utf8') : '{"groepen":[]}';
  try { return JSON.parse(raw); } catch { return { groepen:[] }; }
}
function writeDB(db:any){ fs.writeFileSync(PATH, JSON.stringify(db,null,2)); }

export async function PUT(req: NextRequest, { params }: { params:{ id:string } }){
  const id = params.id;
  const body = await req.json().catch(()=> ({}));
  const kleur = body.kleur ?? body.color ?? null;
  const hex   = body.hex ?? null;

  const db = readDB();
  const arr: any[] = Array.isArray(db.groepen) ? db.groepen : (Array.isArray(db.groups)? db.groups : []);
  const idx = arr.findIndex((g:any)=> g.id===id);
  if(idx<0) return NextResponse.json({ error:'Groep niet gevonden' }, { status: 404 });

  if(kleur!==null) arr[idx].kleur = kleur;
  if(hex!==null)   arr[idx].hex   = hex;
  db.groepen = arr; db.groups = arr; // in sync
  writeDB(db);

  return NextResponse.json(arr[idx], { status: 200 });
}
