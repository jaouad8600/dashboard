import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
export const revalidate = 0;
export const dynamic = "force-dynamic";
const DB = path.join(process.cwd(), "data", "app-data.json");

async function readDB(): Promise<any>{ try{ return JSON.parse(await fs.readFile(DB,"utf8")); }catch{ return {}; } }
async function writeDB(db:any){ await fs.mkdir(path.dirname(DB),{recursive:true}); await fs.writeFile(DB, JSON.stringify(db,null,2)); }
const iso = (d:string|Date)=>{ const x=new Date(d); const y=x.getFullYear(); const m=String(x.getMonth()+1).padStart(2,"0"); const dd=String(x.getDate()).padStart(2,"0"); return `${y}-${m}-${dd}`; };

export async function GET(req: NextRequest){
  const db = await readDB();
  const items = Array.isArray(db?.sportmomenten?.items)? db.sportmomenten.items : [];
  const sp = new URL(req.url).searchParams;
  const groepId = sp.get("groepId") || sp.get("groupId");
  const start = sp.get("start"); const end = sp.get("end");
  let out = items;
  if(groepId) out = out.filter((x:any)=>String(x.groepId)===String(groepId));
  if(start) out = out.filter((x:any)=>x.datum>=start);
  if(end)   out = out.filter((x:any)=>x.datum<end);
  return NextResponse.json({items: out},{headers:{'cache-control':'no-store'}});
}

export async function POST(req: NextRequest){
  const body = await req.json().catch(()=>({}));
  const groepId = (body as any).groepId ?? (body as any).groupId;
  let datum = (body as any).datum;
  const value = Boolean((body as any).value);
  if(!groepId || !datum) return NextResponse.json({error:"groepId en datum verplicht"},{status:400});
  datum = iso(datum);

  const db = await readDB();
  db.sportmomenten = db.sportmomenten || {items:[]};
  if(!Array.isArray(db.sportmomenten.items)) db.sportmomenten.items=[];
  const key = (x:any)=>`${x.groepId}__${x.datum}`;
  const items:any[] = db.sportmomenten.items;

  const idx = items.findIndex((x:any)=>key(x)===`${groepId}__${datum}`);
  if(value){
    if(idx===-1) items.push({groepId, datum});
  } else {
    if(idx!==-1) items.splice(idx,1);
  }
  db.sportmomenten.items = items;
  await writeDB(db);
  return NextResponse.json({ok:true},{headers:{'cache-control':'no-store'}});
}
