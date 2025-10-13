"use client";

export type SportMutatie = {
  id: string;
  group: string;
  naam: string;
  dienst?: string | null;
  type: string;
  notitie?: string | null;
  active: boolean;
  ts: string;
  by?: string | null;
  updatedAt: string;
};

// 🆕 Voeg deriveGroupStatus toe
export function deriveGroupStatus(
  mutaties: SportMutatie[],
  group: string,
): string {
  const actives = mutaties.filter((m) => m.group === group && m.active);
  if (actives.length === 0) return "green";
  if (actives.some((m) => m.type.toLowerCase().includes("verbod")))
    return "red";
  return "orange"; // fallback: er is iets, maar geen verbod
}

// Placeholder (je kunt dit later vullen met echte logica / API)
export async function listSportmutaties(): Promise<SportMutatie[]> {
  return [];
}
