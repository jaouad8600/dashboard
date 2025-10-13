import "server-only";
import { readJSON, writeJSON } from "@/lib/fsjson";
import { randomUUID } from "node:crypto";

export type Overdracht = {
  id: string;
  titel: string;
  inhoud: string;
  auteur?: string;
  createdAt: string;
  updatedAt?: string;
  status?: "open" | "afgerond";
};

export type NewOverdracht = {
  titel: string;
  inhoud: string;
  auteur?: string;
  status?: "open" | "afgerond";
};

const FILE = "overdrachten.json";

export async function listOverdrachten(): Promise<Overdracht[]> {
  return readJSON<Overdracht[]>(FILE, []);
}

export async function addOverdracht(input: NewOverdracht): Promise<Overdracht> {
  const items = await listOverdrachten();
  const item: Overdracht = {
    id: randomUUID(),
    titel: input.titel,
    inhoud: input.inhoud,
    auteur: input.auteur,
    status: input.status ?? "open",
    createdAt: new Date().toISOString(),
  };
  items.unshift(item);
  await writeJSON(FILE, items);
  return item;
}

export async function updateOverdracht(
  id: string,
  patch: Partial<Overdracht>,
): Promise<Overdracht | null> {
  const items = await listOverdrachten();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const updated: Overdracht = {
    ...items[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  items[idx] = updated;
  await writeJSON(FILE, items);
  return updated;
}

export async function removeOverdracht(id: string): Promise<boolean> {
  const items = await listOverdrachten();
  const next = items.filter((i) => i.id !== id);
  if (next.length === items.length) return false;
  await writeJSON(FILE, next);
  return true;
}
