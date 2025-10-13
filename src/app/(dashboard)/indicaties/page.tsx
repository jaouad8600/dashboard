'use client';
import React, { useEffect, useState } from 'react';

type AnyObj = Record<string, any>;

export default function IndicatiesPage(){
  const [loading,setLoading]=useState(true);
  const [data,setData]=useState<AnyObj|null>(null);
  const [err,setErr]=useState<string|null>(null);

  async function load(){
    setLoading(true); setErr(null);
    try{
      const r=await fetch('/api/indicaties/summary',{cache:'no-store'});
      if(!r.ok) throw new Error('Kon indicaties niet laden');
      const j=await r.json();
      setData(j);
    }catch(e:any){ setErr(e.message||'Onbekende fout'); }
    finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); },[]);

  function renderValue(v:any){
    if(v==null) return <span className="text-gray-500">—</span>;
    if(typeof v==='number' || typeof v==='string' || typeof v==='boolean') return <span>{String(v)}</span>;
    if(Array.isArray(v)) return (
      <ul className="list-disc pl-5 space-y-1">
        {v.map((it,i)=><li key={i} className="break-all">{typeof it==='object'? JSON.stringify(it) : String(it)}</li>)}
      </ul>
    );
    return <pre className="text-xs bg-gray-50 rounded-xl p-3 overflow-auto">{JSON.stringify(v,null,2)}</pre>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Indicaties</h1>
        <button onClick={load} className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:opacity-90">Herladen</button>
      </div>

      {loading && <div className="text-gray-600">Laden…</div>}
      {err && <div className="text-red-600">{err}</div>}

      {!loading && !err && data && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(data).map(([k,v])=>(
            <div key={k} className="border rounded-2xl p-4 bg-white">
              <div className="text-sm text-gray-500 mb-1">{k}</div>
              <div className="font-medium">{renderValue(v)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
