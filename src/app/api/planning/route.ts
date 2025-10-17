export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const FILE = path.join(process.cwd(), "data", "planning.json");

type Event = {
  id: string;
  title: string;          // kalender gebruikt 'title'
  start: string;          // ISO
  end?: string;           // ISO
  location?: string;      // optioneel
  afdeling?: string;      // optioneel
};

// kleine helpers
async function fileExists(p: string) { try { await fs.stat(p); return true; } catch { return false; } }
const toTime = (iso?: string) => (iso ? new Date(iso).getTime() : NaN);

// normaliseer item keys (voor als er 'titel'/'locatie' etc. zouden staan)
function normalizeRow(e: any, idx: number): Event {
  return {
    id: e.id ?? String(idx),
    title: e.title ?? e.titel ?? "Onbenoemd",
    start: e.start ?? e.date ?? e.datum ?? new Date().toISOString(),
    end: e.end ?? e.eind ?? undefined,
    location: e.location ?? e.locatie ?? undefined,
    afdeling: e.afdeling ?? e.group ?? undefined,
  };
}

export async function GET(req: Request) {
  // 1) Lees bronbestand (gedeeld met Kalender)
  if (!(await fileExists(FILE))) {
    // als de data-map ooit gewist raakt, geef lege lijst terug i.p.v. 500
    return NextResponse.json([], { status: 200 });
  }
  const raw = await fs.readFile(FILE, "utf8");
  const parsed = JSON.parse(raw);
  const events: Event[] = Array.isArray(parsed) ? parsed.map(normalizeRow) : [];

  // 2) Query params
  const url = new URL(req.url);
  const startQ = url.searchParams.get("start");
  const endQ   = url.searchParams.get("end");
  const dateQ  = url.searchParams.get("date"); // tegel (dashboard)

  // 3) Kalender-modus → geef volledige events terug
  if (startQ || endQ) {
    const tStart = startQ ? toTime(startQ) : -Infinity;
    const tEnd   = endQ   ? toTime(endQ)   :  Infinity;
    const within = events
      .filter(e => {
        const t = toTime(e.start);
        return !Number.isNaN(t) && t >= tStart && t < tEnd;
      })
      .sort((a, b) => toTime(a.start) - toTime(b.start));
    return NextResponse.json(within, { status: 200 });
  }

  // 4) Tegel-modus → ?date=YYYY-MM-DD (of default: vandaag)
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = pad(today.getMonth() + 1);
  const dd = pad(today.getDate());
  const day = (dateQ || `${yyyy}-${mm}-${dd}`);

  // filter op 00:00..23:59 UTC van de dag
  const t0 = toTime(`${day}T00:00:00Z`);
  const t1 = toTime(`${day}T23:59:59Z`);
  const dayEvents = events
    .filter(e => {
      const t = toTime(e.start);
      return !Number.isNaN(t) && t >= t0 && t <= t1;
    })
    .sort((a, b) => toTime(a.start) - toTime(b.start));

  // 5) Vorm specifiek voor de tegel (zoals Dashboard verwacht)
  const tile = dayEvents.map(e => ({
    id: e.id,
    tijd: new Date(e.start).toISOString().slice(11, 16), // HH:MM
    titel: e.title,
    locatie: e.location ?? null,
  }));

  return NextResponse.json(tile, { status: 200 });
}
