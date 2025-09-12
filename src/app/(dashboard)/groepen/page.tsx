"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_GROUPS, type Group, type GroupState, ensureGroupsInLocalStorage } from "@/lib/groups";
import GroupNotes from "@/components/GroupNotes";

function readGroups(): Group[] {
  try {
    const raw = localStorage.getItem("groups");
    return raw ? (JSON.parse(raw) as Group[]) : DEFAULT_GROUPS;
  } catch {
    return DEFAULT_GROUPS;
  }
}
function writeGroups(gs: Group[]) {
  localStorage.setItem("groups", JSON.stringify(gs));
  window.dispatchEvent(new StorageEvent("storage", { key: "groups" }));
}

const STATES: GroupState[] = ["Groen","Geel","Oranje","Rood"];

export default function GroepenPage() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    ensureGroupsInLocalStorage();
    setGroups(readGroups());
    const onStorage = (e: StorageEvent) => { if (e.key === "groups") setGroups(readGroups()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const sorted = useMemo(
    () => [...groups].sort((a,b)=>a.name.localeCompare(b.name,"nl-NL",{numeric:true})),
    [groups]
  );

  const update = (id: string, state: GroupState) => {
    const next = groups.map(g => g.id===id ? {...g, state} : g);
    setGroups(next); writeGroups(next);
  };

  const color = (s: GroupState) =>
    ({ Groen:"bg-emerald-500", Geel:"bg-yellow-500", Oranje:"bg-orange-500", Rood:"bg-red-600" }[s]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Groepen</h1>
      <div className="grid gap-4 xl:grid-cols-2">
        {sorted.map(g=>(
          <div key={g.id} className="card">
            <div className="flex items-center justify-between gap-4">
              <div className="font-semibold text-lg">{g.name}</div>
              <div className="flex items-center gap-2">
                <span className={`inline-block h-3 w-3 rounded-full ${color(g.state)}`} />
                <select
                  value={g.state}
                  onChange={(e)=>update(g.id, e.target.value as GroupState)}
                  className="rounded-lg border px-2 py-1 text-sm"
                  aria-label="Status"
                >
                  {STATES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {g.note ? <div className="mt-2 text-sm text-zinc-600"><span className="font-medium">Opmerking: </span>{g.note}</div> : null}
            <GroupNotes groupId={g.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
