import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const DB_PATH = path.join(process.cwd(), "data", "app-data.json");

async function readDB(): Promise<any> {
  try { return JSON.parse(await fs.readFile(DB_PATH, "utf8")); } catch { return {}; }
}
async function writeDB(db: any) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}
function normKleur(v?: string): string | null {
  if (!v) return null;
  const x = v.toLowerCase();
  if (['groen','green'].includes(x))   return 'groen';
  if (['geel','yellow'].includes(x))   return 'geel';
  if (['oranje','orange'].includes(x)) return 'oranje';
  if (['rood','red'].includes(x))      return 'rood';
  return null;
}

export async function GET() {
  const db = await readDB();
  const groepen = Array.isArray(db.groepen) ? db.groepen : (db.groups ?? []);
  return NextResponse.json(groepen, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = String(body?.id ?? "").trim();
  const kleur = normKleur(body?.kleur ?? body?.color);
  if (!id || !kleur) {
    return NextResponse.json({ error: "id en kleur verplicht" }, { status: 400, headers: { "cache-control": "no-store" } });
  }

  const db = await readDB();
  const groepen = Array.isArray(db.groepen) ? db.groepen : (db.groups ?? []);
  const idx = groepen.findIndex((g: any) => String(g?.id ?? g?.slug ?? g?.naam ?? g?.name ?? "").toLowerCase() === id.toLowerCase());
  if (idx === -1) return NextResponse.json({ error: "Groep niet gevonden" }, { status: 404, headers: { "cache-control": "no-store" } });

  groepen[idx] = { ...groepen[idx], kleur };
  db.groepen = groepen; db.groups = groepen;
  await writeDB(db);
  return NextResponse.json(groepen[idx], { headers: { "cache-control": "no-store" } });
}
