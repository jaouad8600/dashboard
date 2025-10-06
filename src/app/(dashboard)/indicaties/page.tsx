"use client";
import { useEffect, useState } from "react";

type Indicatie = {
  id: string; naam: string; type?: string; status?: string; start?: string; eind?: string; opmerking?: string;
};

export default function IndicatiesPage() {
  const [items, setItems] = useState<Indicatie[]>([]);
  const [sel, setSel] = useState<Indicatie|null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/indicaties", { cache:"no-store" });
    const data = r.ok ? await r.json() as Indicatie[] : [];
    setItems(data);
    if (data.length && !sel) setSel(data[0]);
    setLoading(false);
  }
  useEffect(()=>{ load(); }, []);

  async function add(form: FormData) {
    const payload = Object.fromEntries(form.entries());
    const r = await fetch("/api/indicaties", {
      method:"POST", headers:{ "content-type":"application/json" },
      body: JSON.stringify(payload)
    });
    if (r.ok) {
      const it = await r.json() as Indicatie;
      setItems([it, ...items]);
      setSel(it);
    } else { alert("Toevoegen mislukt"); }
  }

  async function save(id: string, form: FormData) {
    const payload = Object.fromEntries(form.entries());
    const r = await fetch(`/api/indicaties/${id}`, {
      method:"PATCH", headers:{ "content-type":"application/json" },
      body: JSON.stringify(payload)
    });
    if (r.ok) {
      const it = await r.json() as Indicatie;
      setItems(items.map(x=>x.id===id?it:x));
      setSel(it);
    } else { alert("Opslaan mislukt"); }
  }

  async function remove(id: string) {
    if (!confirm("Verwijderen?")) return;
    const r = await fetch(`/api/indicaties/${id}`, { method:"DELETE" });
    if (r.ok) {
      const rest = items.filter(x=>x.id!==id);
      setItems(rest);
      setSel(rest[0] || null);
    } else { alert("Verwijderen mislukt"); }
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Indicaties</h1>
          <details className="relative">
            <summary className="cursor-pointer rounded-lg border px-3 py-1 text-sm">Nieuwe indicatie</summary>
            <div className="absolute right-0 z-10 mt-2 w-80 rounded-xl border bg-white p-3 shadow">
              <form className="space-y-2" onSubmit={async (e)=>{ e.preventDefault(); await add(new FormData(e.currentTarget)); (e.currentTarget as HTMLFormElement).reset(); }}>
                <input name="naam" required placeholder="Naam" className="w-full rounded-lg border px-3 py-2 text-sm" />
                <input name="type" placeholder="Type" className="w-full rounded-lg border px-3 py-2 text-sm" />
                <input name="status" placeholder="Status (bv. Open)" className="w-full rounded-lg border px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <input name="start" type="date" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                  <input name="eind" type="date" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                </div>
                <textarea name="opmerking" placeholder="Opmerking" className="w-full rounded-lg border px-3 py-2 text-sm" />
                <button className="w-full rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Toevoegen</button>
              </form>
            </div>
          </details>
        </div>

        <div className="rounded-xl border bg-white divide-y max-h-[70vh] overflow-y-auto">
          {loading && <div className="p-3 text-sm text-zinc-500">Laden…</div>}
          {!loading && items.length===0 && <div className="p-3 text-sm text-zinc-500">Nog geen indicaties.</div>}
          {items.map(i=>(
            <button key={i.id}
              onClick={()=>setSel(i)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 ${sel?.id===i.id?"bg-zinc-50":""}`}>
              <div className="font-medium">{i.naam}</div>
              <div className="text-xs text-zinc-500">{i.type||"—"} {i.status?`• ${i.status}`:""}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        {!sel ? (
          <div className="rounded-xl border bg-white p-6 text-sm text-zinc-500">Selecteer links een indicatie.</div>
        ) : (
          <div className="rounded-xl border bg-white p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{sel.naam}</h2>
              <button onClick={()=>remove(sel.id)} className="text-sm rounded-lg border px-3 py-1 hover:bg-rose-50">Verwijderen</button>
            </div>
            <form className="grid gap-3"
              onSubmit={async (e)=>{ e.preventDefault(); await save(sel.id, new FormData(e.currentTarget)); }}>
              <input name="naam" defaultValue={sel.naam} className="rounded-lg border px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input name="type" defaultValue={sel.type||""} placeholder="Type" className="rounded-lg border px-3 py-2 text-sm" />
                <input name="status" defaultValue={sel.status||""} placeholder="Status" className="rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input name="start" type="date" defaultValue={sel.start||""} className="rounded-lg border px-3 py-2 text-sm" />
                <input name="eind" type="date" defaultValue={sel.eind||""} className="rounded-lg border px-3 py-2 text-sm" />
              </div>
              <textarea name="opmerking" defaultValue={sel.opmerking||""} placeholder="Opmerking" className="min-h-28 rounded-lg border px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <button className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Opslaan</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
