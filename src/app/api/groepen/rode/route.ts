import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');

function isRood(v?: string){ return ['rood','red'].includes(String(v||'').toLowerCase()); }

export async function GET() {
  let db:any={};
  try{ db = JSON.parse(await fs.readFile(DB_PATH,'utf8')); }catch{}
  const groepen = Array.isArray(db.groepen) ? db.groepen : (db.groups ?? []);
  const items = groepen.filter((g:any)=>isRood(g.kleur));
  return NextResponse.json({ count: items.length, items }, { headers: { 'cache-control': 'no-store' } });
}
