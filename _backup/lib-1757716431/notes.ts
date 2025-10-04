"use client";

export type Note = {
  id: string;
  groupId: string;
  body: string;
  author?: string;
  createdAt: number;
  pinned?: boolean;
};

const KEY = "notes";

function readMap(): Record<string, Note[]> {
  try {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, Note[]>) : {};
  } catch {
    return {};
  }
}
function writeMap(map: Record<string, Note[]>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent("notes:changed"));
  } catch {}
}

export function getNotes(groupId: string): Note[] {
  if (!groupId) return [];
  const map = readMap();
  const arr = map[groupId] || [];
  return [...arr].sort(
    (a, b) =>
      Number(!!b.pinned) - Number(!!a.pinned) || b.createdAt - a.createdAt
  );
}

export function addNote(groupId: string, body: string, author?: string): Note {
  const map = readMap();
  const note: Note = {
    id:
      (globalThis.crypto && "randomUUID" in globalThis.crypto
        ? (crypto as any).randomUUID()
        : null) || String(Date.now()),
    groupId,
    body: body.trim(),
    author: author?.trim() || undefined,
    createdAt: Date.now(),
    pinned: false,
  };
  map[groupId] = [note, ...(map[groupId] || [])];
  writeMap(map);
  return note;
}

export function deleteNote(groupId: string, noteId: string) {
  const map = readMap();
  map[groupId] = (map[groupId] || []).filter((n) => n.id !== noteId);
  writeMap(map);
}

export function togglePin(groupId: string, noteId: string) {
  const map = readMap();
  map[groupId] = (map[groupId] || []).map((n) =>
    n.id === noteId ? { ...n, pinned: !n.pinned } : n
  );
  writeMap(map);
}

export function onNotesChange(cb: () => void) {
  const handle = () => cb();
  const storageHandler = (e: StorageEvent) => { if (e.key === KEY) cb(); };
  window.addEventListener("notes:changed", handle as EventListener);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener("notes:changed", handle as EventListener);
    window.removeEventListener("storage", storageHandler);
  };
}
