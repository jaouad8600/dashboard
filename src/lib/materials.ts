"use client";

export type MaterialStatus = "Goed" | "Defect" | "Besteld" | "Topdesk";
export type MaterialLocation =
  | "Fitnesszaal EB"
  | "Fitnesszaal Vloed"
  | "Sportveld EB"
  | "Sportveld Vloed"
  | "Gymzaal EB"
  | "Gymzaal Vloed"
  | "Dojo EB"
  | "Dojo Vloed";

export type Material = {
  id: string;
  name: string;
  location: MaterialLocation;
  status: MaterialStatus;
  count: number;
  minCount?: number;
  ticket?: string;
  note?: string;
  updatedAt: number;
};

const KEY = "materials";

export const MATERIAL_LOCATIONS: MaterialLocation[] = [
  "Fitnesszaal EB",
  "Fitnesszaal Vloed",
  "Sportveld EB",
  "Sportveld Vloed",
  "Gymzaal EB",
  "Gymzaal Vloed",
  "Dojo EB",
  "Dojo Vloed",
];

export const MATERIAL_STATUSES: MaterialStatus[] = [
  "Goed",
  "Defect",
  "Besteld",
  "Topdesk",
];

function readAll(): Material[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as Material[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function writeAll(list: Material[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("materials:changed"));
}

export function isLowStock(m: Material): boolean {
  const min = Number.isFinite(m.minCount as number) ? (m.minCount as number) : 1;
  return (m.count ?? 0) <= Math.max(0, min);
}

export function getMaterials(): Material[] {
  return readAll().sort((a, b) => {
    const l = a.location.localeCompare(b.location, "nl-NL");
    if (l !== 0) return l;
    return a.name.localeCompare(b.name, "nl-NL", { numeric: true });
  });
}

export function onMaterialsChange(cb: () => void) {
  const h = () => cb();
  const sh = (e: StorageEvent) => { if (e.key === KEY) cb(); };
  window.addEventListener("materials:changed", h as EventListener);
  window.addEventListener("storage", sh);
  return () => {
    window.removeEventListener("materials:changed", h as EventListener);
    window.removeEventListener("storage", sh);
  };
}

export function addMaterial(input: {
  name: string;
  location: MaterialLocation;
  status?: MaterialStatus;
  count?: number;
  minCount?: number;
  ticket?: string;
  note?: string;
}): Material {
  const list = readAll();
  const safeName = String(input.name ?? "").trim();
  const m: Material = {
    id:
      (globalThis.crypto && "randomUUID" in globalThis.crypto
        ? (crypto as any).randomUUID()
        : null) || String(Date.now()),
    name: safeName || "Onbenoemd",
    location: input.location,
    status: input.status || "Goed",
    count: Math.max(0, Number(input.count ?? 1)),
    minCount: Number.isFinite(input.minCount) ? Math.max(0, Number(input.minCount)) : 1,
    ticket: input.ticket?.trim() || undefined,
    note: input.note?.trim() || undefined,
    updatedAt: Date.now(),
  };
  list.push(m);
  writeAll(list);
  return m;
}

export function updateMaterial(id: string, patch: Partial<Omit<Material, "id">>) {
  const list = readAll();
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...patch, updatedAt: Date.now() };
  writeAll(list);
}

export function removeMaterial(id: string) {
  const list = readAll().filter((x) => x.id !== id);
  writeAll(list);
}

export function adjustCount(id: string, delta: number) {
  const list = readAll();
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const next = Math.max(0, Number((list[idx].count ?? 0) + delta));
  list[idx] = { ...list[idx], count: next, updatedAt: Date.now() };
  writeAll(list);
}

export function ensureSeed() {
  const list = readAll();
  if (list.length) return;
  const seed: Material[] = [
    {
      id: "seed-1",
      name: "Halterset 10kg",
      location: "Fitnesszaal EB",
      status: "Goed",
      count: 6,
      minCount: 4,
      updatedAt: Date.now(),
    } as Material,
    {
      id: "seed-2",
      name: "Springtouw",
      location: "Gymzaal Vloed",
      status: "Goed",
      count: 12,
      minCount: 8,
      updatedAt: Date.now(),
    } as Material,
    {
      id: "seed-3",
      name: "Voetbal",
      location: "Sportveld EB",
      status: "Defect",
      count: 1,
      minCount: 4,
      note: "2 lek",
      updatedAt: Date.now(),
    } as Material,
  ];
  writeAll(seed);
}
