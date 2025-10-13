export type Planning = {
  id: string;
  titel: string;
  locatie: string;
  start: string;
  eind: string;
  notitie?: string | null;
};
const BASE = "/api/planning";
export async function listPlanning(dateISO?: string): Promise<Planning[]> {
  const q = dateISO ? `?date=${encodeURIComponent(dateISO)}` : "";
  const r = await fetch(`${BASE}${q}`, { cache: "no-store" });
  if (!r.ok) return [];
  return r.json();
}
