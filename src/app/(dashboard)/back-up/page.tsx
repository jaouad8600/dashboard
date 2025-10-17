"use client";

const KEYS = [
  "rbc-events-v1",
  "active-group",
  "overdracht-last-raw",
  "overdracht-last-json",
  "overdracht-sport-last-raw",
  "overdracht-sport-last-json",
  "sportmutaties-v1",
  "files-links-v1",
  "logs-v1",
  "visits-v1",
  "restrictions-v1",
  "sport-restrictions-v1",
  "week-plan-overrides-v1",
  "indicaties-v1",
];

export default function Backup() {
  function exportAll() {
    const out = {} as Record<string, any>;
    for (const k of KEYS) {
      try {
        out[k] = JSON.parse(localStorage.getItem(k) ?? "null");
      } catch {
        out[k] = null;
      }
    }
    const blob = new Blob([JSON.stringify(out, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sportdash-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  async function importAll(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    try {
      const data = JSON.parse(text);
      for (const k of KEYS) {
        if (Object.prototype.hasOwnProperty.call(data, k)) {
          localStorage.setItem(k, JSON.stringify(data[k]));
        }
      }
      alert("Import klaar. Ververs /admin om data terug te zien.");
    } catch {
      alert("Ongeldige JSON.");
    }
    e.currentTarget.value = "";
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">Back-up</h1>
      <div className="rounded-2xl border bg-white p-4 grid gap-3">
        <button
          onClick={exportAll}
          className="btn btn-primary px-3 py-2 rounded-xl border hover:bg-zinc-50 btn"
        >
          Exporteer JSON
        </button>
        <label className="text-sm">
          Importeer JSON:
          <input
            type="file"
            accept="application/json"
            onChange={importAll}
            className="ml-2"
          />
        </label>
        <div className="text-xs opacity-70">
          Slaat o.a. kalender, mutaties en indicaties op.
        </div>
      </div>
    </div>
  );
}
