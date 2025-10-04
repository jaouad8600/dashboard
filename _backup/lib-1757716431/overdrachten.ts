"use client";

export type Overdracht = {
  id: string;
  title?: string | null;
  body: string;
  createdAt: string; // ISO
  createdBy?: string | null;
  lastEditedAt?: string | null;
  lastEditedBy?: string | null;
  history?: { id: string; ts: string; by?: string | null; body: string; title?: string | null }[];
};

function emitChange(){ if(typeof window!=="undefined") window.dispatchEvent(new CustomEvent("overdrachten:changed")); }

export async function listOverdrachten(): Promise<Overdracht[]> {
  const r = await fetch("/api/overdrachten", { cache: "no-store" });
  if(!r.ok) throw new Error("Kon niet laden");
  return r.json();
}

export async function createOverdracht(input: { title?: string; body: string; author?: string; }) {
  const r = await fetch("/api/overdrachten", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(input),
  });
  if(!r.ok) throw new Error("Opslaan mislukt");
  emitChange();
  return r.json() as Promise<Overdracht>;
}

export async function patchOverdracht(id: string, patch: { title?: string; body?: string; author?: string; }) {
  const r = await fetch(`/api/overdrachten/${id}`, {
    method: "PATCH",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(patch),
  });
  if(!r.ok) throw new Error("Bewerken mislukt");
  emitChange();
  return r.json() as Promise<Overdracht>;
}

export async function deleteOverdracht(id: string) {
  const r = await fetch(`/api/overdrachten/${id}`, { method: "DELETE" });
  if(!r.ok) throw new Error("Verwijderen mislukt");
  emitChange();
}

export function onOverdrachtenChange(cb: ()=>void){
  const h = ()=>cb();
  if(typeof window!=="undefined"){
    window.addEventListener("overdrachten:changed", h as EventListener);
  }
  return ()=>{ if(typeof window!=="undefined"){ window.removeEventListener("overdrachten:changed", h as EventListener); } };
}
