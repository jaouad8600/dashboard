"use client";

import { useEffect, useState } from "react";

const DEFAULT_GROUPS = [
  "Poel A",
  "Poel B",
  "Lier",
  "Zijl",
  "Nes",
  "Vliet",
  "Gaag",
  "Kust",
  "Golf",
  "Zift",
  "Lei",
  "Kade",
  "Kreek",
  "Duin",
  "Rak",
  "Bron",
  "Eb",
  "Vloed",
];

export default function MigratieToolsPage() {
  const [keys, setKeys] = useState<string[]>([]);
  const [preview, setPreview] = useState<string>("");

  const refresh = () => {
    try {
      const ks = Object.keys(localStorage).sort();
      setKeys(ks);
      setPreview(
        ks
          .map(
            (k) =>
              `${k}: ${(localStorage.getItem(k) ?? "").slice(0, 120)}${(localStorage.getItem(k)?.length || 0) > 120 ? "…" : ""}`,
          )
          .join("\n"),
      );
    } catch {
      setKeys([]);
      setPreview(
        "localStorage niet beschikbaar (moet client-side in browser).",
      );
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  function migrateOverdrachten() {
    const candidates = ["overdrachten", "overdracht", "handover"];
    let src: string | null = null;
    for (const k of candidates) {
      const v = localStorage.getItem(k);
      if (v) {
        src = v;
        break;
      }
    }
    if (src) {
      localStorage.setItem("overdrachten", src);
      alert("✅ Overdrachten gemigreerd naar key 'overdrachten'.");
      refresh();
    } else {
      alert(
        "⚠️ Geen brondata gevonden voor overdrachten (overdrachten/overdracht/handover).",
      );
    }
  }

  function seedGroups() {
    localStorage.setItem("groups", JSON.stringify(DEFAULT_GROUPS));
    alert("✅ Groepen gezet in key 'groups'.");
    refresh();
  }

  function exportAll() {
    const dump: Record<string, string | null> = {};
    for (const k of Object.keys(localStorage)) {
      dump[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "localStorage-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importAll(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(String(r.result || "{}")) as Record<
          string,
          string | null
        >;
        Object.entries(data).forEach(([k, v]) => {
          if (v === null) localStorage.removeItem(k);
          else localStorage.setItem(k, v);
        });
        alert("✅ Import klaar.");
        refresh();
      } catch (e: any) {
        alert("Import fout: " + (e?.message || e));
      }
    };
    r.readAsText(file);
    ev.target.value = "";
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Tools · Migratie & Back-up</h1>

      <div className="flex gap-2 flex-wrap">
        <button className="rounded-lg border px-3 py-2" onClick={refresh}>
          Ververs
        </button>
        <button
          className="rounded-lg border px-3 py-2"
          onClick={migrateOverdrachten}
        >
          Migreer Overdrachten
        </button>
        <button className="rounded-lg border px-3 py-2" onClick={seedGroups}>
          Seed Groepen
        </button>
        <button className="rounded-lg border px-3 py-2" onClick={exportAll}>
          Exporteer alle localStorage
        </button>
        <label className="rounded-lg border px-3 py-2 cursor-pointer">
          Import JSON
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={importAll}
          />
        </label>
      </div>

      <div className="rounded-2xl border bg-white p-3">
        <div className="text-sm text-zinc-600 mb-2">Keys ({keys.length}):</div>
        <pre className="text-xs whitespace-pre-wrap">{preview}</pre>
      </div>

      <p className="text-xs text-zinc-500">
        Tip: gebruik deze pagina alleen in de browser waar je data zich bevindt.
        localStorage is <b>per origin</b> (URL+poort) gescheiden.
      </p>
    </div>
  );
}
