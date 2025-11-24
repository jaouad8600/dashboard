import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { generateStandingEvents, mergeWithRecurring } from "../../../server/standingSchedule";

function headers() {
  return { "Cache-Control": "no-store", "Content-Type": "application/json" };
}
function loadDb() {
  const p = path.join(process.cwd(), "data", "app-data.json");
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return {}; }
}
function between(items: any[], start?: string | null, end?: string | null) {
  if (!start || !end) return items;
  return items.filter((it: any) => {
    const s = String(it?.start ?? "");
    return s >= start && s < end;
  });
}
function dayRangeFrom(dateStr?: string | null) {
  const base = dateStr ? new Date(dateStr as string) : new Date();
  const y = base.getFullYear(), m = base.getMonth() + 1, d = base.getDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  const off = "+02:00";
  const start = `${y}-${pad(m)}-${pad(d)}T00:00:00${off}`;
  const end   = `${y}-${pad(m)}-${pad(d)}T24:00:00${off}`;
  return { start, end };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const date = searchParams.get("date");

  const range = (start && end) ? { start, end } : dayRangeFrom(date);

  const db = loadDb();
  const raw = Array.isArray(db?.planning?.items) ? db.planning.items
            : Array.isArray(db?.planning)       ? db.planning
            : [];
  const stored = between(raw, range.start, range.end);

  const recurring = generateStandingEvents(range.start, range.end);
  const items = mergeWithRecurring(stored, recurring);

  items.sort((a: any, b: any) => String(a?.start ?? "").localeCompare(String(b?.start ?? "")));

  return NextResponse.json({ items }, { headers: headers() });
}
