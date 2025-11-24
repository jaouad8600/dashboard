import { readJSON, writeJSON, uid } from "./store";

export type Mutatie = {
  id: string;
  titel: string;
  groep?: string;
  datumISO: string;
  status: "open" | "in_behandeling" | "afgerond";
  opmerking?: string;
  belangrijk?: boolean;
};

const FILE = "mutaties.json";

export async function loadMutaties(): Promise<Mutatie[]> {
  return await readJSON<Mutatie[]>(FILE, []);
}

export async function saveMutaties(list: Mutatie[]) {
  await writeJSON(FILE, list);
}

export async function addMutatie(
  m: Omit<Mutatie, "id" | "datumISO"> & { datumISO?: string },
) {
  const list = await loadMutaties();
  const item: Mutatie = {
    id: uid("mut"),
    datumISO: m.datumISO ?? new Date().toISOString(),
    status: m.status ?? "open",
    titel: m.titel,
    groep: m.groep,
    opmerking: m.opmerking,
    belangrijk: !!m.belangrijk,
  };
  list.unshift(item);
  await saveMutaties(list);
  return item;
}

export async function patchMutatie(id: string, patch: Partial<Mutatie>) {
  const list = await loadMutaties();
  const it = list.find((x) => x.id === id);
  if (!it) throw new Error("Mutatie niet gevonden");
  Object.assign(it, patch);
  await saveMutaties(list);
  return it;
}

export async function removeMutatie(id: string) {
  const list = await loadMutaties();
  const next = list.filter((x) => x.id !== id);
  await saveMutaties(next);
  return true;
}

export async function summary() {
  const list = await loadMutaties();
  const open = list.filter((m) => m.status === "open").length;
  const inb = list.filter((m) => m.status === "in_behandeling").length;
  const afr = list.filter((m) => m.status === "afgerond").length;
  return { open, inBehandeling: inb, afgerond: afr, totaal: list.length };
}
