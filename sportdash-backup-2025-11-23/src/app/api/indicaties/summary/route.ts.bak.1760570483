import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');

function norm(v?:string){
  const x = String(v||'').toLowerCase();
  if(['open'].includes(x)) return 'open';
  if(['in-behandeling','in behandeling','in_progress','processing'].includes(x)) return 'in-behandeling';
  if(['afgerond','closed','done','resolved'].includes(x)) return 'afgerond';
  return 'open';
}

export async function GET(){
  let db:any={};
  try{ db = JSON.parse(await fs.readFile(DB_PATH,'utf8')); }catch{}
  const items = Array.isArray(db?.indicaties?.items) ? db.indicaties.items : [];
  const total = items.length;
  const open = items.filter((i:any)=>norm(i.status)==='open').length;
  const inBehandeling = items.filter((i:any)=>norm(i.status)==='in-behandeling').length;
  const afgerond = items.filter((i:any)=>norm(i.status)==='afgerond').length;
  return NextResponse.json({ total, open, inBehandeling, afgerond }, { headers: { 'cache-control': 'no-store' } });
}
