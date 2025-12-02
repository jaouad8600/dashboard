export type Group = {
  id: string;
  name: string;
  tide: "Eb" | "Vloed";
  color: string;
  notes: string[];
};

export const GROUPS: Group[] = [
  { id: "poel_a", name: "Poel A", tide: "Eb", color: "blue", notes: [] },
  { id: "poel_b", name: "Poel B", tide: "Eb", color: "blue", notes: [] },
  { id: "lier", name: "Lier", tide: "Eb", color: "green", notes: [] },
  { id: "zijl", name: "Zijl", tide: "Eb", color: "orange", notes: [] },
  { id: "nes", name: "Nes", tide: "Eb", color: "purple", notes: [] },
  { id: "vliet", name: "Vliet", tide: "Eb", color: "teal", notes: [] },
  { id: "gaag", name: "Gaag", tide: "Eb", color: "pink", notes: [] },
  { id: "kust", name: "Kust", tide: "Vloed", color: "blue", notes: [] },
  { id: "golf", name: "Golf", tide: "Vloed", color: "green", notes: [] },
  { id: "zift", name: "Zift", tide: "Vloed", color: "orange", notes: [] },
  { id: "lei", name: "Lei", tide: "Vloed", color: "purple", notes: [] },
  { id: "kade", name: "Kade", tide: "Vloed", color: "teal", notes: [] },
  { id: "kreek", name: "Kreek", tide: "Vloed", color: "pink", notes: [] },
  { id: "duin", name: "Duin", tide: "Vloed", color: "yellow", notes: [] },
  { id: "rak", name: "Rak", tide: "Vloed", color: "indigo", notes: [] },
  { id: "bron", name: "Bron", tide: "Vloed", color: "cyan", notes: [] },
];

// Zet de groepen in localStorage als ze nog niet bestaan
export function ensureGroupsInLocalStorage() {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem("groups");
  if (!existing) {
    localStorage.setItem("groups", JSON.stringify(GROUPS));
  }
}

// Haal groepen uit localStorage
export function loadGroups(): Group[] {
  if (typeof window === "undefined") return GROUPS;
  try {
    const raw = localStorage.getItem("groups");
    return raw ? (JSON.parse(raw) as Group[]) : GROUPS;
  } catch {
    return GROUPS;
  }
}

// Voeg een notitie toe
export function addNote(groupId: string, note: string) {
  if (typeof window === "undefined") return;
  const groups = loadGroups();
  const updated = groups.map((g) =>
    g.id === groupId ? { ...g, notes: [...g.notes, note] } : g,
  );
  localStorage.setItem("groups", JSON.stringify(updated));
  return updated;
}

// Verwijder een notitie
export function removeNote(groupId: string, noteIndex: number) {
  if (typeof window === "undefined") return;
  const groups = loadGroups();
  const updated = groups.map((g) =>
    g.id === groupId
      ? { ...g, notes: g.notes.filter((_, i) => i !== noteIndex) }
      : g,
  );
  localStorage.setItem("groups", JSON.stringify(updated));
  return updated;
}
