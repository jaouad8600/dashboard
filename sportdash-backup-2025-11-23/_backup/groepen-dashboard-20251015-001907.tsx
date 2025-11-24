'use client';
import { useEffect, useMemo, useState } from 'react';

type Groep = { id:string; naam?:string; name?:string; title?:string; kleur?:string; afdeling?:string };
type Indicatie = { id:string; groepId:string; status?:string };
type Mutatie = { id:string; groepId:string };

const KLEUREN = [
  { key:'groen',  label:'GROEN',  clsOn:'bg-emerald-600 text-white',    clsOff:'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  { key:'geel',   label:'GEEL',   clsOn:'bg-amber-500 text-white',      clsOff:'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  { key:'oranje', label:'ORANJE', clsOn:'bg-orange-500 text-white',     clsOff:'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  { key:'rood',   label:'ROOD',   clsOn:'bg-red-600 text-white',        clsOff:'bg-gray-100 text-gray-700 hover:bg-gray-200' },
];

function naam(g:Groep){ return g.naam || g.name || g.title || g.id; }

export default function GroepenPage(){
  const [groepen, setGroepen] = useState<Groep[]>([]);
  const [filter, setFilter]   = useState('');

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/groepen', { cache:'no-store' });
      const j = await r.json();
      setGroepen(Array.isArray(j) ? j : (j.groepen || j.groups || []));
    })();
  }, []);

  const gefilterd = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if(!f) return groepen;
    return groepen.filter(g => naam(g).toLowerCase().includes(f));
  }, [groepen, filter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Groepen</h1>
        <input
          value={filter} onChange={e=>setFilter(e.target.value)}
          placeholder="Filter…"
          className="px-3 py-2 rounded-lg border w-[260px]"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
        {gefilterd.map(g => (<GroepCard key={g.id} g={g} onKleurChange={(k)=>updateKleur(g.id,k,setGroepen)} />))}
      </div>
    </div>
  );
}

async function updateKleur(id:string, kleur:string, setGroepen:(fn: (prev:Groep[])=>Groep[])=>void){
  setGroepen(prev => prev.map(x => x.id===id ? { ...x, kleur } : x));
  const r = await fetch(`/api/groepen/${id}`, {
    method:'PUT',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ kleur })
  }).catch(()=>null);
  if(!r || !r.ok){
    // rollback is simpel: herlaad groepen endpoint
    const rr = await fetch('/api/groepen', { cache:'no-store' }).catch(()=>null);
    if(rr && rr.ok){ const j = await rr.json(); setGroepen(Array.isArray(j)? j : (j.groepen||j.groups||[])); }
  }
}

function Badge({ tone='gray', children }:{ tone?:'green'|'blue'|'gray'; children:any }){
  const map:any = {
    green:'bg-emerald-100 text-emerald-700',
    blue:'bg-indigo-100 text-indigo-700',
    gray:'bg-gray-100 text-gray-700',
  };
  return <span className={`px-2 py-0.5 text-xs rounded ${map[tone]}`}>{children}</span>;
}

function GroepCard({ g, onKleurChange }:{ g:Groep; onKleurChange:(kleur:string)=>void }){
  const [mutaties, setMutaties] = useState<Mutatie[]>([]);
  const [indicaties, setIndicaties] = useState<Indicatie[]>([]);
  const [note, setNote] = useState('');
  const [lastNote, setLastNote] = useState<{text:string; createdAt:string}|null>(null);

  useEffect(()=>{ (async()=>{
    const [m,i,n] = await Promise.all([
      fetch(`/api/mutaties?groupId=${encodeURIComponent(g.id)}`, { cache:'no-store' }).then(r=>r.json()).catch(()=>({items:[]})),
      fetch(`/api/indicaties?groupId=${encodeURIComponent(g.id)}`, { cache:'no-store' }).then(r=>r.json()).catch(()=>({items:[]})),
      fetch(`/api/aantekeningen?groupId=${encodeURIComponent(g.id)}`, { cache:'no-store' }).then(r=>r.json()).catch(()=>({items:[]})),
    ]);
    setMutaties(m.items||[]);
    setIndicaties(i.items||[]);
    const ln = (n.items||[])[0] || null;
    setLastNote(ln ? { text: ln.text, createdAt: ln.createdAt } : null);
  })(); }, [g.id]);

  const openIndicaties = indicaties.filter(x => (x.status||'open') !== 'afgerond').length;
  const openMutaties   = mutaties.length; // geen status bij mutaties → tel alles

  async function addNote(){
    const t = note.trim(); if(!t) return;
    setNote('');
    const r = await fetch('/api/aantekeningen', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ groepId: g.id, text: t })
    });
    if(r.ok){
      const j = await r.json();
      setLastNote({ text:j.item.text, createdAt:j.item.createdAt });
    }
  }

  return (
    <div className="rounded-xl border shadow-sm">
      {/* header-balk */}
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">{naam(g)}</div>
            <div className="text-sm text-gray-600">{g.afdeling || 'EB'}</div>
          </div>
          <div className="h-2 w-24 rounded-full bg-emerald-600" />
        </div>

        <div className="mt-3 flex gap-2">
          <Badge tone="green">open mutaties: {openMutaties}</Badge>
          <Badge tone="blue">open indicaties: {openIndicaties}</Badge>
        </div>

        {/* kleurstatus (pill knoppen, NL, klikbaar) */}
        <div className="mt-4">
          <div className="text-sm text-gray-700 mb-1">Kleurstatus</div>
          <div className="flex gap-2 flex-wrap">
            {KLEUREN.map(k => (
              <button
                key={k.key}
                onClick={()=>onKleurChange(k.key)}
                className={`px-3 py-1 rounded text-xs font-semibold border ${g.kleur===k.key? k.clsOn : k.clsOff}`}
                type="button"
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        {/* notities */}
        <div className="mt-4 mb-5">
          <div className="text-sm text-gray-700 mb-1">Notities</div>
          <div className="flex gap-2">
            <input
              value={note}
              onChange={e=>setNote(e.target.value)}
              placeholder="Voeg notitie toe…"
              className="flex-1 px-3 py-2 rounded-lg border"
            />
            <button onClick={addNote} className="px-3 py-2 rounded-lg border bg-emerald-600 text-white hover:bg-emerald-700">
              Toevoegen
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {lastNote
              ? `${new Date(lastNote.createdAt).toLocaleString()} — Aangemaakt`
              : 'Nog geen notities'}
          </div>
        </div>
      </div>
    </div>
  );
}