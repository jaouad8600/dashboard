import { createLiveStore } from "./live";

export const LOCATIES = [
  "Dojo Eb",
  "Dojo Vloed",
  "Magazijn",
  "Werkplaats",
  "Gymzaal",
] as const;
export const STATUSES = ["Goed", "Defect", "Besteld", "Topdesk"] as const;
export type Status = (typeof STATUSES)[number];

export type Materiaal = {
  id: string;
  naam: string;
  locatie?: (typeof LOCATIES)[number];
  status: Status;
  notitie?: string;
  aangemaaktOp: string; // ISO
};

const DEFAULTS: Materiaal[] = [
  {
    id: crypto.randomUUID(),
    naam: "Basketbal",
    locatie: "Gymzaal",
    status: "Goed",
    aangemaaktOp: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    naam: "Matrassen",
    locatie: "Magazijn",
    status: "Goed",
    aangemaaktOp: new Date().toISOString(),
  },
];

const store = createLiveStore<Materiaal[]>("materialen", DEFAULTS);

export function getMaterials() {
  return store.get();
}
export function onMaterialsChange(cb: () => void) {
  return store.subscribe(cb);
}
export function addMaterial(data: Omit<Materiaal, "id" | "aangemaaktOp">) {
  const item: Materiaal = {
    ...data,
    id: crypto.randomUUID(),
    aangemaaktOp: new Date().toISOString(),
  };
  store.set((prev) => [item, ...prev]);
  return item;
}
export function updateMaterial(id: string, patch: Partial<Materiaal>) {
  store.set((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
}
export function removeMaterial(id: string) {
  store.set((prev) => prev.filter((m) => m.id !== id));
}
export function setStatus(id: string, status: Status) {
  updateMaterial(id, { status });
}

export { store as materialsStore };
export type { Materiaal as MateriaalType };
