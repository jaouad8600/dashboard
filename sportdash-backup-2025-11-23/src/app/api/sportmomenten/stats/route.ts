import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "app-data.json");
const TZ = "Europe/Amsterdam";

type MomentItem = {
  id?: string;
  groupId?: string;
  groepId?: string;
  date?: string;          // verwacht: YYYY-MM-DD van de cel
  checked?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function ymdFromLocal(d: Date) {
  const parts = new Intl.DateTimeFormat("nl-NL", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)?.value || "";
  const y = get("year");
  const m = get("month");
  const dd = get("day");
  return `${y}-${m}-${dd}`;
}

function normalizeYMD(item: MomentItem): string {
  // Gebruik altijd de cel-dag (date); val terug op updatedAt/createdAt
  const raw = item.date || item.updatedAt || item.createdAt;
  if (!raw) return ymdFromLocal(new Date(0));
  // Als het al YYYY-MM-DD is, laat staan:
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // Anders parse en normaliseer naar lokale YYYY-MM-DD
  return ymdFromLocal(new Date(raw));
}

function ym(ymd: string) {
  // "2025-10-15" -> "2025-10"
  return ymd.slice(0, 7);
}

function prevMonthYM(nowY: number, nowM1to12: number) {
  let y = nowY;
  let m = nowM1to12 - 1;
  if (m === 0) { m = 12; y -= 1; }
  return `${y}-${String(m).padStart(2, "0")}`;
}

function lastNDaysSet(n: number): Set<string> {
  const set = new Set<string>();
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    set.add(ymdFromLocal(d));
  }
  return set;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const groepId = (url.searchParams.get("groepId") || url.searchParams.get("groupId") || "").toLowerCase();

  // DB lezen
  let db: any = {};
  try { db = JSON.parse(await fs.readFile(DB_PATH, "utf8")); } catch {}
  const all: MomentItem[] = Array.isArray(db?.sportmomenten?.items) ? db.sportmomenten.items : [];

  // Filter op groep (als meegegeven)
  const items = all.filter(it => {
    const g = String(it.groupId ?? it.groepId ?? "").toLowerCase();
    return groepId ? g === groepId : true;
  });

  // Per-dag de LAATSTE status bepalen (toggle overschrijft)
  // key = groupId#YYYY-MM-DD  (of enkel dag als geen groepId filter)
  const lastPerDay = new Map<string, MomentItem>();
  for (const it of items) {
    const g = String(it.groupId ?? it.groepId ?? "").toLowerCase();
    const day = normalizeYMD(it);
    const key = (groepId ? day : `${g}#${day}`); // bij 1 groep is dag genoeg
    const cur = lastPerDay.get(key);
    const curTs = cur?.updatedAt || cur?.createdAt || "";
    const itTs = it.updatedAt || it.createdAt || "";
    if (!cur || (itTs > curTs)) {
      lastPerDay.set(key, it);
    }
  }

  // Alleen dagen die ECHT aangevinkt staan
  const checkedDays = Array.from(lastPerDay.values())
    .filter(it => Boolean(it?.checked))
    .map(it => normalizeYMD(it));

  const total = checkedDays.length;

  // Huidige jaar/maand in lokale tijd
  const now = new Date();
  const nowYMD = ymdFromLocal(now);
  const thisYM = ym(nowYMD);
  const thisY = nowYMD.slice(0, 4);
  const prevYM = (() => {
    const y = Number(thisY);
    const m = Number(thisYM.slice(5));
    return prevMonthYM(y, m);
  })();

  const dezeMaand = checkedDays.filter(d => ym(d) === thisYM).length;
  const vorigeMaand = checkedDays.filter(d => ym(d) === prevYM).length;
  const ditJaar = checkedDays.filter(d => d.startsWith(`${thisY}-`)).length;

  const last30 = lastNDaysSet(30);
  const laatste30Dagen = checkedDays.filter(d => last30.has(d)).length;

  const body = {
    groepId: groepId || null,
    totaal: total,
    dezeMaand,
    vorigeMaand,
    ditJaar,
    laatste30Dagen,
  };

  return NextResponse.json(body, { headers: { "cache-control": "no-store" } });
}
