"use client";

function addMinutes(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m + minutes, 0, 0);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

import { useEffect, useMemo, useState } from "react";
import {
  WEEK_DAYS,
  WEEKEND_DAYS,
  WEEK_TIMES,
  WEEKEND_TIMES,
  BASE_SCHEDULE,
  getBaseCell,
  type WeekDay,
  type CellColor,
} from "@/lib/weekSchedule";

// Snelkeuzes die handig zijn bij invullen
const QUICK_GROUPS = [
  "Poel A","Poel B",
  "Eb","Poel","Lier","Zijl","Nes","Vliet","Gaag",
  "Vloed","Kust","Golf","Zift","Lei","Kade","Kreek","Duin","Rak","Bron",
];

type CustomFill = { group?: string; color?: Exclude<CellColor, "pause">; note?: string };
type CustomMap = Record<string, CustomFill>; // key: `${day}|${time}`

const LS_KEY = "calendar_custom_fills_v1";

function useCustomFills() {
  const [fills, setFills] = useState<CustomMap>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setFills(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(LS_KEY, JSON.stringify(fills));
  }, [fills, mounted]);

  return { fills, setFills, mounted };
}

function classForColor(color?: CellColor) {
  switch (color) {
    case "pause":
      return "bg-amber-100 text-amber-900 ring-1 ring-amber-200"; // pauze (vaste kleur)
    case "green":
      return "bg-green-50 text-green-800 ring-1 ring-green-200";
    case "orange":
      return "bg-orange-50 text-orange-800 ring-1 ring-orange-200";
    case "yellow":
      return "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200";
    case "red":
      return "bg-red-50 text-red-800 ring-1 ring-red-200";
    default:
      return "bg-white text-zinc-800";
  }
}

type EditorState = {
  open: boolean;
  day?: WeekDay;
  time?: string;
  value: string;
  color: Exclude<CellColor, "pause"> | "";
  note: string;
};

