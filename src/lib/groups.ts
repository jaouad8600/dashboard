"use client";
export type GroupState = "Groen" | "Geel" | "Oranje" | "Rood";
export type Group = { id: string; name: string; state: GroupState; note?: string };

const KEY = "groups";
export const DEFAULT_GROUP_NAMES = [
  "Poel","Lier","Zijl","Nes","Vliet","Gaag","Kust","Golf",
  "Zift","Lei","Kade","Kreek","Duin","Rak","Bron"
];
function slugify(s: string) {
  return (s||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}
export const DEFAULT_GROUPS: Group[] = DEFAULT_GROUP_NAMES.map((name)=>({
  id: slugify(name)||name, name, state:"Groen"
}));

function readAll(): Group[] {
  try{
    if (typeof window==="undefined") return DEFAULT_GROUPS;
    const raw = localStorage.getItem(KEY);
    if(!raw) return DEFAULT_GROUPS;
    const arr = JSON.parse(raw);
    if(!Array.isArray(arr)) return DEFAULT_GROUPS;
    return arr.map((g:any,i:number)=>({
      id: g?.id || slugify(g?.name||DEFAULT_GROUP_NAMES[i]||`groep-${i+1}`),
      name: String(g?.name || DEFAULT_GROUP_NAMES[i] || `Groep ${i+1}`),
      state: (g?.state as GroupState) || "Groen",
      note: g?.note || undefined,
    }));
  }catch{ return DEFAULT_GROUPS; }
}
function writeAll(list: Group[]){
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("groups:changed"));
}
export function ensureDefaults(){
  try{
    if (typeof window==="undefined") return;
    if (!localStorage.getItem(KEY)) writeAll(DEFAULT_GROUPS);
  }catch{}
}
export function getGroups(): Group[] { return readAll(); }
export function onGroupsChange(cb:()=>void){
  const h=()=>cb(); const hs=(e:StorageEvent)=>{ if(e.key===KEY) cb(); };
  window.addEventListener("groups:changed", h as EventListener);
  window.addEventListener("storage", hs);
  return ()=>{ window.removeEventListener("groups:changed", h as EventListener); window.removeEventListener("storage", hs); };
}
export function setGroupState(id:string, state:GroupState){
  const list = readAll(); const idx = list.findIndex(g=>g.id===id || slugify(g.name)===id);
  if (idx!==-1){ list[idx].state = state; writeAll(list); }
}
export function getKnownGroups(){ return getGroups().map(g=>({id:g.id, name:g.name})); }
