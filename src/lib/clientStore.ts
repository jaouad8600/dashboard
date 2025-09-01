import { addDays, startOfWeek } from "date-fns";

/* ——— Kalender ——— */
export type Tide = "eb"|"vloed";
export type CalEvent = { id:string; title:string; start:Date; end:Date; tide:Tide; group:string; staff?:string[]; };
export const EVENTS_KEY="rbc-events-v1"; 
export const ACTIVE_GROUP_KEY="active-group";
export const GROUPS=["Poel","Lier","Zijl","Nes","Vliet","Gaag","Kust","Golf","Zift","Lei","Kade","Kreek","Duin","Rak","Bron","Dijk","Burcht","Balk","Algemeen"];

export function loadEvents():CalEvent[]{
  try{ const raw=localStorage.getItem(EVENTS_KEY); const arr=raw?JSON.parse(raw):[];
    return arr.map((e:any)=>({id:String(e.id),title:String(e.title??"Sportmoment"),start:new Date(e.start),end:new Date(e.end),tide:e.tide==="vloed"?"vloed":"eb",group:String(e.group??"Algemeen"),staff:Array.isArray(e.staff)?e.staff:undefined}));
  }catch{return[];}
}
export function saveEvents(evts:CalEvent[]){ localStorage.setItem(EVENTS_KEY, JSON.stringify(evts)); }
export function upsertEvents(newOnes:CalEvent[]){ const by=new Map<string,CalEvent>(); for(const e of loadEvents()) by.set(e.id,e); for(const e of newOnes) by.set(e.id,e); saveEvents([...by.values()]); }
export function getActiveGroup(){ try{ return localStorage.getItem(ACTIVE_GROUP_KEY) || "Algemeen"; }catch{ return "Algemeen"; } }
export function setActiveGroup(g:string){ try{ localStorage.setItem(ACTIVE_GROUP_KEY,g); }catch{} }
export function weekRange(date=new Date()){ const start=startOfWeek(date,{weekStartsOn:1}); const end=addDays(start,7); return {start,end}; }

/* ——— Mutaties ——— */
export type Mutatie = { id:string; group:string; type:string; note?:string; status:"open"|"gesloten"; createdAt:string };
export const MUTATIES_KEY="mutaties-v1";
export function loadMutaties():Mutatie[]{ try{ return JSON.parse(localStorage.getItem(MUTATIES_KEY)||"[]"); }catch{return[];} }
export function saveMutaties(m:Mutatie[]){ localStorage.setItem(MUTATIES_KEY, JSON.stringify(m)); }
export function addMutatie(m:Omit<Mutatie,"id"|"createdAt">){ const cur=loadMutaties(); const nu=new Date().toISOString();
  cur.unshift({ id:crypto.randomUUID(), createdAt:nu, ...m }); saveMutaties(cur); }
export function countOpenMutaties(){ return loadMutaties().filter(m=>m.status==="open").length; }

/* ——— Bestanden (links) ——— */
export type FileLink = { id:string; title:string; url:string; group?:string; note?:string; };
export const FILES_KEY="files-links-v1";
export function loadFiles():FileLink[]{ try{ return JSON.parse(localStorage.getItem(FILES_KEY)||"[]"); }catch{return[];} }
export function saveFiles(f:FileLink[]){ localStorage.setItem(FILES_KEY, JSON.stringify(f)); }

/* ——— Logging ——— */
export type LogEntry = { id:string; ts:string; text:string };
export const LOGS_KEY="logs-v1";
export function loadLogs():LogEntry[]{ try{ return JSON.parse(localStorage.getItem(LOGS_KEY)||"[]"); }catch{return[];} }
export function saveLogs(l:LogEntry[]){ localStorage.setItem(LOGS_KEY, JSON.stringify(l)); }
