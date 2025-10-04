export type RodeGroep = { id: string; naam: string };

export async function fetchRodeGroepen(): Promise<RodeGroep[]> {
  try {
    const r = await fetch("/api/groepen/rode", { cache: "no-store" });
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export async function fetchMutatiesSummary(): Promise<{total:number; fitnessAlleen:number; sportverbodTotaal:number}> {
  try {
    const r = await fetch("/api/mutaties/summary", { cache: "no-store" });
    if (!r.ok) return { total: 0, fitnessAlleen: 0, sportverbodTotaal: 0 };
    return await r.json();
  } catch { return { total: 0, fitnessAlleen: 0, sportverbodTotaal: 0 }; }
}

export async function fetchIndicatiesSummary(): Promise<{total:number}> {
  try {
    const r = await fetch("/api/indicaties/summary", { cache: "no-store" });
    if (!r.ok) return { total: 0 };
    return await r.json();
  } catch { return { total: 0 }; }
}
