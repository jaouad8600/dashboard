import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');

async function readDB(): Promise<any> {
  try { return JSON.parse(await fs.readFile(DB_PATH, 'utf8')); } catch { return {}; }
}
async function writeDB(db: any) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}
function normKleur(v: string | undefined): string | null {
  if (!v) return null;
  const x = v.toLowerCase();
  if (['groen','green'].includes(x))   return 'groen';
  if (['geel','yellow'].includes(x))   return 'geel';
  if (['oranje','orange'].includes(x)) return 'oranje';
  if (['rood','red'].includes(x))      return 'rood';
  return null;
}
function sameId(g: any, id: string) {
  const cand = String(g?.id ?? g?.slug ?? g?.name ?? g?.naam ?? '').toLowerCase();
  return cand === String(id).toLowerCase();
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const db = await readDB();
  const groepen = Array.isArray(db.groepen) ? db.groepen : (db.groups ?? []);
  const g = groepen.find((x: any) => sameId(x, params.id));
  if (!g) return NextResponse.json({ error: 'Groep niet gevonden' }, { status: 404 });
  return NextResponse.json(g);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const payload = await req.json().catch(() => ({} as any));
  const kleur = normKleur(payload.kleur ?? payload.color);
  if (!kleur) {
    return NextResponse.json({ error: "Ongeldige 'kleur' (groen|geel|oranje|rood)" }, { status: 400 });
  }

  const db = await readDB();
  const groepen = Array.isArray(db.groepen) ? db.groepen : (db.groups ?? []);
  const idx = groepen.findIndex((x: any) => sameId(x, params.id));
  if (idx === -1) return NextResponse.json({ error: 'Groep niet gevonden' }, { status: 404 });

  const cur = groepen[idx] || {};
  groepen[idx] = { ...cur, kleur };
  db.groepen = groepen; db.groups = groepen; // in sync houden
  await writeDB(db);

  return NextResponse.json({ ok: true, groep: groepen[idx] });
}
