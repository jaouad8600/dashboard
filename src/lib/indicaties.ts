export type IndicatieType = "Sport" | "Muziek" | "Creatief";
export type Indicatie = {
  id: string;
  naam: string;       // naam jongere
  groep: string;      // bv. Golf, Poel, Zijl, ...
  type: IndicatieType;
  van: string;        // ISO yyyy-mm-dd
  tot: string;        // ISO yyyy-mm-dd
  tips?: string;
  leerdoelen?: string;
  opmerking?: string;
  aangemaaktDoor?: string;
  createdAt?: string;
};

let _rows: Indicatie[] = [
  // Voorbeeld uit jouw formulier (beknopt), zodat je meteen data ziet:
  {
    id: crypto.randomUUID(),
    naam: "Tidiane Kamara",
    groep: "Golf",
    type: "Sport",
    van: "2025-09-15",
    tot: "2025-10-15",
    tips:
      "Langzaam praten, herhalen, consequent & duidelijk; niet autoritair benaderen; controleer begrip.",
    leerdoelen:
      "Spanning leren herkennen; praten over gevoel met docent; respectvol contact.",
    opmerking:
      "1-op-1 sporten (liefst kickboksen); veel spanning/verveling; voorkeur 1-op-1.",
    aangemaaktDoor: "Esther (GW) / Lucia (mentor)",
    createdAt: new Date().toISOString(),
  },
];

type Sub = () => void;
const subs = new Set<Sub>();
function emit() { for (const s of subs) s(); }

export function onIndicatiesChange(fn: Sub) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export function listIndicaties(): Indicatie[] {
  return [..._rows].sort((a,b) => (b.van || "").localeCompare(a.van || ""));
}

export function addIndicatie(i: Omit<Indicatie, "id" | "createdAt">): Indicatie {
  const row: Indicatie = { ...i, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  _rows = [row, ..._rows];
  emit();
  return row;
}

export function updateIndicatie(id: string, patch: Partial<Indicatie>): Indicatie | null {
  const idx = _rows.findIndex(r => r.id === id);
  if (idx === -1) return null;
  _rows[idx] = { ..._rows[idx], ...patch };
  emit();
  return _rows[idx];
}

export function deleteIndicatie(id: string): boolean {
  const before = _rows.length;
  _rows = _rows.filter(r => r.id !== id);
  const changed = _rows.length !== before;
  if (changed) emit();
  return changed;
}
