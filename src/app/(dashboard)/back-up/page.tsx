"use client";
export default function Backup(){
  function exportAll(){
    const keys = [
      "rbc-events-v1","active-group",
      "overdracht-last-raw","overdracht-last-json",
      "overdracht-sport-last-raw","overdracht-sport-last-json",
      "mutaties-v1","files-links-v1","logs-v1"
    ];
    const out:Record<string,any>={};
    for(const k of keys){ try{ out[k]=JSON.parse(localStorage.getItem(k)||"null"); }catch{ out[k]=null; } }
    const blob = new Blob([JSON.stringify(out,null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="sportdash-backup.json"; a.click();
  }
  function importAll(e:React.ChangeEvent<HTMLInputElement>){
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{ try{
      const data=JSON.parse(String(r.result));
      Object.keys(data).forEach(k=>localStorage.setItem(k,JSON.stringify(data[k])));
      alert("Geïmporteerd. Herlaad de pagina.");
    }catch{ alert("Ongeldige JSON."); } };
    r.readAsText(f);
  }
  return (
    <div className="grid gap-3">
      <h1 className="text-xl font-bold">Back-up</h1>
      <div className="grid gap-2 p-3 rounded-2xl border bg-white">
        <button onClick={exportAll} className="px-3 py-2 rounded-xl border">Exporteer alles (JSON)</button>
        <label className="px-3 py-2 rounded-xl border w-fit cursor-pointer">
          Importeer JSON
          <input type="file" accept="application/json" onChange={importAll} className="hidden"/>
        </label>
        <div className="text-sm opacity-70">Na import: refresh en ga naar /admin.</div>
      </div>
    </div>
  );
}
