import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA = path.join(process.cwd(),'data','app-data.json');

export async function GET(){
  if(!fs.existsSync(DATA)) return NextResponse.json({ perGroep:{}, totaal:0 });
  const db = JSON.parse(fs.readFileSync(DATA,'utf8')||'{}');
  const items = db?.mutaties?.items || [];
  const perGroep: Record<string, number> = {};
  for (const m of items) {
    if(!m?.groepId) continue;
    perGroep[m.groepId] = (perGroep[m.groepId] || 0) + 1;
  }
  const totaal = items.length || 0;
  return NextResponse.json({ perGroep, totaal });
}
