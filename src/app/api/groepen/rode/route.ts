import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');
async function readDB(){ try{ return JSON.parse(await fs.readFile(DB_PATH,'utf8')); }catch{ return {}; } }

export async function GET(){
  const db=await readDB();
  const groepen = Array.isArray(db.groepen)? db.groepen : (db.groups ?? []);
  const rood = (groepen||[]).filter((g:any)=> (g.kleur||'').toLowerCase()==='rood');
  return NextResponse.json(rood, { headers:{'cache-control':'no-store'} });
}
