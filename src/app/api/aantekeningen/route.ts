import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
export const revalidate = 0;
export const dynamic = "force-dynamic";
const DB = path.join(process.cwd(), "data", "app-data.json");
const uid = ()=>"n_"+Math.random().toString(36).slice(2)+Date.now().toString(36);

async function readDB(): Promise<any>{ try{ return JSON.parse(await fs.readFile(DB,"utf8")); }catch{ return {}; } }
async function writeDB(db:any){ await fs.mkdir(path.dirname(DB),{recursive:true}); await fs.writeFile(DB, JSON.stringify(db,null,2)); }

export async function GET(req: NextRequest){
  const db = await readDB();
  const items = Array.isArray(db?.aantekeningen?.items)? db.aantekeningen.items : [];
  const sp = new URL(req.url).searchParams;
  const groupId = sp.get("groupId") || sp.get("groepId") || "";

  if(groupId==="list"){
    const map:Record<string,number>={};
    for(const it of items) map[String(it.groepId)] = (map[String(it.groepId)]||0)+1;
    return NextResponse.json(map, {headers:{'cache-control':'no-store'}});
  }
  const out = groupId? items.filter((x:any)=>String(x.groepId)===String(groupId)) : items;
  out.sort((a:any,b:any)=>String(b.createdAt??"").localeCompare(String(a.createdAt??"")));
  return NextResponse.json(out, {headers:{'cache-control':'no-store'}});
}

export async function POST(req: NextRequest){
  const body = await req.json().catch(()=>({}));
  const tekst = String((body as any).tekst || (body as any).text || "").trim();
  const groepId = (body as any).groepId ?? (body as any).groupId;
  if(!groepId || !tekst) return NextResponse.json({error:"groepId en tekst verplicht"}, {status:400});
  const db = await readDB();
  db.aantekeningen = db.aantekeningen || {items:[]};
  if(!Array.isArray(db.aantekeningen.items)) db.aantekeningen.items=[];
  const item = { id: uid(), groepId, tekst, createdAt: new Date().toISOString() };
  db.aantekeningen.items.unshift(item);
  await writeDB(db);
  return NextResponse.json(item, {status:201, headers:{'cache-control':'no-store'}});
}
