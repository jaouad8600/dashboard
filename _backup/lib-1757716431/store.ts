"use client";
import { Group, Note } from "./types";

const KEY_GROUPS = "groups";

/** Hulp: haal groepen op uit localStorage */
export function getGroups(): Group[] {
  try {
    const raw = localStorage.getItem(KEY_GROUPS);
    return raw ? (JSON.parse(raw) as Group[]) : [];
  } catch {
    return [];
  }
}

/** Hulp: sla groepen op naar localStorage */
export function saveGroups(groups: Group[]) {
  localStorage.setItem(KEY_GROUPS, JSON.stringify(groups));
}

/** Voeg een groep toe */
export function addGroup(name: string): Group[] {
  const groups = getGroups();
  const newGroup: Group = {
    id: String(Date.now()),
    name,
    state: "Groen",
    notes: [],
  };
  const updated = [...groups, newGroup];
  saveGroups(updated);
  return updated;
}

/** Verwijder een groep */
export function removeGroup(groupId: string): Group[] {
  const updated = getGroups().filter((g) => g.id !== groupId);
  saveGroups(updated);
  return updated;
}

/** Hernoem een groep */
export function renameGroup(groupId: string, newName: string): Group[] {
  const updated = getGroups().map((g) =>
    g.id === groupId ? { ...g, name: newName } : g,
  );
  saveGroups(updated);
  return updated;
}

/** Voeg een notitie toe aan een groep */
export function addNote(
  groupId: string,
  text: string,
  author?: string,
): Group[] {
  const updated = getGroups().map((g) => {
    if (g.id === groupId) {
      const newNote: Note = {
        id: String(Date.now()),
        text,
        author,
        createdAt: new Date().toISOString(),
        starred: false,
      };
      return { ...g, notes: [...(g.notes || []), newNote] };
    }
    return g;
  });
  saveGroups(updated);
  return updated;
}

/** Bewerk een notitie */
export function editNote(
  groupId: string,
  noteId: string,
  text: string,
): Group[] {
  const updated = getGroups().map((g) => {
    if (g.id === groupId) {
      return {
        ...g,
        notes: (g.notes || []).map((n) =>
          n.id === noteId ? { ...n, text } : n,
        ),
      };
    }
    return g;
  });
  saveGroups(updated);
  return updated;
}

/** Verwijder een notitie */
export function removeNote(groupId: string, noteId: string): Group[] {
  const updated = getGroups().map((g) => {
    if (g.id === groupId) {
      return {
        ...g,
        notes: (g.notes || []).filter((n) => n.id !== noteId),
      };
    }
    return g;
  });
  saveGroups(updated);
  return updated;
}

/** Toggle ster bij een notitie */
export function toggleNoteStar(groupId: string, noteId: string): Group[] {
  const updated = getGroups().map((g) => {
    if (g.id === groupId) {
      return {
        ...g,
        notes: (g.notes || []).map((n) =>
          n.id === noteId ? { ...n, starred: !n.starred } : n,
        ),
      };
    }
    return g;
  });
  saveGroups(updated);
  return updated;
}

/** Exporteer alle groepen met notities als JSON */
export function exportGroupsAsJson(): string {
  const data = getGroups();
  return JSON.stringify(data, null, 2);
}
