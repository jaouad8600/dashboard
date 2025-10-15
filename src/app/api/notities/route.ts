import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
const DB_PATH = path.join(process.cwd(), "data", "app-data.json");
const headers = { "cache-control": "no-store" };

type Note = {
  id: string;
  groupId: string;
  text: string;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
};

async function readDB(): Promise<any> {
  try { return JSON.parse(await fs.readFile(DB_PATH,"utf8")); } catch { return {}; }
}
async function writeDB(db:any){ await fs.mkdir(path.dirname(DB_PATH),{recursive:true}); await fs.writeFile(DB_PATH, JSON.stringify(db,null,2)); }
function uid(){ return Math.random().toString(36).slice(2)+Date.now().toString(36); }

function getList(db:any): Note[] {
  const n = Array.isArray(db?.notities?.items) ? db.notities.items : [];
  const a = Array.isArray(db?.aantekeningen?.items) ? db.aantekeningen.items : [];
  // merge & normaliseer
  const map = new Map<string,Note>();
  for (const it of [...n, ...a]) {
    if (!it) continue;
    const id = String(it.id || uid());
    const groupId = String(it.groupId || it.groepId || "").trim();
    const text = String(it.text ?? it.opmerking ?? "");
    const createdAt = it.createdAt || new Date().toISOString();
    const updatedAt = it.updatedAt || createdAt;
    map.set(id, { id, groupId, text, archived: !!it.archived, createdAt, updatedAt });
  }
  return [...map.values()];
}
function setList(db:any, items:Note[]) {
  db.notities = { items }; db.aantekeningen = { items }; // beide up-to-date houden
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const gid = String(url.searchParams.get("groupId") || url.searchParams.get("groepId") || "").trim();
  const all = getList(await readDB());
  const items = gid && gid!=="list" ? all.filter(n => n.groupId===gid && !n.archived) : all.filter(n => !n.archived);
  // Sorteren: nieuwste eerst
  items.sort((a,b)=> b.updatedAt.localeCompare(a.updatedAt));
  return NextResponse.json({ items }, { headers });
}

export async function POST(req: Request) {
  const body = await req.json().catch(()=> ({}));
  const groupId = String(body.groupId || body.groepId || "").trim();
  const text = String(body.text || body.opmerking || "").trim();
  if (!groupId || !text) {
    return NextResponse.json({ error: "groupId én text zijn verplicht" }, { status: 400, headers });
  }
  const db = await readDB();
  const list = getList(db);
  const now = new Date().toISOString();
  const item: Note = { id: uid(), groupId, text, archived:false, createdAt: now, updatedAt: now };
  list.push(item);
  setList(db, list);
  await writeDB(db);
  // ⚠️ front-end verwacht { item } (j.item.text)
  return NextResponse.json({ ok:true, item }, { headers });
}
