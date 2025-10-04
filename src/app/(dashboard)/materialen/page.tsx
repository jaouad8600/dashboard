"use client";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import {
  listMaterialen,
  addMateriaal,
  duplicateMateriaal,
  deleteMateriaal,
  updateMateriaal,
} from "@/lib/materialen";

const LOCATIES = ["Eb Fitness","Fitness Vloed","Gymzaal Vloed","Gymzaal Eb","Sportveld","Dojo"];
const STATUSSEN = ["Beschikbaar","Uitgeleend","Kapot"];

export default function MaterialenPage() {
  const safeList = () => (Array.isArray(listMaterialen()) ? listMaterialen() : []);
  const [materialen, setMaterialen] = useState(safeList());
  const [naam, setNaam] = useState("");
  const [aantal, setAantal] = useState(1);
  const [locatie, setLocatie] = useState(LOCATIES[0]);
  const [status, setStatus] = useState(STATUSSEN[0]);
  const [zoek, setZoek] = useState("");
  const [filterLocatie, setFilterLocatie] = useState("Alle");
  const [filterStatus, setFilterStatus] = useState("Alle");
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({ naam: "", aantal: 1, locatie: LOCATIES[0], status: STATUSSEN[0] });

  useEffect(() => setMaterialen(safeList()), []);

  const handleAdd = () => {
    if (!naam.trim()) return;
    addMateriaal({ naam, aantal, locatie, status });
    setNaam(""); setAantal(1); setLocatie(LOCATIES[0]); setStatus(STATUSSEN[0]);
    setMaterialen(safeList());
  };

  const handleDelete = (id: string) => { if (confirm("Verwijderen?")) { deleteMateriaal(id); setMaterialen(safeList()); } };
  const handleDuplicate = (id: string) => { duplicateMateriaal(id); setMaterialen(safeList()); };
  const handleEditStart = (m: any) => { setEditId(m.id); setEditData({ naam: m.naam, aantal: m.aantal, locatie: m.locatie, status: m.status }); };
  const handleEditSave = () => { if (!editId) return; updateMateriaal(editId, editData); setEditId(null); setMaterialen(safeList()); };

  const filtered = materialen.filter((m: any) => {
    const zoekMatch = m.naam.toLowerCase().includes(zoek.toLowerCase());
    const locMatch = filterLocatie === "Alle" || m.locatie === filterLocatie;
    const statMatch = filterStatus === "Alle" || m.status === filterStatus;
    return zoekMatch && locMatch && statMatch;
  });

  const totaalAantal = filtered.reduce((sum: number, m: any) => sum + (Number(m.aantal) || 0), 0);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Inventaris Materialen", 14, 16);
    doc.setFontSize(10);
    let y = 28;
    filtered.forEach((m: any, i: number) => {
      const line = `${i + 1}. ${m.naam} | ${m.aantal} stuks | ${m.locatie} | ${m.status}`;
      doc.text(line, 14, y);
      y += 7;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.text(`Totaal: ${filtered.length} materialen (${totaalAantal} stuks)`, 14, y + 6);
    doc.save("inventaris.pdf");
  };

  const selectStyle =
    "rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition";

  if (typeof window === "undefined") return null;
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Inventaris Materialen</h1>

      {/* Toevoegen */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm grid gap-3 sm:grid-cols-2">
        <div className="flex flex-wrap gap-3">
          <input className="rounded-xl border px-3 py-2 flex-1 shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
            placeholder="Materiaalnaam" value={naam} onChange={(e) => setNaam(e.target.value)} />
          <input type="number" className="rounded-xl border px-3 py-2 w-24 shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
            value={aantal} onChange={(e) => setAantal(Number(e.target.value))} />
          <select className={selectStyle} value={locatie} onChange={(e) => setLocatie(e.target.value)}>
            {LOCATIES.map((l) => (<option key={l}>{l}</option>))}
          </select>
          <select className={selectStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSSEN.map((s) => (<option key={s}>{s}</option>))}
          </select>
          <button onClick={handleAdd}
            className="rounded-xl bg-indigo-600 px-3 py-2 text-white font-medium hover:bg-indigo-700 shadow-sm">Toevoegen</button>
        </div>
        <div className="flex gap-2">
          <input className="rounded-xl border px-3 py-2 flex-1 shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
            placeholder="Zoeken..." value={zoek} onChange={(e) => setZoek(e.target.value)} />
          <button onClick={exportPDF}
            className="rounded-xl bg-green-600 text-white px-3 py-2 font-medium hover:bg-green-700 shadow-sm">PDF Export</button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm flex flex-wrap gap-4">
        <div>
          <label className="text-sm text-zinc-600 mr-2">Filter locatie:</label>
          <select className={selectStyle}
            value={filterLocatie} onChange={(e) => setFilterLocatie(e.target.value)}>
            <option>Alle</option>
            {LOCATIES.map((l) => (<option key={l}>{l}</option>))}
          </select>
        </div>
        <div>
          <label className="text-sm text-zinc-600 mr-2">Filter status:</label>
          <select className={selectStyle}
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option>Alle</option>
            {STATUSSEN.map((s) => (<option key={s}>{s}</option>))}
          </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="text-sm text-zinc-500">Geen materialen gevonden</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Naam</th>
                <th className="text-left py-2 px-3">Aantal</th>
                <th className="text-left py-2 px-3">Locatie</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-right py-2 px-3">Acties</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m: any) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="py-2 px-3">
                    {editId === m.id
                      ? <input className="border rounded-lg px-2 py-1 w-full focus:ring-1 focus:ring-indigo-200"
                          value={editData.naam}
                          onChange={(e)=>setEditData({...editData, naam:e.target.value})}/>
                      : m.naam}
                  </td>
                  <td className="py-2 px-3">
                    {editId === m.id
                      ? <input type="number" className="border rounded-lg px-2 py-1 w-20 focus:ring-1 focus:ring-indigo-200"
                          value={editData.aantal}
                          onChange={(e)=>setEditData({...editData, aantal:Number(e.target.value)})}/>
                      : m.aantal}
                  </td>
                  <td className="py-2 px-3">
                    {editId === m.id
                      ? <select className={selectStyle}
                          value={editData.locatie}
                          onChange={(e)=>setEditData({...editData, locatie:e.target.value})}>
                          {LOCATIES.map(l=><option key={l}>{l}</option>)}
                        </select>
                      : m.locatie}
                  </td>
                  <td className="py-2 px-3">
                    {editId === m.id
                      ? <select className={selectStyle}
                          value={editData.status}
                          onChange={(e)=>setEditData({...editData, status:e.target.value})}>
                          {STATUSSEN.map(s=><option key={s}>{s}</option>)}
                        </select>
                      : m.status}
                  </td>
                  <td className="py-2 px-3 text-right space-x-2">
                    {editId === m.id ? (
                      <button onClick={handleEditSave}
                        className="rounded bg-green-600 text-white px-2 py-1 text-xs hover:bg-green-700">Opslaan</button>
                    ) : (
                      <button onClick={() => handleEditStart(m)}
                        className="rounded bg-yellow-100 px-2 py-1 text-xs hover:bg-yellow-200">Bewerk</button>
                    )}
                    <button onClick={() => handleDuplicate(m.id)}
                      className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200">Dupliceer</button>
                    <button onClick={() => handleDelete(m.id)}
                      className="rounded bg-red-100 px-2 py-1 text-xs hover:bg-red-200">Verwijder</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-sm text-zinc-600">
        <span className="font-medium">{filtered.length}</span> materialen zichtbaar,{" "}
        <span className="font-medium">{totaalAantal}</span> stuks in voorraad.
      </div>
    </div>
  );
}
