/** Groepen + kleuren (client-only opslag) */
const isClient = typeof window !== "undefined";
const KEY_COL = "groupColors";
const KEY_GRP = "groups";

/* Toegestane statuskleuren voor groepen */
export const PRESETS = {
  groen:  "#22c55e",
  geel:   "#eab308",
  oranje: "#f97316",
  rood:   "#ef4444",
};

/* Standaard groepen (kan je uitbreiden via UI) */
export const DEFAULT_GROUPS = [
  "Gaag","Golf","Kust","Lier","Nes","Poel A","Poel B","Vliet","Zijl"
];

export type GroupColorMap = Record<string, string>;

function readJSON<T>(key: string, fallback: T): T {
  if (!isClient) return fallback;
  try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; }
  catch { return fallback; }
}
function writeJSON<T>(key: string, value: T) {
  if (!isClient) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("sportdash-sync", { detail: { key } }));
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("sportdash-sync");
      bc.postMessage({ key, ts: Date.now() });
      bc.close();
    }
  } catch {}
}

/* Groepenlijst */
export function getAllGroups(): string[] {
  const extra = readJSON<string[]>(KEY_GRP, []);
  const set = new Set<string>([...DEFAULT_GROUPS, ...extra].map(s => String((s as any)?.name ?? s ?? "").trim()).filter(Boolean));
  return Array.from(set);
}
export function addGroupName(name: string) {
  const clean = String((name as any)?.name ?? name ?? "").trim();
  if (!clean) return;
  const current = readJSON<string[]>(KEY_GRP, []);
  if (!current.includes(clean)) current.push(clean);
  writeJSON(KEY_GRP, current);
}

/* Kleuren */
export function loadGroupColors(): GroupColorMap {
  return readJSON<GroupColorMap>(KEY_COL, {});
}
export function saveGroupColors(map: GroupColorMap) {
  writeJSON(KEY_COL, map);
}
