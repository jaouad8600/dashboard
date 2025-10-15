import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const DB_PATH = path.join(process.cwd(), "data", "app-data.json");
const headers = { "cache-control": "no-store" };

async function readDB(): Promise<any> {
  try { return JSON.parse(await fs.readFile(DB_PATH, "utf8")); } catch { return {}; }
}
function toDate(i: any): Date | null {
  const cand = i?.date ? new Date(i.date + "T00:00:00") : (i?.updatedAt ? new Date(i.updatedAt) : (i?.createdAt ? new Date(i.createdAt) : null));
  if (!cand || Number.isNaN(+cand)) return null;
  return cand;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const groepId = url.searchParams.get("groepId") || url.searchParams.get("groupId") || undefined;

  const db = await readDB();
  const all: any[] = Array.isArray(db?.sportmomenten?.items) ? db.sportmomenten.items : [];

  const items = all.filter((x) => (groepId ? (x.groepId || x.groupId) === groepId : true) && x.value === true);

  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(); // 0..11
  const startThisMonth = new Date(y, m, 1);
  const endThisMonth   = new Date(y, m + 1, 0, 23, 59, 59, 999);

  const startPrevMonth = new Date(y, m - 1, 1);
  const endPrevMonth   = new Date(y, m, 0, 23, 59, 59, 999);

  const startThisYear  = new Date(y, 0, 1);
  const last30         = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const inRange = (d: Date | null, a: Date, b: Date) => (d ? +d >= +a && +d <= +b : false);

  let dezeMaand = 0, vorigeMaand = 0, ditJaar = 0, laatste30 = 0, totaal = 0;
  for (const i of items) {
    const d = toDate(i);
    totaal += 1;
    if (d) {
      if (inRange(d, startThisMonth, endThisMonth)) dezeMaand += 1;
      if (inRange(d, startPrevMonth, endPrevMonth)) vorigeMaand += 1;
      if (+d >= +startThisYear && +d <= +now) ditJaar += 1;
      if (+d >= +last30 && +d <= +now) laatste30 += 1;
    }
  }

  return NextResponse.json({ dezeMaand, vorigeMaand, ditJaar, laatste30Dagen: laatste30, totaal }, { headers });
}
