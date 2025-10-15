import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const DB_PATH = path.join(process.cwd(), "data", "app-data.json");
const headers = { "cache-control": "no-store" };

type Item = {
  id: string;          // groupId + '#' + date
  groupId: string;
  date: string;        // YYYY-MM-DD
  value: boolean;      // true = sportmoment
  updatedAt: string;
};

/** Normaliseer allerlei datumvormen naar 'YYYY-MM-DD' */
function normDate(input?: string | number | Date): string | null {
  if (!input) return null;
  let s = String(input).trim();

  // Als het al YYYY-MM-DD is
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) {
    const y = +m[1], mo = +m[2], d = +m[3];
    if (mo>=1 && mo<=12 && d>=1 && d<=31) {
      const dt = new Date(Date.UTC(y, mo-1, d));
      const mm = String(mo).padStart(2,"0");
      const dd = String(d).padStart(2,"0");
      return `${dt.getUTCFullYear()}-${mm}-${dd}`;
    }
    return null;
  }

  // DD-MM-YYYY of DD/MM/YYYY
  m = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(s);
  if (m) {
    const d=+m[1], mo=+m[2], y=+m[3];
    if (mo>=1 && mo<=12 && d>=1 && d<=31) {
      const dt = new Date(Date.UTC(y, mo-1, d));
      const mm = String(mo).padStart(2,"0");
      const dd = String(d).padStart(2,"0");
      return `${dt.getUTCFullYear()}-${mm}-${dd}`;
    }
    return null;
  }

  // Laatste redmiddel: Date-parsen en terugzetten naar YYYY-MM-DD (UTC)
  const dt = new Date(s);
  if (isNaN(+dt)) return null;
  const y = dt.getUTCFullYear();
  const mo = String(dt.getUTCMonth()+1).padStart(2,"0");
  const d = String(dt.getUTCDate()).padStart(2,"0");
  return `${y}-${mo}-${d}`;
}

async function readDB(): Promise<any> {
  try { return JSON.parse(await fs.readFile(DB_PATH, "utf8")); } catch { return {}; }
}
async function writeDB(db:any) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db,null,2));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const groupId = url.searchParams.get("groupId") || url.searchParams.get("groepId") || "";
  const start   = url.searchParams.get("start");   // YYYY-MM-DD
  const end     = url.searchParams.get("end");     // YYYY-MM-DD

  const db = await readDB();
  let items: Item[] = Array.isArray(db?.sportmomenten?.items) ? db.sportmomenten.items : [];

  if (groupId) items = items.filter(i => i.groupId === groupId);

  const nStart = start ? normDate(start) : null;
  const nEnd   = end   ? normDate(end)   : null;

  if (nStart && nEnd) {
    items = items.filter(i => i.date >= nStart && i.date <= nEnd);
  }

  // Sorteer recentst bovenaan
  items.sort((a,b)=> b.updatedAt.localeCompare(a.updatedAt));

  return NextResponse.json({ items }, { headers });
}

export async function POST(req: Request) {
  const body = await req.json().catch(()=> ({}));
  const groupId = String(body.groupId || body.groepId || "").trim();
  const dateNorm = normDate(body.date || body.datum);
  const value = body.value === true || body.value === 1 || body.value === "1" || body.value === "true";

  if (!groupId || !dateNorm) {
    return NextResponse.json({ error: "groupId en date zijn verplicht (date als YYYY-MM-DD of DD-MM-YYYY)" }, { status: 400, headers });
  }

  const db = await readDB();
  db.sportmomenten = db.sportmomenten || { items: [] };
  const list: Item[] = Array.isArray(db.sportmomenten.items) ? db.sportmomenten.items : [];

  const id = `${groupId}#${dateNorm}`;
  const idx = list.findIndex(i => i.id === id);

  if (!value) {
    // uitvinken = record weghalen (houd data schoon)
    if (idx !== -1) {
      list.splice(idx, 1);
    }
  } else {
    const updated: Item = {
      id,
      groupId,
      date: dateNorm,
      value: true,
      updatedAt: new Date().toISOString(),
    };
    if (idx === -1) list.push(updated);
    else list[idx] = updated;
  }

  db.sportmomenten.items = list;
  await writeDB(db);

  return NextResponse.json({ ok: true }, { headers });
}
