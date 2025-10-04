export type Overdracht = {
  id: string;
  auteur: string;
  bericht: string;
  datumISO: string;
  tijd: string;
  belangrijk: boolean;
};
const BASE = "/api/overdrachten";
export async function listOverdrachten(): Promise<Overdracht[]> {
  const r = await fetch(BASE, { cache: "no-store" });
  if (!r.ok) return [];
  return r.json();
}
