/**
 * Client-only storage helpers voor Sportdash.
 * SSR geeft lege defaults; alle browser-API's zitten achter guards.
 */

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

export type SportMutation = {
  id: string;
  group: string;
  title?: string;
  status?: "open" | "gesloten";
  createdAt?: string;
};

export type Restriction = {
  id: string;
  group: string;
  label: string;
  note?: string;
  active: boolean;
  until?: string;
};

/** Standaard groepen (vul aan naar wens) */
export const GROUPS = [
  "Gaag","Golf","Kust","Lier","Nes","Vliet","Poel","Zijl",
  "Duin","Kade","Kreek","Lei","Rak","Zift","Bron","Burcht","Balk"
];

const K_EVENTS = "rbc-events-v1";
const K_GROUP  = "active-group";
const K_SMUT   = "sportmutaties-v1";
const K_RESTR  = "restrictions-v1";
const K_SRESTR = "sport-restrictions-v1";
const K_VISITS = "visits-v1";
const K_FILES  = "files-links-v1";
const K_LOGS   = "logs-v1";

export const isBrowser = typeof window !== "undefined";

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}
function writeJSON(key: string, value: unknown) {
  if (!isBrowser) return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/* ===== Events ===== */
export function loadEvents(): CalEvent[] {
  const arr = readJSON<any[]>(K_EVENTS, []);
  return arr.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) }));
}
export function saveEvents(events: CalEvent[]): void {
  const out = events.map(e => ({
    ...e,
    start: e.start instanceof Date ? e.start.toISOString() : e.start,
    end: e.end instanceof Date ? e.end.toISOString() : e.end,
  }));
  writeJSON(K_EVENTS, out);
}

/* ===== Actieve groep ===== */
export function getActiveGroup(): string | null {
  const v = readJSON<string | null>(K_GROUP, null);
  return typeof v === "string" ? v : null;
}
export function setActiveGroup(group: string | null): void {
  if (!isBrowser) return;
  if (group == null) { try { localStorage.removeItem(K_GROUP); } catch {} }
  else { writeJSON(K_GROUP, group); }
}

/* ===== Sportmutaties ===== */
export function loadSportmutaties(): SportMutation[] {
  return readJSON<SportMutation[]>(K_SMUT, []);
}
export function countOpenSportmutaties(): number {
  const all = loadSportmutaties();
  return all.filter(m => (m.status || "open") !== "gesloten").length;
}

/* ===== Indicaties ===== */
export function loadRestrictions(): Restriction[] {
  return readJSON<Restriction[]>(K_RESTR, []);
}
export function loadSportRestrictions(): Restriction[] {
  return readJSON<Restriction[]>(K_SRESTR, []);
}

/* ===== Visits / Files / Logs ===== */
export function loadVisits(): any[] { return readJSON<any[]>(K_VISITS, []); }
export function loadFiles(): any[] { return readJSON<any[]>(K_FILES, []); }
export function loadLogs(): any[] { return readJSON<any[]>(K_LOGS, []); }

/* ===== Utils ===== */
export function makeEvent(partial: Partial<CalEvent>): CalEvent {
  const id =
    partial.id ||
    (isBrowser && "crypto" in window && (window as any).crypto?.randomUUID
      ? (window as any).crypto.randomUUID()
      : `ev_${Date.now()}_${Math.random().toString(16).slice(2)}`);

  const start = partial.start instanceof Date ? partial.start : new Date(partial.start || Date.now());
  const end   = partial.end   instanceof Date ? partial.end   : new Date(partial.end   || Date.now());

  return {
    id,
    title: partial.title || "Sportmoment",
    start,
    end,
    tide: (partial.tide as Tide) || "eb",
    group: partial.group || (getActiveGroup() || "Onbekend"),
    staff: partial.staff || [],
  };
}
