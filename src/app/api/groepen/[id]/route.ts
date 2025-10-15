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
function normKleur(v?: string): string | null {
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

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await readDB();
  const groepen = Array.isArray(db.groepen) ? db.groepen : (db.groups ?? []);
  const g = groepen.find((x: any) => sameId(x, id));
  if (!g) return NextResponse.json({ error: 'Groep niet gevonden' }, { status: 404, headers: { 'cache-control': 'no-store' } });
  return NextResponse.json(g, { headers: { 'cache-control': 'no-store' } });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const payload = await req.json().catch(() => ({} as any));
  const kleur = normKleur(payload.kleur ?? payload.color);
  if (!kleur) {
    return NextResponse.json({ error: "Ongeldige 'kleur' (groen|geel|oranje|rood)" }, { status: 400, headers: { 'cache-control': 'no-store' } });
  }

  const db = await readDB();
  const groepen = Array.isArray(db.groepen) ? db.groepen : (db.groups ?? []);
  const idx = groepen.findIndex((x: any) => sameId(x, id));
  if (idx === -1) return NextResponse.json({ error: 'Groep niet gevonden' }, { status: 404, headers: { 'cache-control': 'no-store' } });

  const cur = groepen[idx] || {};
  groepen[idx] = { ...cur, kleur };
  db.groepen = groepen; db.groups = groepen; // sync
  await writeDB(db);

  return NextResponse.json({ ok: true, groep: groepen[idx] }, { headers: { 'cache-control': 'no-store' } });
}
