import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
const DB_PATH = path.join(process.cwd(), "data", "app-data.json");
const headers = { "cache-control": "no-store" };

type Note = { id:string; groupId:string; text:string; archived?:boolean; createdAt:string; updatedAt:string; };

async function readDB(): Promise<any> { try { return JSON.parse(await fs.readFile(DB_PATH,"utf8")); } catch { return {}; } }
async function writeDB(db:any){ await fs.mkdir(path.dirname(DB_PATH),{recursive:true}); await fs.writeFile(DB_PATH, JSON.stringify(db,null,2)); }
function getList(db:any): Note[] { return Array.isArray(db?.notities?.items) ? db.notities.items : (Array.isArray(db?.aantekeningen?.items)? db.aantekeningen.items : []); }
function setList(db:any, items:Note[]){ db.notities={items}; db.aantekeningen={items}; }

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(()=> ({}));
  const db = await readDB();
  const list = getList(db);
  const idx = list.findIndex(n => String(n.id)===String(id));
  if (idx<0) return NextResponse.json({ error:"Notitie niet gevonden" }, { status:404, headers });

  const n = list[idx];
  if (typeof body.text === "string") n.text = body.text;
  if (typeof body.opmerking === "string") n.text = body.opmerking;
  if (typeof body.archived === "boolean") n.archived = body.archived;
  n.updatedAt = new Date().toISOString();
  list[idx] = n;

  setList(db, list);
  await writeDB(db);
  return NextResponse.json({ ok:true, item:n }, { headers });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await readDB();
  const list = getList(db).filter(n => String(n.id)!==String(id));
  setList(db, list);
  await writeDB(db);
  return NextResponse.json({ ok:true, deletedId:id }, { headers });
}
