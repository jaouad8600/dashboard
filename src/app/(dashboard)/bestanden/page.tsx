"use client";
import { useState } from "react";
import { loadFiles, saveFiles, FileLink, GROUPS } from "@/lib/clientStore";

export default function Bestanden() {
  const [list, setList] = useState<FileLink[]>(() => loadFiles());
  const [form, setForm] = useState({
    title: "",
    url: "",
    group: "Algemeen",
    note: "",
  });

  function add() {
    if (!form.title.trim() || !form.url.trim()) return;
    const next = [{ id: crypto.randomUUID(), ...form }, ...list];
    saveFiles(next);
    setList(next);
    setForm({ title: "", url: "", group: "Algemeen", note: "" });
  }
  function remove(id: string) {
    const next = list.filter((f) => f.id !== id);
    saveFiles(next);
    setList(next);
  }

  return (
    <div className="grid gap-3">
      <h1 className="text-xl font-bold">Bestanden/Links</h1>
      <div className="grid md:grid-cols-5 gap-2 p-3 rounded-2xl border bg-white">
        <div className="md:col-span-2">
          <div className="text-xs opacity-70 mb-1">Titel</div>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="px-2 py-2 rounded-xl border w-full"
          />
        </div>
        <div className="md:col-span-2">
          <div className="text-xs opacity-70 mb-1">
            URL (SharePoint/Teams/anders)
          </div>
          <input
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            className="px-2 py-2 rounded-xl border w-full"
            placeholder="https://..."
          />
        </div>
        <div>
          <div className="text-xs opacity-70 mb-1">Groep</div>
          <select
            value={form.group}
            onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
            className="px-2 py-2 rounded-xl border w-full"
          >
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-5">
          <div className="text-xs opacity-70 mb-1">Notitie (optioneel)</div>
          <input
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className="px-2 py-2 rounded-xl border w-full"
          />
        </div>
        <div className="md:col-span-5">
          <button onClick={add} className="px-3 py-2 rounded-xl border btn">
            Toevoegen
          </button>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="text-left p-2">Titel</th>
              <th className="text-left p-2">Groep</th>
              <th className="text-left p-2">Link</th>
              <th className="text-left p-2">Notitie</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="p-2">{f.title}</td>
                <td className="p-2">{f.group || "—"}</td>
                <td className="p-2">
                  <a
                    className="underline text-brand-700"
                    href={f.url}
                    target="_blank"
                  >
                    Open
                  </a>
                </td>
                <td className="p-2">{f.note}</td>
                <td className="p-2 text-right">
                  <button
                    className="btn"
                    onClick={() => remove(f.id)}
                    className="px-2 py-1 rounded-lg border"
                  >
                    Verwijder
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td className="p-3 text-sm opacity-70" colSpan={5}>
                  Nog geen bestanden/links.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
