"use client";
import { useState, useEffect } from "react";

const GROUPS = [
  "Poel A",
  "Poel B",
  "Lier",
  "Zijl",
  "Nes",
  "Vliet",
  "Gaag",
  "Kust",
  "Golf",
  "Zift",
  "Lei",
  "Kade",
  "Kreek",
  "Duin",
  "Rak",
  "Bron",
];

function seed() {
  // Groepen (met wat Rood erin)
  const groups = GROUPS.map((name, idx) => ({
    id: `g-${name.toLowerCase()}`,
    name,
    state: (["Groen", "Geel", "Oranje", "Rood"] as const)[idx % 4],
    note: idx % 5 === 0 ? "Let op: extra toezicht" : undefined,
  }));
  localStorage.setItem("groups", JSON.stringify(groups));

  // Overdrachten (laatste overdracht zichtbaar op dashboard)
  const overdrachten = [
    {
      id: String(Date.now()),
      ts: new Date().toISOString(),
      group: "Zijl",
      title: "Overdracht avondploeg",
      author: "Teamleider",
      body: "Basketbal verplaatst naar 16:30; blessure bij Kade gemeld.",
    },
  ];
  localStorage.setItem("overdrachten", JSON.stringify(overdrachten));

  // Indicaties
  const indicaties = [
    { id: "i1", group: "Kade", title: "Bezoek-beperking", active: true },
    { id: "i2", group: "Zijl", title: "Rustig opstarten", active: true },
  ];
  localStorage.setItem("indicaties", JSON.stringify(indicaties));

  // Sportmutaties (medische dienst)
  const sportmutaties = [
    {
      id: "s1",
      group: "Zijl",
      type: "Niet sporten",
      active: true,
      author: "Medische dienst",
    },
    {
      id: "s2",
      group: "Vliet",
      type: "Beperkt",
      active: true,
      author: "Medische dienst",
    },
  ];
  localStorage.setItem("sportmutaties", JSON.stringify(sportmutaties));
}

function clearAll() {
  for (const k of ["groups", "overdrachten", "indicaties", "sportmutaties"]) {
    localStorage.removeItem(k);
  }
}

export default function DevPage() {
  const [snap, setSnap] = useState({
    groups: 0,
    red: 0,
    overdrachten: 0,
    indicaties: 0,
    sportmutaties: 0,
  });
  const refresh = () => {
    const groups = JSON.parse(localStorage.getItem("groups") || "[]");
    const red = groups.filter((g: any) => g.state === "Rood").length;
    setSnap({
      groups: groups.length,
      red,
      overdrachten: JSON.parse(localStorage.getItem("overdrachten") || "[]")
        .length,
      indicaties: JSON.parse(localStorage.getItem("indicaties") || "[]").length,
      sportmutaties: JSON.parse(localStorage.getItem("sportmutaties") || "[]")
        .length,
    });
  };
  useEffect(() => {
    refresh();
  }, []);
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dev tools</h1>
      <div className="flex gap-2">
        <button
          className="btn btn-primary px-3 py-2 rounded bg-emerald-600 text-white btn"
          onClick={() => {
            seed();
            refresh();
          }}
        >
          Seed demo-data
        </button>
        <button
          className="btn btn-primary px-3 py-2 rounded bg-red-600 text-white btn"
          onClick={() => {
            clearAll();
            refresh();
          }}
        >
          Leegmaken
        </button>
      </div>
      <div className="text-sm text-zinc-600">
        <div>
          groups: {snap.groups} (Rood: {snap.red})
        </div>
        <div>overdrachten: {snap.overdrachten}</div>
        <div>indicaties: {snap.indicaties}</div>
        <div>sportmutaties: {snap.sportmutaties}</div>
      </div>
      <p className="text-xs text-zinc-500">
        Open /dev → klik <b>Seed demo-data</b> → ga terug naar het dashboard en
        ververs (F5).
      </p>
    </div>
  );
}
