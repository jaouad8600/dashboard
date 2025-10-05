import { readJson, writeJson } from "@/lib/filedb";

export type MutatieStatus = "Open" | "In behandeling" | "Afgerond";
export type Mutatie = {
  id: string;
  titel: string;
  omschrijving?: string;
  status: MutatieStatus;
  auteur?: string;
  categorie?: string;
  datumISO: string; // YYYY-MM-DD
  createdAt: string; // ISO
};

const FILE = "mutaties.json";

export async function listMutaties(): Promise<Mutatie[]> {
  return readJson<Mutatie[]>(FILE, []);
}
export async function saveMutaties(rows: Mutatie[]) {
  return writeJson(FILE, rows);
}
