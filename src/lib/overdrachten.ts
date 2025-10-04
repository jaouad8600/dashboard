import { createLiveStore } from "./live";

export type Overdracht = {
  id: string;
  datumISO: string; // YYYY-MM-DD (UTC)
  tijd: string;     // HH:MM (24u)
  auteur?: string;
  bericht: string;
  belangrijk?: boolean;
};

function uid(prefix = "o") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
}

// Leeg starten om SSR/CSR mismatch te voorkomen
const DEFAULTS: Overdracht[] = [];

const overdrachtenStore = createLiveStore<Overdracht[]>("overdrachten:v1", DEFAULTS);

// Queries
export function listOverdrachten(): Overdracht[] { return overdrachtenStore.get().slice().sort((a,b)=> (b.datumISO+b.tijd).localeCompare(a.datumISO+a.tijd)); }
export function onOverdrachtenChange(cb: () => void) { return overdrachtenStore.subscribe(cb); }

// Commands
export function createOverdracht(input: Omit<Overdracht, "id" | "datumISO" | "tijd"> & { datumISO?: string; tijd?: string }) {
  const now = new Date();
  const isoDate = input.datumISO ?? now.toISOString().slice(0,10);             // UTC-datum
  const hhmm = input.tijd ?? `${String(now.getUTCHours()).padStart(2,"0")}:${String(now.getUTCMinutes()).padStart(2,"0")}`; // stabiel
  const o: Overdracht = { id: uid(), datumISO: isoDate, tijd: hhmm, bericht: input.bericht, auteur: input.auteur, belangrijk: input.belangrijk ?? false };
  overdrachtenStore.set((arr) => [o, ...arr]);
  return o;
}
export function patchOverdracht(id: string, patch: Partial<Omit<Overdracht, "id">>) {
  overdrachtenStore.set((arr) => arr.map((o) => (o.id === id ? { ...o, ...patch } : o)));
}
export function deleteOverdracht(id: string) {
  overdrachtenStore.set((arr) => arr.filter((o) => o.id !== id));
}
