import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');

export async function GET(){
  let db:any={};
  try{ db = JSON.parse(await fs.readFile(DB_PATH,'utf8')); }catch{}
  const items = Array.isArray(db?.mutaties?.items) ? db.mutaties.items : [];
  const total = items.length;
  const open = items.filter((m:any)=>String(m.status||'open').toLowerCase()==='open').length;
  return NextResponse.json({ total, open }, { headers: { 'cache-control': 'no-store' } });
}
