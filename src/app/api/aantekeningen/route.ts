import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
const DB_PATH = path.join(process.cwd(), "data", "app-data.json");
const headers = { "cache-control": "no-store" };

async function readDB(): Promise<any> {
  try { return JSON.parse(await fs.readFile(DB_PATH, "utf8")); } catch { return {}; }
}
async function writeDB(db: any) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const groupId = url.searchParams.get("groupId") || url.searchParams.get("groepId") || url.searchParams.get("id") || undefined;
  const archived = url.searchParams.get("archived");
  const db = await readDB();
  let items: any[] = Array.isArray(db?.aantekeningen?.items) ? db.aantekeningen.items : [];
  if (groupId) items = items.filter((x) => x.groupId === groupId);
  if (archived === "true") items = items.filter((x) => x.archived === true);
  if (archived === "false") items = items.filter((x) => x.archived !== true);
  items.sort((a,b) => (b.updatedAt||b.createdAt||"").localeCompare(a.updatedAt||a.createdAt||""));
  return NextResponse.json({ items }, { headers });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const j = body?.item ? body.item : body;
  const groupId = j.groupId || j.groepId;
  const text = j.text ?? j.opmerking ?? "";
  if (!groupId || String(text).trim() === "") {
    return NextResponse.json({ error: "groupId en text verplicht" }, { status: 400, headers });
  }
  const now = new Date().toISOString();
  const db = await readDB();
  db.aantekeningen = db.aantekeningen && Array.isArray(db.aantekeningen.items) ? db.aantekeningen : { items: [] };
  const item = { id: j.id || `${groupId}#${Date.now()}`, groupId, text, archived: !!j.archived, createdAt: now, updatedAt: now };
  db.aantekeningen.items.push(item);
  await writeDB(db);
  return NextResponse.json({ ok: true, item }, { headers });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const j = body?.item ? body.item : body;
  if (!j?.id) return NextResponse.json({ error: "id verplicht" }, { status: 400, headers });
  const db = await readDB();
  const idx = Array.isArray(db?.aantekeningen?.items) ? db.aantekeningen.items.findIndex((x:any)=>x.id===j.id) : -1;
  if (idx < 0) return NextResponse.json({ error: "Niet gevonden" }, { status: 404, headers });
  const now = new Date().toISOString();
  db.aantekeningen.items[idx] = { ...db.aantekeningen.items[idx], ...j, updatedAt: now };
  await writeDB(db);
  return NextResponse.json({ ok: true, item: db.aantekeningen.items[idx] }, { headers });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id verplicht" }, { status: 400, headers });
  const db = await readDB();
  if (!Array.isArray(db?.aantekeningen?.items)) return NextResponse.json({ ok: true }, { headers });
  db.aantekeningen.items = db.aantekeningen.items.filter((x:any)=>x.id!==id);
  await fs.writeFile(DB_PATH, JSON.stringify(db,null,2));
  return NextResponse.json({ ok: true }, { headers });
}
