/** Live sync (client-only) */
export type AnyRec = Record<string, any>;
const isClient = typeof window !== "undefined";

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

import { useEffect, useState } from "react";
export function useLiveList<T=any>(key: string, initial: T[]) {
  const [list, setList] = useState<T[]>(() => readJSON<T[]>(key, initial));
  useEffect(() => {
    if (!isClient) return;
    const onStorage = (e: StorageEvent) => { if (e.key === key) setList(readJSON<T[]>(key, initial)); };
    const onCustom  = (e: Event) => { const de = e as CustomEvent; if (de?.detail?.key === key || de?.detail?.key === "*") setList(readJSON<T[]>(key, initial)); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("sportdash-sync", onCustom as EventListener);
    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel("sportdash-sync");
      bc.onmessage = (msg) => { if (msg?.data?.key === key || msg?.data?.key === "*") setList(readJSON<T[]>(key, initial)); };
    }
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("sportdash-sync", onCustom as EventListener); bc?.close(); };
  }, [key]);
  const save = (next: T[] | ((prev: T[]) => T[])) => {
    const resolved = typeof next === "function" ? (next as any)(readJSON<T[]>(key, initial)) : next;
    writeJSON<T[]>(key, resolved); setList(resolved);
  };
  return [list, save] as const;
}

export function useLiveObject<T extends AnyRec = AnyRec>(key: string, initial: T) {
  const [obj, setObj] = useState<T>(() => readJSON<T>(key, initial));
  useEffect(() => {
    if (!isClient) return;
    const onStorage = (e: StorageEvent) => { if (e.key === key) setObj(readJSON<T>(key, initial)); };
    const onCustom  = (e: Event) => { const de = e as CustomEvent; if (de?.detail?.key === key || de?.detail?.key === "*") setObj(readJSON<T>(key, initial)); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("sportdash-sync", onCustom as EventListener);
    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel("sportdash-sync");
      bc.onmessage = (msg) => { if (msg?.data?.key === key || msg?.data?.key === "*") setObj(readJSON<T>(key, initial)); };
    }
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("sportdash-sync", onCustom as EventListener); bc?.close(); };
  }, [key]);
  const save = (next: T | ((prev: T) => T)) => {
    const resolved = typeof next === "function" ? (next as any)(readJSON<T>(key, initial)) : next;
    writeJSON<T>(key, resolved); setObj(resolved);
  };
  return [obj, save] as const;
}

/* Keys */
export const KEY_MUT = "sportmutaties";
export const KEY_IND = "indicaties";
export const KEY_OVD = "overdrachten";
export const KEY_EVT = "kalenderEvents";
export const KEY_COL = "groupColors";
export const KEY_GRP = "groups";
export const KEY_SP  = "sharepointConf";
export const KEY_MSG = "meldingen";

/* Hooks */
export const useMutaties     = () => useLiveList<any>(KEY_MUT, []);
export const useIndicaties   = () => useLiveList<any>(KEY_IND, []);
export const useOverdrachten = () => useLiveList<any>(KEY_OVD, []);
export const useEvents       = () => useLiveList<any>(KEY_EVT, []);
export const useGroupColors  = () => useLiveObject<Record<string,string>>(KEY_COL, {});
export const useGroups       = () => useLiveList<string>(KEY_GRP, []);
export const useMeldingen    = () => useLiveList<any>(KEY_MSG, []);

/* Add helpers (prepend newest) */
export function addMutatie(item: any)     { const list = readJSON<any[]>(KEY_MUT, []); list.unshift(item); writeJSON(KEY_MUT, list); }
export function addIndicatie(item: any)   { const list = readJSON<any[]>(KEY_IND, []); list.unshift(item); writeJSON(KEY_IND, list); }
export function addOverdracht(item: any)  { const list = readJSON<any[]>(KEY_OVD, []); list.unshift(item); writeJSON(KEY_OVD, list); }
export function addMelding(item: any)     { const list = readJSON<any[]>(KEY_MSG, []); list.unshift(item); writeJSON(KEY_MSG, list); }
export function setEventsAll(list: any[]) { writeJSON(KEY_EVT, list); }
