import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const DB_PATH = path.join(process.cwd(), "data", "app-data.json");
const headers = { "cache-control": "no-store" };

function parseYMD(d:string): {y:number,m:number,day:number,ts:number} | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return null;
  const y = +m[1], mo = +m[2], day = +m[3];
  if (mo<1||mo>12||day<1||day>31) return null;
  const ts = Date.UTC(y, mo-1, day); // middernacht UTC
  return { y, m: mo, day, ts };
}

export async function GET(req: Request){
  const url = new URL(req.url);
  const groupId = String(url.searchParams.get("groepId") || url.searchParams.get("groupId") || "").trim();

  let db:any={};
  try { db = JSON.parse(await fs.readFile(DB_PATH,"utf8")); } catch {}
  const all = Array.isArray(db?.sportmomenten?.items) ? db.sportmomenten.items : [];

  const items = (groupId ? all.filter((i:any)=> i.groupId===groupId) : all).filter((i:any)=> i.value===true);

  const now = new Date();                       // lokale 'nu'
  const year = now.getFullYear();
  const month = now.getMonth()+1;               // 1..12

  // vorige maand
  const prevMonth = month === 1 ? 12 : month-1;
  const prevYear  = month === 1 ? year-1 : year;

  // laatste 30 dagen (inclusief vandaag)
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const last30Start = todayUTC - 29*24*3600*1000;

  let totaal = 0, dezeMaand=0, vorigeMaand=0, ditJaar=0, laatste30=0;

  for (const it of items) {
    const p = parseYMD(String(it.date||""));
    if (!p) continue; // sla ongeldige datums over

    totaal += 1;

    if (p.y === year) ditJaar += 1;
    if (p.y === year && p.m === month) dezeMaand += 1;
    if (p.y === prevYear && p.m === prevMonth) vorigeMaand += 1;
    if (p.ts >= last30Start && p.ts <= todayUTC) laatste30 += 1;
  }

  return NextResponse.json(
    { groepId: groupId || null, totaal, dezeMaand, vorigeMaand, ditJaar, laatste30Dagen: laatste30 },
    { headers }
  );
}
