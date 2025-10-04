"use client";

export type Materiaal = {
  id: string;
  name: string;
  locatie: string;
  status: string;
  aantal: number;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
};

type Listener = () => void;

const STORAGE_KEY = "materialen-store:v1";
const listeners = new Set<Listener>();
let cache: Materiaal[] | null = null;

function emit() {
  for (const fn of Array.from(listeners)) {
    try { fn(); } catch {}
  }
}

function loadFromStorage(): Materiaal[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) cache = JSON.parse(raw) as Materiaal[];
  } catch {}
  if (!Array.isArray(cache)) cache = [];
  return cache!;
}

function save(list: Materiaal[]) {
  cache = list;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
  emit();
}

export function onMaterialenChange(cb: Listener) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export async function listMaterialen(): Promise<Materiaal[]> {
  return loadFromStorage().slice();
}

export async function createMateriaal(input: {
  name: string;
  locatie: string;
  status?: string;
  aantal?: number;
  note?: string;
}) {
  const list = loadFromStorage();
  const now = new Date().toISOString();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Date.now() + Math.random());

  const item: Materiaal = {
    id,
    name: String(input.name ?? "").trim(),
    locatie: String(input.locatie ?? "").trim(),
    status: String(input.status ?? "Goed"),
    aantal: Number(input.aantal ?? 1),
    note: input.note?.trim() || null,
    createdAt: now,
    updatedAt: now,
  };

  save([item, ...list]);
  return item;
}

export async function patchMateriaal(id: string, patch: Partial<Materiaal>) {
  const list = loadFromStorage();
  const idx = list.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error("Materiaal niet gevonden");

  const current = list[idx];
  const updated: Materiaal = {
    ...current,
    ...patch,
    id: current.id,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;
  save(list);
  return updated;
}

export async function setStatus(id: string, status: string) {
  return patchMateriaal(id, { status });
}

export async function deleteMateriaal(id: string) {
  const list = loadFromStorage();
  const next = list.filter((m) => m.id !== id);
  if (next.length === list.length) throw new Error("Materiaal niet gevonden");
  save(next);
  return { ok: true };
}
