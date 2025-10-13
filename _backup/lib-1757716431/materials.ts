"use client";

export type MaterialStatus = "Goed" | "Defect" | "Besteld" | "Topdesk";
export type MaterialItem = {
  id: string;
  name: string;
  locatie: string;
  status: MaterialStatus;
  aantal: number;
  note?: string;
};

export const LOCATIES = [
  "Fitnesszaal EB",
  "Fitnesszaal Vloed",
  "Sportveld EB",
  "Sportveld Vloed",
  "Gymzaal EB",
  "Gymzaal Vloed",
  "Dojo EB",
  "Dojo Vloed",
];

const KEY = "materials";

function read(): MaterialItem[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as MaterialItem[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(list: MaterialItem[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("materials:changed"));
}

export function getMaterials(): MaterialItem[] {
  return read();
}

export function addMaterial(partial: Omit<MaterialItem, "id">): MaterialItem {
  const list = read();
  const item: MaterialItem = {
    id:
      (globalThis.crypto && "randomUUID" in globalThis.crypto
        ? (crypto as any).randomUUID()
        : null) || String(Date.now()),
    name: String(partial.name ?? "").trim(),
    locatie: String(partial.locatie ?? "").trim(),
    status: partial.status,
    aantal: Number.isFinite(partial.aantal as any) ? Number(partial.aantal) : 1,
    note: partial.note != null ? String(partial.note).trim() : undefined,
  };
  write([item, ...list]);
  return item;
}

export function updateMaterial(
  id: string,
  patch: Partial<Omit<MaterialItem, "id">>,
) {
  const list = read().map((m) =>
    m.id === id
      ? {
          ...m,
          ...patch,
          name:
            patch.name !== undefined ? String(patch.name ?? "").trim() : m.name,
          locatie:
            patch.locatie !== undefined
              ? String(patch.locatie ?? "").trim()
              : m.locatie,
          status: (patch.status as MaterialStatus) ?? m.status,
          aantal: patch.aantal !== undefined ? Number(patch.aantal) : m.aantal,
          note:
            patch.note !== undefined
              ? patch.note != null
                ? String(patch.note).trim()
                : undefined
              : m.note,
        }
      : m,
  );
  write(list);
}

export function setStatus(id: string, status: MaterialStatus) {
  updateMaterial(id, { status });
}

export function removeMaterial(id: string) {
  write(read().filter((m) => m.id !== id));
}

export function onMaterialsChange(cb: () => void) {
  const h = () => cb();
  const s = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("materials:changed", h as EventListener);
  window.addEventListener("storage", s);
  return () => {
    window.removeEventListener("materials:changed", h as EventListener);
    window.removeEventListener("storage", s);
  };
}

/** Alias zodat oude code niet breekt */
export const MATERIAL_LOCATIONS = LOCATIES;
export const MATERIAL_STATUSES = ["Goed", "Defect", "Besteld", "Topdesk"];
