import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
export const revalidate = 0;
export const dynamic = "force-dynamic";
const DB = path.join(process.cwd(), "data", "app-data.json");

async function readDB(): Promise<any>{ try{ return JSON.parse(await fs.readFile(DB,"utf8")); }catch{ return {}; } }
const inRange=(d:string,a:Date,b:Date)=>{ const t=new Date(d).getTime(); return t>=a.getTime() && t<b.getTime(); };
const thisMonth=(now=new Date())=>[new Date(now.getFullYear(),now.getMonth(),1), new Date(now.getFullYear(),now.getMonth()+1,1)] as const;
const lastMonth=(now=new Date())=>[new Date(now.getFullYear(),now.getMonth()-1,1), new Date(now.getFullYear(),now.getMonth(),1)] as const;

export async function GET(req: NextRequest){
  const sp = new URL(req.url).searchParams;
  const groepId = sp.get("groepId");
  if(!groepId) return NextResponse.json({error:"groepId verplicht"},{status:400});
  const db = await readDB();
  const items:any[] = Array.isArray(db?.sportmomenten?.items)? db.sportmomenten.items : [];
  const own = items.filter(x=>String(x.groepId)===String(groepId));
  const now = new Date();
  const [tmA,tmB] = thisMonth(now);
  const [lmA,lmB] = lastMonth(now);
  const yA = new Date(now.getFullYear(),0,1);
  const yB = new Date(now.getFullYear()+1,0,1);
  const d30 = new Date(now.getTime()-30*24*3600*1000);

  return NextResponse.json({
    totaal: own.length,
    dezeMaand: own.filter(x=>inRange(x.datum,tmA,tmB)).length,
    vorigeMaand: own.filter(x=>inRange(x.datum,lmA,lmB)).length,
    ditJaar: own.filter(x=>inRange(x.datum,yA,yB)).length,
    laatste30Dagen: own.filter(x=>inRange(x.datum,d30,now)).length,
  }, {headers:{'cache-control':'no-store'}});
}
