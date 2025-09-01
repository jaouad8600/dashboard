import { addDays, startOfWeek, isWithinInterval } from "date-fns";

/* ——— Kalender ——— */
export type Tide = "eb"|"vloed";
export type CalEvent = { id:string; title:string; start:Date; end:Date; tide:Tide; group:string; staff?:string[]; };
export const EVENTS_KEY="rbc-events-v1";
export const ACTIVE_GROUP_KEY="active-group";
export const GROUPS=["Poel","Lier","Zijl","Nes","Vliet","Gaag","Kust","Golf","Zift","Lei","Kade","Kreek","Duin","Rak","Bron","Dijk","Burcht","Balk","Algemeen"];

export function loadEvents():CalEvent[]{
  try{
    const raw=localStorage.getItem(EVENTS_KEY); const arr=raw?JSON.parse(raw):[];
    return arr.map((e:any)=>({
      id:String(e.id), title:String(e.title??"Sportmoment"),
      start:new Date(e.start), end:new Date(e.end),
      tide:e.tide==="vloed"?"vloed":"eb",
      group:String(e.group??"Algemeen"),
      staff:Array.isArray(e.staff)?e.staff:undefined
    }));
  }catch{return[];}
}
export function saveEvents(evts:CalEvent[]){ localStorage.setItem(EVENTS_KEY, JSON.stringify(evts)); }
export function upsertEvents(newOnes:CalEvent[]){ const by=new Map<string,CalEvent>(); for(const e of loadEvents()) by.set(e.id,e); for(const e of newOnes) by.set(e.id,e); saveEvents([...by.values()]); }
export function weekRange(date=new Date()){ const start=startOfWeek(date,{weekStartsOn:1}); const end=addDays(start,7); return {start,end}; }
export function eventsInWeek(date=new Date()){ const {start,end}=weekRange(date); return loadEvents().filter(e=>isWithinInterval(e.start,{start,end})); }

/* ——— Sportmutaties ——— */
export type SportMutatie = {
  id:string; createdAt:string;
  jongere:string; group:string; type:string; note?:string;
  status:"open"|"gesloten";
};
export const SPORTMUT_KEY="sportmutaties-v1";
const OLD_MUT_KEY="mutaties-v1"; // migratie

export function loadSportmutaties():SportMutatie[]{
  try{
    const raw=localStorage.getItem(SPORTMUT_KEY);
    let arr:SportMutatie[]=raw?JSON.parse(raw):[];
    // Migratie van oude key zonder 'jongere'
    if(!raw){
      const oldRaw=localStorage.getItem(OLD_MUT_KEY);
      if(oldRaw){
        try{
          const old=JSON.parse(oldRaw) as any[];
          arr = old.map(o=>({
            id:o.id||crypto.randomUUID(),
            createdAt:o.createdAt||new Date().toISOString(),
            jongere:o.jongere || "Onbekend",
            group:o.group||"Algemeen",
            type:o.type||"Materiaal",
            note:o.note||"",
            status:o.status==="gesloten"?"gesloten":"open",
          }));
          localStorage.setItem(SPORTMUT_KEY, JSON.stringify(arr));
        }catch{}
      }
    }
    return arr;
  }catch{return[];}
}
export function saveSportmutaties(m:SportMutatie[]){ localStorage.setItem(SPORTMUT_KEY, JSON.stringify(m)); }
export function addSportmutatie(m:Omit<SportMutatie,"id"|"createdAt">){
  const cur=loadSportmutaties();
  cur.unshift({ id:crypto.randomUUID(), createdAt:new Date().toISOString(), ...m });
  saveSportmutaties(cur);
}
export function countOpenSportmutaties(){ return loadSportmutaties().filter(m=>m.status==="open").length; }

/* ——— Bestanden ——— */
export type FileLink = { id:string; title:string; url:string; group?:string; note?:string; };
export const FILES_KEY="files-links-v1";
export function loadFiles():FileLink[]{ try{ return JSON.parse(localStorage.getItem(FILES_KEY)||"[]"); }catch{return[];} }
export function saveFiles(f:FileLink[]){ localStorage.setItem(FILES_KEY, JSON.stringify(f)); }

/* ——— Logging ——— */
export type LogEntry = { id:string; ts:string; text:string };
export const LOGS_KEY="logs-v1";
export function loadLogs():LogEntry[]{ try{ return JSON.parse(localStorage.getItem(LOGS_KEY)||"[]"); }catch{return[];} }
export function saveLogs(l:LogEntry[]){ localStorage.setItem(LOGS_KEY, JSON.stringify(l)); }

/* ——— Bezoek/Bibliotheek ——— */
export type Visit = {
  id:string; title:string; group:string;
  kind:"Bibliotheek"|"Bezoek"|"Overig";
  date:string; start?:string; end?:string;
  status:"gepland"|"afgerond"|"geannuleerd"; note?:string;
};
export const VISITS_KEY="visits-v1";
export function loadVisits():Visit[]{ try{ return JSON.parse(localStorage.getItem(VISITS_KEY)||"[]"); }catch{return[];} }
export function saveVisits(v:Visit[]){ localStorage.setItem(VISITS_KEY, JSON.stringify(v)); }

/* ——— Indicaties (algemeen) ——— */
export type Restriction = { id:string; group:string; label:string; note?:string; active:boolean; createdAt:string };
export const RESTRICTIONS_KEY="restrictions-v1";
export function loadRestrictions():Restriction[]{ try{ return JSON.parse(localStorage.getItem(RESTRICTIONS_KEY)||"[]"); }catch{return[];} }
export function saveRestrictions(r:Restriction[]){ localStorage.setItem(RESTRICTIONS_KEY, JSON.stringify(r)); }

/* ——— Indicatie sport (aparte lijst) ——— */
export const SPORT_RESTR_KEY="sport-restrictions-v1";
export function loadSportRestrictions():Restriction[]{ try{ return JSON.parse(localStorage.getItem(SPORT_RESTR_KEY)||"[]"); }catch{return[];} }
export function saveSportRestrictions(r:Restriction[]){ localStorage.setItem(SPORT_RESTR_KEY, JSON.stringify(r)); }
export function addSportRestriction(r:Omit<Restriction,"id"|"createdAt">){
  const cur=loadSportRestrictions();
  cur.unshift({ id:crypto.randomUUID(), createdAt:new Date().toISOString(), ...r });
  saveSportRestrictions(cur);
}
