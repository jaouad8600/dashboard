import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const revalidate = 0;
export const dynamic = "force-dynamic";
const DB = path.join(process.cwd(), "data", "app-data.json");

async function readDB(): Promise<any> {
  try { return JSON.parse(await fs.readFile(DB, "utf8")); } catch { return {}; }
}
async function writeDB(db: any) {
  await fs.mkdir(path.dirname(DB), { recursive: true });
  await fs.writeFile(DB, JSON.stringify(db, null, 2));
}
function normKleur(v?: string|null) {
  if (!v) return null;
  const x = v.toLowerCase();
  if (["groen","green"].includes(x)) return "groen";
  if (["geel","yellow"].includes(x)) return "geel";
  if (["oranje","orange"].includes(x)) return "oranje";
  if (["rood","red"].includes(x)) return "rood";
  return null;
}
function sameId(g:any, id:string){
  const cand = String(g?.id ?? g?.slug ?? g?.name ?? g?.naam ?? "").toLowerCase();
  return cand === String(id).toLowerCase();
}

type Ctx = { params: Promise<{ id:string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = await readDB();
  const groepen = Array.isArray(db.groepen) ? db.groepen : (db.groups ?? []);
  const g = groepen.find((x:any)=>sameId(x,id));
  if(!g) return NextResponse.json({error:"Groep niet gevonden"}, {status:404, headers:{'cache-control':'no-store'}});
  return NextResponse.json(g, {headers:{'cache-control':'no-store'}});
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json().catch(()=>({}));
  const kleur = normKleur((body as any).kleur ?? (body as any).color);
  if(!kleur) return NextResponse.json({error:"Ongeldige 'kleur' (groen|geel|oranje|rood)"},{status:400, headers:{'cache-control':'no-store'}});

  const db = await readDB();
  const groepen = Array.isArray(db.groepen) ? db.groepen : (db.groups ?? []);
  const idx = groepen.findIndex((x:any)=>sameId(x,id));
  if(idx===-1) return NextResponse.json({error:"Groep niet gevonden"},{status:404, headers:{'cache-control':'no-store'}});

  const cur = groepen[idx] || {};
  groepen[idx] = { ...cur, kleur };
  db.groepen = groepen; db.groups = groepen;
  await writeDB(db);
  return NextResponse.json(groepen[idx], {headers:{'cache-control':'no-store'}});
}
