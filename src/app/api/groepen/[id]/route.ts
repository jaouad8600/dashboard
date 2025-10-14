import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs'; import path from 'path';
const DB = path.join(process.cwd(),'data','app-data.json');
function load(){ try{ return JSON.parse(fs.readFileSync(DB,'utf8')); }catch{ return {}; } }
function save(j:any){ fs.writeFileSync(DB, JSON.stringify(j,null,2)); }
export async function PUT(req: NextRequest, { params }: { params: { id: string } }){
  const body = await req.json().catch(()=>({}));
  const kleur = (body.kleur || body.color || '').toString();
  if(!kleur) return NextResponse.json({ok:false,error:'kleur verplicht'},{status:400});
  const j = load();
  const arr = Array.isArray(j.groepen)? j.groepen : [];
  const i = arr.findIndex((g:any)=>g.id===params.id);
  if(i===-1) return NextResponse.json({ok:false,error:'groep niet gevonden'},{status:404});
  arr[i].kleur = kleur;
  j.groepen = arr; j.groups = arr;
  save(j);
  return NextResponse.json({ok:true, groep: arr[i]},{status:200});
}
