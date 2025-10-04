"use client";

export type Sportmutatie = {
  id: string;
  group: string;     // bv. "Poel"
  naam: string;      // bv. "Stefan (erick)"
  arts?: string;     // bv. "Medische dienst"
  soort: string;     // bv. "Niet sporten • enkel blessure"
  notitie?: string;  // optioneel
  ts: number;        // timestamp (ms)
  actief: boolean;   // true = actief
};

const KEY = "sportmutaties";
const EVT = "sportmutaties:changed";

function read(): Sportmutatie[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as Sportmutatie[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function write(list: Sportmutatie[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVT));
}
function uid() {
  try { // @ts-ignore
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {}
  return `sm_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
}

export function getSportmutaties(): Sportmutatie[] {
  // sorteer nieuwste eerst
  return read().sort((a,b)=> b.ts - a.ts);
}

let lastSig = "";
let lastAt = 0;

/**
 * Voeg één sportmutatie toe.
 * Anti-dubbel: als exact dezelfde payload binnen 800ms nog eens komt, negeren.
 */
export function addSportmutatie(input: {
  group: any;
  naam: any;
  arts?: any;
  soort: any;
  notitie?: any;
  ts?: number;
}) {
  const group = String(input.group ?? "").trim();
  const naam = String(input.naam ?? "").trim();
  const arts = input.arts != null ? String(input.arts).trim() : undefined;
  const soort = String(input.soort ?? "").trim();
  const notitie = input.notitie != null ? String(input.notitie).trim() : undefined;
  const ts = Number.isFinite(input.ts as any) ? Number(input.ts) : Date.now();

  if (!group || !naam || !soort) throw new Error("Ontbrekende velden (group/naam/soort)");

  // anti-dubbel
  const sig = JSON.stringify([group, naam, arts, soort, notitie]);
  const now = Date.now();
  if (sig === lastSig && now - lastAt < 800) {
    return null; // negeer duplicaat
  }
  lastSig = sig; lastAt = now;

  const item: Sportmutatie = {
    id: uid(),
    group, naam, arts, soort, notitie,
    ts,
    actief: true,
  };

  const list = read();
  write([item, ...list]);
  return item;
}

export function removeSportmutatie(id: string) {
  write(read().filter(m => m.id !== id));
}

export function setActief(id: string, actief: boolean) {
  write(read().map(m => (m.id === id ? { ...m, actief } : m)));
}

export function onSportmutatiesChange(cb: () => void) {
  const h = () => cb();
  const s = (e: StorageEvent) => { if (e.key === KEY) cb(); };
  window.addEventListener(EVT, h as EventListener);
  window.addEventListener("storage", s);
  return () => {
    window.removeEventListener(EVT, h as EventListener);
    window.removeEventListener("storage", s);
  };
}
