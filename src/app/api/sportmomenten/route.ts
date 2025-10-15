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
function toISO(d?: string) {
  if (!d) return null;
  const t = new Date(d); if (Number.isNaN(+t)) return null;
  return t.toISOString();
}
function itemDateISO(i: any) {
  // bepaal een datum om op te filteren/tellen
  return (
    toISO(i?.updatedAt) ||
    toISO(i?.createdAt) ||
    (i?.date ? toISO(i.date + "T00:00:00") : null)
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const groepId = url.searchParams.get("groepId") || url.searchParams.get("groupId") || undefined;

  const db = await readDB();
  let items: any[] = Array.isArray(db?.sportmomenten?.items) ? db.sportmomenten.items : [];

  if (groepId) items = items.filter((x) => (x.groepId || x.groupId) === groepId);

  // Sorteer veilig (fallback naar datum of lege string)
  items.sort((a, b) => {
    const aa = itemDateISO(a) || "";
    const bb = itemDateISO(b) || "";
    return bb.localeCompare(aa);
  });

  return NextResponse.json({ items }, { headers });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // accepteer zowel vlak als { item: {...} }
  const j = body?.item ? body.item : body;

  const groepId = j.groepId || j.groupId;
  const date = j.date;      // verwacht 'YYYY-MM-DD'
  const value = typeof j.value === "boolean" ? j.value : j.checked === true ? true : !!j.v; // een paar aliassen

  if (!groepId || !date) {
    return NextResponse.json({ error: "groepId en date zijn verplicht" }, { status: 400, headers });
  }

  const now = new Date().toISOString();
  const db = await readDB();
  db.sportmomenten = db.sportmomenten && Array.isArray(db.sportmomenten.items) ? db.sportmomenten : { items: [] };

  const idx = db.sportmomenten.items.findIndex(
    (x: any) => (x.groepId || x.groupId) === groepId && x.date === date
  );

  if (idx >= 0) {
    db.sportmomenten.items[idx] = {
      ...db.sportmomenten.items[idx],
      groepId,
      date,
      value,
      updatedAt: now,
    };
  } else {
    db.sportmomenten.items.push({
      id: `${groepId}#${date}`,
      groepId,
      date,
      value,
      createdAt: now,
      updatedAt: now,
    });
  }

  await writeDB(db);
  const saved = db.sportmomenten.items.find((x: any) => (x.groepId || x.groupId) === groepId && x.date === date);
  return NextResponse.json({ ok: true, item: saved }, { headers });
}
