"use client";
import { useEffect, useMemo, useState } from "react";

type Kleur = "GREEN"|"YELLOW"|"ORANGE"|"RED";
type Note = { id:string; tekst:string; auteur?:string; createdAt:string };
type Groep = { id:string; naam:string; afdeling:"EB"|"VLOED"; kleur:Kleur; notities:Note[] };

export default function GroepenPage(){
  const [groepen,setGroepen] = useState<Groep[]>([]);
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState<string>();

  async function load(){
    try{
      const r = await fetch("/api/groepen", { cache:"no-store" });
      const j = await r.json();
      setGroepen(Array.isArray(j)? j : []);
      setErr(undefined);
    }catch(e:any){ setErr(e?.message||"error"); }
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  async function setKleur(id:string, kleur:Kleur){
    await fetch("/api/groepen", { method:"PATCH", headers:{ "content-type":"application/json" }, body: JSON.stringify({ id, kleur }) });
    load();
  }
  async function addNote(id:string, tekst:string){
    if(!tekst.trim()) return;
    await fetch("/api/groepen/notitie", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ groepId:id, tekst }) });
    load();
  }

  const eb = useMemo(()=> groepen.filter(g=>g.afdeling==="EB"),[groepen]);
  const vloed = useMemo(()=> groepen.filter(g=>g.afdeling==="VLOED"),[groepen]);
  const KLEUREN:Kleur[] = ["GREEN","YELLOW","ORANGE","RED"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Groepen</h1>
      {loading && <div className="text-gray-500">Laden…</div>}
      {err && <div className="text-rose-600">{err}</div>}

      <section>
        <h2 className="text-lg font-semibold mb-3">Afdeling EB</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {(eb||[]).map(g=>(
            <div key={g.id} className="bg-white rounded-xl shadow p-4 border-t-4"
                 style={{ borderTopColor: g.kleur==="GREEN"?"#16a34a": g.kleur==="YELLOW"?"#f59e0b": g.kleur==="ORANGE"?"#ea580c":"#dc2626" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-semibold">{g.naam}</div>
                  <div className="text-gray-500 text-sm">{g.afdeling}</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-1">Kleurstatus</div>
                <div className="flex gap-2">
                  {KLEUREN.map(k=>(
                    <button key={k} onClick={()=>setKleur(g.id,k)}
                      className={`px-2 py-1 rounded ${g.kleur===k?'bg-green-700 text-white':'bg-gray-100'}`}>{k}</button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-1">Notities</div>
                <ul className="space-y-1 max-h-32 overflow-auto">
                  {(g.notities||[]).map(n=>(
                    <li key={n.id} className="text-sm text-gray-700">• {n.tekst}</li>
                  ))}
                </ul>
                <form className="mt-2 flex gap-2" onSubmit={(e:any)=>{e.preventDefault(); const t=e.currentTarget.note.value; addNote(g.id,t); e.currentTarget.reset();}}>
                  <input name="note" placeholder="Nieuwe notitie…" className="border rounded px-2 py-1 w-full"/>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Toevoegen</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Afdeling Vloed</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {(vloed||[]).map(g=>(
            <div key={g.id} className="bg-white rounded-xl shadow p-4 border-t-4"
                 style={{ borderTopColor: g.kleur==="GREEN"?"#16a34a": g.kleur==="YELLOW"?"#f59e0b": g.kleur==="ORANGE"?"#ea580c":"#dc2626" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-semibold">{g.naam}</div>
                  <div className="text-gray-500 text-sm">{g.afdeling}</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-1">Kleurstatus</div>
                <div className="flex gap-2">
                  {KLEUREN.map(k=>(
                    <button key={k} onClick={()=>setKleur(g.id,k)}
                      className={`px-2 py-1 rounded ${g.kleur===k?'bg-green-700 text-white':'bg-gray-100'}`}>{k}</button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-1">Notities</div>
                <ul className="space-y-1 max-h-32 overflow-auto">
                  {(g.notities||[]).map(n=>(
                    <li key={n.id} className="text-sm text-gray-700">• {n.tekst}</li>
                  ))}
                </ul>
                <form className="mt-2 flex gap-2" onSubmit={(e:any)=>{e.preventDefault(); const t=e.currentTarget.note.value; addNote(g.id,t); e.currentTarget.reset();}}>
                  <input name="note" placeholder="Nieuwe notitie…" className="border rounded px-2 py-1 w-full"/>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Toevoegen</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