export default function KalenderPage() {
  const { fills, setFills, mounted } = useCustomFills();

  const [editor, setEditor] = useState<EditorState>({
    open: false,
    value: "",
    color: "",
    note: "",
  });

  const openEditor = (day: WeekDay, time: string) => {
    const key = `${day}|${time}`;
    const base = getBaseCell(day, time);
    const current = fills[key] ?? {};
    setEditor({
      open: true,
      day,
      time,
      value: current.group ?? base?.group ?? "",
      color: (current.color ?? "") as EditorState["color"],
      note: current.note ?? base?.note ?? "",
    });
  };

  const saveEditor = () => {
    if (!editor.day || !editor.time) return;
    const key = `${editor.day}|${editor.time}`;

    // Als je leeglaat, verwijderen we custom invulling (valt terug op basis)
    if (!editor.value) {
      setFills((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    } else {
      setFills((prev) => ({
        ...prev,
        [key]: {
          group: editor.value,
          color: editor.color || undefined,
          note: editor.note || undefined,
        },
      }));
    }
    setEditor((e) => ({ ...e, open: false }));
  };

  const clearEditor = () => {
    if (!editor.day || !editor.time) return;
    const key = `${editor.day}|${editor.time}`;
    setFills((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    setEditor((e) => ({ ...e, open: false }));
  };

  const cancelEditor = () => setEditor((e) => ({ ...e, open: false }));

  // Render niet server-side om hydration verschillen te voorkomen
  if (!mounted) return null;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Kalender</h1>

      {/* DOORDEWEEKS */}
      <SectionTable
        title="Doordeweeks"
        days={WEEK_DAYS as unknown as WeekDay[]}
        times={WEEK_TIMES as unknown as string[]}
        fills={fills}
        onCellClick={openEditor}
      />

      {/* WEEKEND */}
      <SectionTable
        title="Weekend"
        days={WEEKEND_DAYS as unknown as WeekDay[]}
        times={WEEKEND_TIMES as unknown as string[]}
        fills={fills}
        onCellClick={openEditor}
        durationLabelMinutes={45}   // headers als "start–eindtijd"
      />

      {/* Editor */}
      {editor.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-lg">
            <div className="mb-3">
              <div className="text-sm text-zinc-500">
                {editor.day} • {editor.time}
              </div>
              <div className="text-lg font-semibold">Blok invullen</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Groep / tekst</label>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={editor.value}
                  onChange={(e) => setEditor((s) => ({ ...s, value: e.target.value }))}
                  placeholder="Bijv. Poel A, Vliet, Fitness…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Kleur</label>
                <div className="flex flex-wrap gap-2">
                  {(["", "green", "orange", "yellow", "red"] as const).map((c) => (
                    <button
                      key={c || "none"}
                      onClick={() => setEditor((s) => ({ ...s, color: c as any }))}
                      className={
                        "rounded-lg border px-3 py-1 text-sm hover:bg-zinc-50 " +
                        (editor.color === c ? "ring-2 ring-indigo-500" : "")
                      }
                    >
                      {c === "" ? "Geen" : c}
                    </button>
                  ))}
                  <span className="ml-2 text-xs text-zinc-500">
                    (Pauze heeft automatisch amber)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notitie (optioneel)</label>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={editor.note}
                  onChange={(e) => setEditor((s) => ({ ...s, note: e.target.value }))}
                  placeholder="Bijv. 16:00–16:45 of extra info"
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-medium">Snelkeuze</div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_GROUPS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setEditor((s) => ({ ...s, value: g }))}
                      className="inline-flex items-center rounded-lg border px-2 py-1 text-sm hover:bg-zinc-50"
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={clearEditor}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-zinc-50"
              >
                Leegmaken
              </button>
              <div className="space-x-2">
                <button
                  onClick={cancelEditor}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-zinc-50"
                >
                  Annuleren
                </button>
                <button
                  onClick={saveEditor}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                >
                  Opslaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTable({
  title,
  days,
  times,
  fills,
  onCellClick,
  durationLabelMinutes,
}: {
  title: string;
  days: WeekDay[];
  times: string[];
  fills: CustomMap;
  onCellClick: (day: WeekDay, time: string) => void;
  durationLabelMinutes?: number;      // toon "start–eindtijd" in kop
}) {
  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full border border-zinc-200 text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="sticky left-0 z-10 bg-zinc-50 border-b border-zinc-200 p-2 text-left">Dag</th>
              {times.map((t) => {
                const label = durationLabelMinutes ? `${t}–${addMinutes(t, durationLabelMinutes)}` : t;
                return (
                  <th key={t} className="border-b border-l border-zinc-200 p-2 text-center">
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d} className="odd:bg-white even:bg-zinc-50/30">
                <td className="sticky left-0 z-10 bg-white border-t border-r border-zinc-200 p-2 font-medium">
                  {d}
                </td>
                {times.map((t) => {
                  const key = `${d}|${t}`;
                  const base = getBaseCell(d, t);
                  // combine: custom override > base
                  const group = (fills[key]?.group ?? base?.group) || "";
                  const note = fills[key]?.note ?? base?.note;
                  const color: CellColor | undefined =
                    fills[key]?.color ?? base?.color ?? undefined;

                  const isPause = group === "PAUZE";
                  const classes =
                    "min-w-[9rem] align-top border-t border-l border-zinc-200 p-2 " +
                    (isPause ? classForColor("pause") : classForColor(color));

                  return (
                    <td key={t} className={classes}>
                      <button
                        onClick={() => onCellClick(d, t)}
                        className="block w-full text-left"
                        title="Klik om te bewerken"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium">
                            {group || <span className="text-zinc-400">—</span>}
                          </div>
                          <span className="text-xs text-zinc-400">Bewerken</span>
                        </div>
                        {note && <div className="mt-1 text-xs text-zinc-600">{note}</div>}
                        {!group && !note && (
                          <div className="text-xs text-zinc-400">Klik om te vullen…</div>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-amber-200 ring-1 ring-amber-300 inline-block" /> Pauze
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-green-100 ring-1 ring-green-200 inline-block" /> Groen
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-yellow-100 ring-1 ring-yellow-200 inline-block" /> Geel
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-orange-100 ring-1 ring-orange-200 inline-block" /> Oranje
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-red-100 ring-1 ring-red-200 inline-block" /> Rood
        </span>
      </div>
    </div>
  );
}
