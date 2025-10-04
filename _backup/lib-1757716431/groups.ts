export const GROUPS = [
  "Poel A","Poel B","Lier","Zijl","Nes","Vliet",
  "Gaag","Kust","Golf","Zift","Lei","Kade","Kreek",
  "Duin","Rak","Bron","Eb","Vloed"
] as const;

export type GroupName = typeof GROUPS[number];

export function allGroups(): string[] {
  return [...GROUPS];
}

// ✅ Fix: zorg dat groepen altijd aanwezig zijn
export function ensureGroupsInLocalStorage() {
  if (typeof window === "undefined") return;
  const KEY = "groups";
  const FALLBACK = [
    "Poel","Lier","Zijl","Nes","Vliet","Gaag","Kust","Golf",
    "Zift","Lei","Kade","Kreek","Duin","Rak","Bron",
  ];
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(FALLBACK));
    return;
  }
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) {
      localStorage.setItem(KEY, JSON.stringify(FALLBACK));
    }
  } catch {
    localStorage.setItem(KEY, JSON.stringify(FALLBACK));
  }
}
