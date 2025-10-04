import { createLiveStore } from "./live";

export type GroupColor = "green" | "orange" | "yellow" | "red";

export type Notitie = {
  id: string;
  text: string;
  author?: string;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
};

export type Groep = {
  id: string;
  naam: string;
  kleur: GroupColor;
  notities: Notitie[];
  aangemaaktOp: string; // ISO
};

function uid(prefix = "g") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
}

const DEFAULT_NAMEN = [
  // 🌊 Eb
  "Eb","Poel","Lier","Zijl","Nes","Vliet","Gaag",
  // 🌊 Vloed
  "Vloed","Kust","Golf","Zift","Lei","Kade","Kreek","Duin","Rak","Bron",
];

const DEFAULTS: Groep[] = DEFAULT_NAMEN.map((naam) => ({
  id: uid("grp"),
  naam,
  kleur: "green",
  notities: [],
  aangemaaktOp: new Date().toISOString(),
}));

// Store
const groepenStore = createLiveStore<Groep[]>("groepen:v1", DEFAULTS);

// === Query ===
export function listGroepen(): Groep[] { return groepenStore.get(); }
export function onGroepenChange(cb: () => void) { return groepenStore.subscribe(cb); }

// === Mutaties groep ===
export function createGroep(naam: string) {
  const g: Groep = { id: uid("grp"), naam, kleur: "green", notities: [], aangemaaktOp: new Date().toISOString() };
  groepenStore.set((arr) => [g, ...arr]);
  return g;
}
export function updateGroep(id: string, patch: Partial<Pick<Groep,"naam"|"kleur">>) {
  groepenStore.set((arr) => arr.map((g) => g.id === id ? { ...g, ...patch } : g));
}
export function setKleur(id: string, kleur: GroupColor) { updateGroep(id, { kleur }); }
export function removeGroep(id: string) { groepenStore.set((arr) => arr.filter((g) => g.id !== id)); }

// === Notities ===
export function addGroepNotitie(groepId: string, text: string, author?: string) {
  const note: Notitie = { id: uid("note"), text, author: author?.trim() || "Onbekend", createdAt: new Date().toISOString() };
  groepenStore.set((arr) =>
    arr.map((g) => g.id === groepId ? { ...g, notities: [note, ...g.notities] } : g)
  );
  return note;
}

export function updateGroepNotitie(groepId: string, noteId: string, patch: Partial<Pick<Notitie,"text"|"author">>) {
  groepenStore.set((arr) =>
    arr.map((g) => g.id === groepId
      ? {
          ...g,
          notities: g.notities.map((n) =>
            n.id === noteId ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
          ),
        }
      : g
    )
  );
}

export function removeGroepNotitie(groepId: string, noteId: string) {
  groepenStore.set((arr) =>
    arr.map((g) => g.id === groepId ? { ...g, notities: g.notities.filter((n) => n.id !== noteId) } : g)
  );
}

export { groepenStore };
export type { Groep as GroepType, Notitie as NotitieType };
