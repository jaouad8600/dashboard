import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

type Item = { id: string; naam: string; aantal: number; categorie?: string; locatie?: string; opmerking?: string; updatedAt: string };

const DB = join(process.cwd(),'data','app-data.json');
function readDB(){ if(!existsSync(DB)) return { inventaris:{items:[]} }; try{ return JSON.parse(readFileSync(DB,'utf8')); }catch{ return { inventaris:{items:[]} }; } }
function writeDB(db:any){ writeFileSync(DB, JSON.stringify(db,null,2),'utf8'); }

export async function GET(){
  const db = readDB();
  const items: Item[] = Array.isArray(db?.inventaris?.items) ? db.inventaris.items : [];
  return NextResponse.json({ items }, { status: 200 });
}

export async function POST(req: Request){
  const body = await req.json().catch(()=>null);
  if(!body || !body.naam) return NextResponse.json({error:'naam vereist'}, {status:400});
  const db = readDB();
  db.inventaris = db.inventaris || { items: [] };
  db.inventaris.items = Array.isArray(db.inventaris.items) ? db.inventaris.items : [];

  if(body.id){
    const idx = db.inventaris.items.findIndex((x:Item)=>x.id===body.id);
    if(idx>=0){
      db.inventaris.items[idx] = { ...db.inventaris.items[idx], ...body, updatedAt: new Date().toISOString() };
    }else{
      db.inventaris.items.push({ id: body.id, naam: body.naam, aantal: Number(body.aantal||0), categorie: body.categorie, locatie: body.locatie, opmerking: body.opmerking, updatedAt: new Date().toISOString() });
    }
  }else{
    db.inventaris.items.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`, naam: body.naam, aantal: Number(body.aantal||0), categorie: body.categorie, locatie: body.locatie, opmerking: body.opmerking, updatedAt: new Date().toISOString() });
  }
  writeDB(db);
  return NextResponse.json({ ok:true }, { status: 201 });
}
