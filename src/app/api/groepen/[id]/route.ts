import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB = path.join(process.cwd(), 'data', 'app-data.json');
const OK = ['groen','geel','oranje','rood'];

function readDB(){ try{ return JSON.parse(fs.readFileSync(DB,'utf8')); }catch{ return {}; } }
function writeDB(j:any){ fs.mkdirSync(path.dirname(DB),{recursive:true}); fs.writeFileSync(DB, JSON.stringify(j,null,2)); }

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(()=>({}));
  const kleur = String(body.kleur || '').toLowerCase();
  if(!OK.includes(kleur)){
    return NextResponse.json({ ok:false, error:'ongeldige_kleur' }, { status:400 });
  }
  const j = readDB();
  const arr = Array.isArray((j as any).groepen) ? (j as any).groepen : (Array.isArray((j as any).groups) ? (j as any).groups : []);
  const i = arr.findIndex((g:any)=>g.id===params.id);
  if(i<0) return NextResponse.json({ ok:false, error:'groep_niet_gevonden' }, { status:404 });
  arr[i].kleur = kleur;
  (j as any).groepen = arr; (j as any).groups = arr; // legacy in sync
  writeDB(j);
  return NextResponse.json({ ok:true, groep: arr[i] });
}
