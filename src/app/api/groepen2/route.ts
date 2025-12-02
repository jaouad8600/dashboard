import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { return { groepen: [], planning: { items: [] } }; }
}
function writeDB(db: any) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

function ensureSeed(db: any) {
  db.groepen = db.groepen || [];
  if (db.groepen.length === 0) {
    const ids = ['eb-lier', 'eb-poel-a', 'eb-poel-b', 'vloed-kade', 'eb-golf', 'eb-gaag', 'vloed-zift', 'eb-kust', 'vloed-kreek', 'vloed-lei', 'eb-nes', 'eb-vliet', 'vloed-duin'];
    db.groepen = ids.map(id => ({ id, naam: id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), kleurHex: '#888888' }));
    writeDB(db);
  }
}

export async function GET() {
  const db = readDB();
  ensureSeed(db);
  const rows = (db.groepen || []).map((g: any) => ({
    id: g.id,
    naam: g.naam || g.name || g.title || g.id,
    kleurHex: g.kleurHex || g.kleur || g.color || '#888888',
  }));
  return NextResponse.json(rows);
}
