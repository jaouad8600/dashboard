import { load, save } from "./storage";

export type Materiaal = {
  id: string;
  naam: string;
  aantal: number;
  locatie: string;
  status: string;
};

const KEY = "sportdash_materialen";

export function listMaterialen(): Materiaal[] {
  return load<Materiaal[]>(KEY, []);
}

export function addMateriaal(m: { naam: string; aantal: number; locatie: string; status: string }) {
  const list = listMaterialen();
  const newItem: Materiaal = { id: crypto.randomUUID(), ...m };
  list.unshift(newItem);
  save(KEY, list);
  return newItem;
}

export function updateMateriaal(id: string, update: Partial<Materiaal>) {
  const list = listMaterialen().map(m => (m.id === id ? { ...m, ...update } : m));
  save(KEY, list);
}

export function deleteMateriaal(id: string) {
  save(KEY, listMaterialen().filter(m => m.id !== id));
}

export function duplicateMateriaal(id: string) {
  const list = listMaterialen();
  const orig = list.find(m => m.id === id);
  if (!orig) return;
  const copy = { ...orig, id: crypto.randomUUID(), naam: orig.naam + " (kopie)" };
  list.unshift(copy);
  save(KEY, list);
}
