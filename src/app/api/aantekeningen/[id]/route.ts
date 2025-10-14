import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
export const revalidate = 0;
export const dynamic = "force-dynamic";
const DB = path.join(process.cwd(), "data", "app-data.json");
type Ctx = { params: Promise<{id:string}> };

async function readDB(): Promise<any>{ try{ return JSON.parse(await fs.readFile(DB,"utf8")); }catch{ return {}; } }
async function writeDB(db:any){ await fs.mkdir(path.dirname(DB),{recursive:true}); await fs.writeFile(DB, JSON.stringify(db,null,2)); }

export async function DELETE(_req: Request, ctx: Ctx){
  const { id } = await ctx.params;
  const db = await readDB();
  const items = Array.isArray(db?.aantekeningen?.items)? db.aantekeningen.items : [];
  const idx = items.findIndex((x:any)=>String(x.id)===String(id));
  if(idx===-1) return NextResponse.json({error:"Niet gevonden"},{status:404, headers:{'cache-control':'no-store'}});
  items.splice(idx,1);
  db.aantekeningen.items = items;
  await writeDB(db);
  return NextResponse.json({ok:true},{headers:{'cache-control':'no-store'}});
}
