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
const uid = () => "i_" + Math.random().toString(36).slice(2) + Date.now().toString(36);

export async function GET(req: NextRequest) {
  const db = await readDB();
  const { searchParams } = new URL(req.url);
  const includeArchived = searchParams.get("archived") === "1" || searchParams.get("all") === "1";
  const q = (searchParams.get("q") || "").toLowerCase();
  const groepId = searchParams.get("groepId") || searchParams.get("groupId") || "";

  let items = Array.isArray(db?.indicaties?.items) ? db.indicaties.items : [];
  if (!includeArchived) items = items.filter((x: any) => !x.archived);
  if (groepId) items = items.filter((x: any) => String(x.groepId || "") === String(groepId));
  if (q) {
    items = items.filter((x: any) =>
      [x.naam, x.type, x.status, x.opmerking].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }
  items.sort((a: any, b: any) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));
  return NextResponse.json(items, { headers: { "cache-control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const naam = String(body?.naam || "").trim();
  if (!naam) return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });

  const db = await readDB();
  db.indicaties = db.indicaties || { items: [] };
  if (!Array.isArray(db.indicaties.items)) db.indicaties.items = [];

  const now = new Date().toISOString();
  const item = {
    id: uid(),
    naam,
    type: String(body?.type || "").trim(),
    status: (body?.status || "open") as "open" | "in-behandeling" | "afgehandeld",
    groepId: body?.groepId ?? body?.groupId ?? null,
    start: body?.start ?? null,
    eind: body?.eind ?? null,
    opmerking: String(body?.opmerking || "").trim() || null,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };

  db.indicaties.items.unshift(item);
  await writeDB(db);
  return NextResponse.json(item, { status: 201, headers: { "cache-control": "no-store" } });
}