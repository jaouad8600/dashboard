import { createLiveStore } from "./live";

export type MutatieType = "FITNESS_ALLEEN" | "SPORTVERBOD_TOTAAL";
export type MutatieStatus = "Open" | "In behandeling" | "Afgerond";

export type Mutatie = {
  id: string;
  titel: string;
  beschrijving?: string;
  datumISO: string;      // volledige ISO (UTC)
  type: MutatieType;
  status: MutatieStatus;
  groep?: string;
  auteur?: string;
};

export type SportMutatie = Mutatie;

function uid(prefix = "m") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
}

// Leeg starten om SSR/CSR mismatch te voorkomen
const DEFAULTS: Mutatie[] = [];

const store = createLiveStore<Mutatie[]>("mutaties:v2", DEFAULTS);

// Queries
export function listMutaties(): Mutatie[] { return store.get(); }
export function onMutatiesChange(cb: () => void) { return store.subscribe(cb); }

// Commands
export function createMutatie(input: Omit<Mutatie, "id" | "datumISO" | "status"> & { status?: MutatieStatus }) {
  const m: Mutatie = {
    id: uid(),
    datumISO: new Date().toISOString(),
    status: input.status ?? "Open",
    ...input,
  };
  store.set((arr) => [m, ...arr]);
  return m;
}

export function patchMutatie(id: string, patch: Partial<Omit<Mutatie, "id" | "datumISO">>) {
  store.set((arr) => arr.map((m) => (m.id === id ? { ...m, ...patch } : m)));
}
export function deleteMutatie(id: string) {
  store.set((arr) => arr.filter((m) => m.id !== id));
}
export function setStatus(id: string, status: MutatieStatus) { patchMutatie(id, { status }); }
export function setType(id: string, type: MutatieType) { patchMutatie(id, { type }); }
