// src/lib/wk.ts — helpers, groepen, week-opslag
export type Tide = "eb" | "vloed";
export type CalEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  tide: Tide;
  group: string;
  staff?: string[];
};

export const VLOED_GROUPS = [
  "Bron",
  "Lei",
  "Rak",
  "Dijk",
  "Duin",
  "Kade",
  "Kreek",
];
export const EB_GROUPS = [
  "Kust",
  "Lier",
  "Nes",
  "Poel A",
  "Poel B",
  "Vliet",
  "Zijl",
  "Gaag",
  "Golf",
];
export const GROUPS_OFFICIAL = Array.from(
  new Set([...VLOED_GROUPS, ...EB_GROUPS]),
).sort((a, b) => a.localeCompare(b, "nl"));

export function normalizeGroup(s: string) {
  if (!s) return s;
  s = s.trim().replace(/^de\s+/i, "");
  s = s
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
  const map: Record<string, string> = {

    "Poel a": "Poel A",
    "Poel b": "Poel B",
  };
  if (map[s]) s = map[s];
  if (GROUPS_OFFICIAL.includes(s)) return s;
  return (
    GROUPS_OFFICIAL.find((g) => g.toLowerCase().startsWith(s.toLowerCase())) ||
    s
  );
}

export function monday(d: Date) {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  const diff = (m.getDay() + 6) % 7;
  m.setDate(m.getDate() - diff);
  return m;
}
export function getWeekKey(d: Date) {
  const m = monday(d),
    y = m.getFullYear(),
    mo = String(m.getMonth() + 1).padStart(2, "0"),
    da = String(m.getDate()).padStart(2, "0");
  return `week-${y}-${mo}-${da}`;
}

export const DURATION_MIN = 45;
export const TIMES = ["16:45", "17:45", "19:45"];

type SerEvent = Omit<CalEvent, "start" | "end"> & {
  start: string;
  end: string;
};
const OV_KEY = "week-overrides-v1";
function lsGetObj(k: string) {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(k) || "{}") || {};
  } catch {
    return {};
  }
}
function lsSetObj(k: string, v: any) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch { }
  }
}
const wkKey = (w: Date, t: Tide) => `${getWeekKey(w)}-${t}`;

export function saveOverrides(weekMon: Date, tide: Tide, events: CalEvent[]) {
  const db = lsGetObj(OV_KEY);
  db[wkKey(weekMon, tide)] = events.map((e) => ({
    ...e,
    start: new Date(e.start).toISOString(),
    end: new Date(e.end).toISOString(),
  }));
  lsSetObj(OV_KEY, db);
}

export function loadOverrides(weekMon: Date, tide: Tide): CalEvent[] {
  const db = lsGetObj(OV_KEY),
    arr = (db[wkKey(weekMon, tide)] || []) as SerEvent[];
  return arr.map((e) => ({
    ...e,
    start: new Date(e.start),
    end: new Date(e.end),
  }));
}

export type BaseSlot = { time: string; group: string };
export function getBasePlan(_t: Tide): Record<number, BaseSlot[]> {
  return { 1: [], 2: [], 3: [], 4: [], 5: [] };
}
