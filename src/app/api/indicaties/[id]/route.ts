import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA = path.join(process.cwd(), 'data', 'app-data.json');

function readDB(): any {
  if(!fs.existsSync(DATA)) return { indicaties:{items:[]} };
  try {
    const j = JSON.parse(fs.readFileSync(DATA,'utf8')||'{}');
    if(!j.indicaties || !Array.isArray(j.indicaties.items)) j.indicaties={items:[]};
    return j;
  } catch {
    return { indicaties:{items:[]} };
  }
}
function writeDB(db:any){ fs.writeFileSync(DATA, JSON.stringify(db,null,2)); }

export async function PUT(_req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  const body = await _req.json().catch(()=>({}));
  const db = readDB();
  const items = db.indicaties.items as any[];
  const i = items.findIndex(x => String(x.id) === String(id));
  if(i<0) return NextResponse.json({error:'Niet gevonden'}, {status:404});
  items[i] = { ...items[i], ...body, id: items[i].id }; // id blijft
  writeDB(db);
  return NextResponse.json({ item: items[i] }, { status:200 });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  const db = readDB();
  const items = db.indicaties.items as any[];
  const before = items.length;
  db.indicaties.items = items.filter(x => String(x.id)!==String(id));
  writeDB(db);
  return NextResponse.json({ removed: before - (db.indicaties.items as any[]).length }, { status:200 });
}
