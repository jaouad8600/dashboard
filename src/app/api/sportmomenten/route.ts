import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');
async function readDB(): Promise<any> { try { return JSON.parse(await fs.readFile(DB_PATH,'utf8')); } catch { return {}; } }
async function writeDB(db: any) { await fs.mkdir(path.dirname(DB_PATH),{recursive:true}); await fs.writeFile(DB_PATH, JSON.stringify(db,null,2)); }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groepId = searchParams.get('groepId');
  const db = await readDB();
  const items = Array.isArray(db?.sportmomenten?.items) ? db.sportmomenten.items : [];
  const out = groepId ? items.filter((x: any) => x.groepId === groepId) : items;
  return NextResponse.json({ items: out });
}

export async function POST(req: Request) {
  const { groepId, datum, aanwezig } = await req.json().catch(() => ({}));
  if (!groepId || !datum) {
    return NextResponse.json({ error: 'groepId en datum verplicht' }, { status: 400 });
  }
  const db = await readDB();
  db.sportmomenten = db.sportmomenten || { items: [] };
  if (!Array.isArray(db.sportmomenten.items)) db.sportmomenten.items = [];
  const key = `${groepId}:${datum}`;
  const idx = db.sportmomenten.items.findIndex((x: any) => x.id === key);
  const row = { id: key, groepId, datum, aanwezig: !!aanwezig };
  if (idx === -1) db.sportmomenten.items.push(row); else db.sportmomenten.items[idx] = row;
  await writeDB(db);
  return NextResponse.json({ ok: true, item: row });
}
