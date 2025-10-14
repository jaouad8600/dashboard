import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type Item = { id: string; groepId: string; datum: string };

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');

function loadDB() {
  let j: any = {};
  try { j = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch {}
  if (!Array.isArray(j.groepen) && Array.isArray(j.groups)) j.groepen = j.groups;
  if (!Array.isArray(j.groepen)) j.groepen = [];
  if (!j.sportmomenten || !Array.isArray(j.sportmomenten.items)) j.sportmomenten = { items: [] };
  return j as { groepen: any[]; sportmomenten: { items: Item[] } };
}
function saveDB(j: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(j, null, 2));
}

function iso(d: Date){ return d.toISOString().slice(0,10); }
function parseISOorNull(s?: string){ if(!s) return null; const d=new Date(s); return isNaN(d.getTime())?null:d; }

export async function GET(req: NextRequest) {
  const j = loadDB();
  const { searchParams } = new URL(req.url);
  const aggregate = searchParams.get('aggregate');
  const groupId = searchParams.get('groupId') || searchParams.get('groepId');

  // Stats: aggregate=1&groupId=<id>
  if (aggregate === '1') {
    if (!groupId) return NextResponse.json({ ok:false, error:'groupId vereist' }, { status: 400 });
    const now = new Date();
    const startThisYear = new Date(now.getFullYear(), 0, 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth()-1, 1);
    const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // laatste dag vorige maand

    const items = j.sportmomenten.items.filter(i => i.groepId === groupId);
    const allTime = items.length;

    const thisYear = items.filter(i => {
      const d = parseISOorNull(i.datum); if(!d) return false;
      return d >= startThisYear;
    }).length;

    const lastMonth = items.filter(i => {
      const d = parseISOorNull(i.datum); if(!d) return false;
      return d >= startLastMonth && d <= endLastMonth;
    }).length;

    return NextResponse.json({ ok:true, groupId, stats: { lastMonth, thisYear, allTime }}, { status: 200 });
  }

  // Lijst in bereik: ?start=YYYY-MM-DD&end=YYYY-MM-DD
  const start = parseISOorNull(searchParams.get('start')||undefined);
  const end   = parseISOorNull(searchParams.get('end')||undefined);

  let items = j.sportmomenten.items;
  if (start && end) {
    items = items.filter(i => {
      const d = parseISOorNull(i.datum); if(!d) return false;
      return d >= start && d <= end;
    });
  }
  return NextResponse.json({ ok:true, items }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const j = loadDB();
  const body = await req.json().catch(() => ({}));
  const groepId = (body.groepId || body.groupId || '').toString();
  const datum = (body.datum || body.date || '').toString().slice(0,10);
  const on = !!body.on;

  if (!groepId || !datum) {
    return NextResponse.json({ ok:false, error:'groepId en datum vereist' }, { status: 400 });
  }

  const key = `${groepId}:${datum}`;
  const idx = j.sportmomenten.items.findIndex((i: Item) => `${i.groepId}:${i.datum}` === key);

  if (on && idx === -1) {
    j.sportmomenten.items.push({ id: key, groepId, datum });
  } else if (!on && idx !== -1) {
    j.sportmomenten.items.splice(idx, 1);
  }
  saveDB(j);
  return NextResponse.json({ ok:true }, { status: 200 });
}
