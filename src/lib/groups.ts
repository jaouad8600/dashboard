export type GroupState = "Groen" | "Geel" | "Oranje" | "Rood";
export type Group = { id: string; name: string; state: GroupState; note?: string };

export const DEFAULT_GROUPS: Group[] = [
  "Poel","Lier","Zijl","Nes","Vliet","Gaag","Kust","Golf",
  "Zift","Lei","Kade","Kreek","Duin","Rak","Bron"
].map((n,i)=>({ id: `g${i+1}`, name: n, state: "Groen" as GroupState }));

export function ensureGroupsInLocalStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("groups");
    if (!raw) localStorage.setItem("groups", JSON.stringify(DEFAULT_GROUPS));
  } catch {}
}
