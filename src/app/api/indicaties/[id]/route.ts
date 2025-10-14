import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";
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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const db = await readDB();
  const items = Array.isArray(db?.indicaties?.items) ? db.indicaties.items : [];
  const it = items.find((x: any) => String(x.id) === String(params.id));
  if (!it) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json(it, { headers: { "cache-control": "no-store" } });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const patch = await req.json().catch(() => ({}));
  const db = await readDB();
  const items = Array.isArray(db?.indicaties?.items) ? db.indicaties.items : [];
  const idx = items.findIndex((x: any) => String(x.id) === String(params.id));
  if (idx === -1) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const cur = items[idx];
  const next = {
    ...cur,
    naam: patch.naam ?? cur.naam,
    type: patch.type ?? cur.type,
    status: patch.status ?? cur.status,
    groepId: patch.groepId ?? patch.groupId ?? cur.groepId ?? null,
    start: patch.start ?? cur.start ?? null,
    eind: patch.eind ?? cur.eind ?? null,
    opmerking: patch.opmerking ?? cur.opmerking ?? null,
    archived: typeof patch.archived === "boolean" ? patch.archived : cur.archived ?? false,
    updatedAt: new Date().toISOString(),
  };
  items[idx] = next;
  db.indicaties.items = items;
  await writeDB(db);
  return NextResponse.json(next, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  // alleen archiveren/terughalen
  const body = await req.json().catch(() => ({}));
  return PUT(new Request("http://x", { method: "PUT", body: JSON.stringify({ archived: !!body.archived }) }) as any, ctx);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const db = await readDB();
  const items = Array.isArray(db?.indicaties?.items) ? db.indicaties.items : [];
  const idx = items.findIndex((x: any) => String(x.id) === String(params.id));
  if (idx === -1) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  const [removed] = items.splice(idx, 1);
  db.indicaties.items = items;
  await writeDB(db);
  return NextResponse.json({ ok: true, removed }, { headers: { "cache-control": "no-store" } });
}