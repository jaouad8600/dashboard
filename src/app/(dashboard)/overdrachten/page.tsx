"use client";

import { useEffect, useMemo, useState } from "react";
import { GROUPS_OFFICIAL, normalizeGroup } from "@/lib/clientStore";

type DagGroup = {
  group: string;
  headcount?: number;
  sfeer?: string;
  timeouts?: string[];
  incidenten?: string[];
  sancties?: string[];
  afspraken?: string[];
  transport?: string[];
};
type DagOverdracht = {
  header?: { datum?: string; savedAt?: string };
  groups: DagGroup[];
};

function readJSON<T>(k:string, def:T):T {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; }
}
function writeJSON(k:string, v:any){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} }

function parseDag(text:string): DagOverdracht {
  const lines = text.split(/\r?\n/).map(l=>l.replace(/\t/g," ").trim());
  const groups: DagGroup[] = [];
  let cur: DagGroup | null = null;

  const gRegex = new RegExp(
    `^(?:groep\\s+)?(?:de\\s+)?(${GROUPS_OFFICIAL.join("|")})\\b`, "i"
  );

  // header datum
  const datumLine = lines.find(l => /^datum\s*:/.test(l.toLowerCase()));
  const datum = datumLine ? datumLine.split(":").slice(1).join(":").trim() : undefined;

  const pushCur = () => { if(cur) groups.push(cur); cur = null; };

  for(const raw of lines){
    if(!raw) continue;
    const m = raw.match(gRegex);
    if(m){
      pushCur();
      const name = normalizeGroup(m[1]) || m[1];
      cur = { group: name, timeouts:[], incidenten:[], sancties:[], afspraken:[], transport:[] };
      continue;
    }
    if(!cur) continue;

    const l = raw;

    // sfeer
    if(/sfeer/i.test(l) && !cur.sfeer){
      cur.sfeer = l.replace(/^\s*sfeer\s*:?\s*/i,"").trim() || l;
    }

    // headcount
    const hc = l.match(/\b(\d+)\s*(?:jongens|jongere[n]?|jeugdigen)/i);
    if(hc && !cur.headcount) cur.headcount = parseInt(hc[1],10);

    // time-outs
    if(/\btime[-\s]?out|\bTO\b/i.test(l)) cur.timeouts!.push(l);

    // incidenten/alarm/geweld
    if(/\balarm|vechtpartij|fysiek|bloedneus|bedreig|dreig|geweld|korte\s*time[-\s]?out/i.test(l))
      cur.incidenten!.push(l);

    // sancties / ordemaatregelen / OM / AP-A / OB / JR
    if(/\b(ordemaatregel|OM\b|AP-A|OB\b|sancti|JR\b)/i.test(l))
      cur.sancties!.push(l);

    // afspraken
    if(/\bafspraak|afspraken|NIFP|advocaat|therapie|PMT|MDFT|schematherapie/i.test(l))
      cur.afspraken!.push(l);

    // transport
    if(/\btransport|overgeplaatst|overplaatsing/i.test(l))
      cur.transport!.push(l);
  }
  pushCur();

  // opruimen lege arrays
  for(const g of groups){
    if(g.timeouts && g.timeouts.length===0) delete g.timeouts;
    if(g.incidenten && g.incidenten.length===0) delete g.incidenten;
    if(g.sancties && g.sancties.length===0) delete g.sancties;
    if(g.afspraken && g.afspraken.length===0) delete g.afspraken;
    if(g.transport && g.transport.length===0) delete g.transport;
  }

  return { header: { datum, savedAt: new Date().toISOString() }, groups };
}

export default function OverdrachtenPage(){
  const [raw,setRaw] = useState("");
  const [parsed,setParsed] = useState<DagOverdracht | null>(null);

  // laad laatste
  useEffect(()=>{
    setRaw(readJSON("overdracht-last-raw",""));
    setParsed(readJSON("overdracht-last-json", null));
  },[]);

  function doParse(){
    const doc = parseDag(raw);
    writeJSON("overdracht-last-raw", raw);
    writeJSON("overdracht-last-json", doc);
    setParsed(doc);
    alert("Dag-overdracht opgeslagen. Dashboard-meldingen gebruiken deze data.");
  }

  function clearAll(){
    localStorage.removeItem("overdracht-last-raw");
    localStorage.removeItem("overdracht-last-json");
    setParsed(null);
    setRaw("");
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">Overdrachten</h1>
      <div className="text-sm opacity-70">Alleen <b>Dag-overdracht</b>. Sportrapport en andere onderdelen zijn verwijderd van deze pagina.</div>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="grid gap-2">
          <h2 className="font-semibold">Plak je dag-overdracht</h2>
          <textarea
            value={raw}
            onChange={e=>setRaw(e.target.value)}
            className="w-full min-h-[240px] border rounded-2xl p-3 bg-white"
            placeholder="Plak hier de dag-overdracht…"
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={doParse} className="px-3 py-2 rounded-xl border bg-white hover:bg-zinc-50">Parse & Opslaan</button>
            <button onClick={clearAll} className="px-3 py-2 rounded-xl border bg-white hover:bg-zinc-50">Leeg maken</button>
          </div>
        </section>

        <section className="grid gap-2">
          <h2 className="font-semibold">Resultaat</h2>
          {!parsed ? (
            <div className="border rounded-2xl p-3 bg-zinc-50 text-sm opacity-70">Nog niets geparsed.</div>
          ) : (
            <div className="border rounded-2xl p-3 bg-white grid gap-3">
              <div className="text-sm opacity-70">
                Datum: <b>{parsed.header?.datum || "onbekend"}</b> • opgeslagen: {new Date(parsed.header?.savedAt || "").toLocaleString("nl-NL") || "—"}
              </div>
              <div className="grid gap-2">
                {parsed.groups.map(g=>(
                  <div key={g.group} className="border rounded-xl p-2">
                    <div className="font-medium">{g.group}</div>
                    <div className="text-xs opacity-70">
                      {g.headcount ? <>Aantal: {g.headcount} • </> : null}
                      {g.sfeer ? <>Sfeer: {g.sfeer}</> : "Geen sfeerregel gevonden"}
                    </div>
                    <div className="mt-1 grid gap-1 text-sm">
                      {g.incidenten && g.incidenten.length>0 && (
                        <div><b>Incidenten:</b><br/>{g.incidenten.map((l,i)=><div key={i} className="opacity-80">• {l}</div>)}</div>
                      )}
                      {g.timeouts && g.timeouts.length>0 && (
                        <div><b>Time-outs:</b><br/>{g.timeouts.map((l,i)=><div key={i} className="opacity-80">• {l}</div>)}</div>
                      )}
                      {g.sancties && g.sancties.length>0 && (
                        <div><b>Sancties:</b><br/>{g.sancties.map((l,i)=><div key={i} className="opacity-80">• {l}</div>)}</div>
                      )}
                      {g.afspraken && g.afspraken.length>0 && (
                        <div><b>Afspraken:</b><br/>{g.afspraken.map((l,i)=><div key={i} className="opacity-80">• {l}</div>)}</div>
                      )}
                      {g.transport && g.transport.length>0 && (
                        <div><b>Transport:</b><br/>{g.transport.map((l,i)=><div key={i} className="opacity-80">• {l}</div>)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
