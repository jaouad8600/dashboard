"use client";
import type { DB, Group } from "./types";

const KEY = "sportdashDB";

function seedGroups(): Group[] {
  // Vul hier later echte SharePoint namen in; voorlopig 12 groepen
  return Array.from({ length: 12 }, (_, i) => ({
    id: `g${i + 1}`,
    name: `Groep ${i + 1}`,
    state: "Groen" as const,
  }));
}

function defaultDB(): DB {
  return {
    groups: seedGroups(),
    sportmutaties: [],
    overdrachten: [],
    plannerEvents: [],
    indicaties: [],
    lastUpdated: Date.now(),
  };
}

export function readDB(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultDB();
    const parsed = JSON.parse(raw) as DB;
    // sanity fallbacks
    if (!parsed.groups?.length) parsed.groups = defaultDB().groups;
    return parsed;
  } catch {
    return defaultDB();
  }
}

export function writeDB(updater: (prev: DB) => DB): DB {
  const next = updater(readDB());
  next.lastUpdated = Date.now();
  localStorage.setItem(KEY, JSON.stringify(next));
  // sync tussen tabs & in-tab
  window.dispatchEvent(
    new StorageEvent("storage", { key: KEY, newValue: JSON.stringify(next) }),
  );
  window.dispatchEvent(new CustomEvent("sportdash:db", { detail: next }));
  return next;
}

// Hook met live updates (storage events + periodic sanity poll)
import { useEffect, useState } from "react";
export function useDB() {
  const [db, setDb] = useState<DB>(() =>
    typeof window === "undefined" ? defaultDB() : readDB(),
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setDb(readDB());
    };
    const onCustom = () => setDb(readDB());
    window.addEventListener("storage", onStorage);
    window.addEventListener("sportdash:db", onCustom as EventListener);
    const id = setInterval(() => setDb(readDB()), 2000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("sportdash:db", onCustom as EventListener);
      clearInterval(id);
    };
  }, []);

  const update = (updater: (prev: DB) => DB) => setDb(writeDB(updater));
  return [db, update] as const;
}
