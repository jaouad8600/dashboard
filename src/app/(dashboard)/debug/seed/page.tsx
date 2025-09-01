"use client";
export default function Seed(){
  function seedEvents(){
    const now=new Date();
    const mk=(h:number,m:number)=>new Date(now.getFullYear(),now.getMonth(),now.getDate(),h,m);
    const evts=[
      { id:crypto.randomUUID(), title:"Fitness (Poel)", start:mk(12,0), end:mk(12,45), tide:"eb", group:"Poel" },
      { id:crypto.randomUUID(), title:"Voetbal (Gaag)", start:mk(17,0), end:mk(17,45), tide:"vloed", group:"Gaag" }
    ];
    localStorage.setItem("rbc-events-v1", JSON.stringify(evts));
    localStorage.setItem("active-group","Poel");
    alert("Events seeded.");
  }
  function seedOverdracht(){
    const dag=`Gaag
De sfeer op de Gaag is wisselend. Alarm om 18:15 wegens hard slaan op pingpongtafel.
Time-out: Rayan korte TO wegens grote mond.
Sanctie: Abdullahi OM om 17:00.
Kust
Sfeer prima. Geen incidenten.`;
    const sport=`Groep: De Golf
Bijzonderheden: sportmoment stopgezet wegens onsportief gedrag en scheldwoorden.
Groep: De Zift
Bijzonderheden: gevoetbald tegen de Duin, goede sfeer.`;
    localStorage.setItem("overdracht-last-raw",dag);
    localStorage.setItem("overdracht-sport-last-raw",sport);
    alert("Overdracht-ruw seeded. Ga naar Overdrachten en klik Parse + Opslaan.");
  }
  return (
    <div className="p-4 grid gap-3">
      <h1 className="text-xl font-bold">Debug / Seed</h1>
      <button onClick={seedEvents} className="px-3 py-2 rounded-xl border">Seed demo events</button>
      <button onClick={seedOverdracht} className="px-3 py-2 rounded-xl border">Seed demo overdracht</button>
      <p className="text-sm opacity-70">Daarna: /overdrachten → Parse + Opslaan → /admin</p>
    </div>
  );
}
