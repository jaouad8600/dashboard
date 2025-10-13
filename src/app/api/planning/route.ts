import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, uid } from "../../../lib/db";

export type SportMoment = {
  id: string;
  title: string;
  start: string; // ISO
  end: string; // ISO
  groepId?: string | null;
  type?: "sportverbod" | "fitness" | "open" | "gesloten" | "pauze" | string;
  status?: "gepland" | "geannuleerd" | "afgerond" | string;
  notities?: string;
  color?: string;
};

function inRange(ev: SportMoment, start?: Date, end?: Date) {
  if (!start && !end) return true;
  const s = new Date(ev.start).getTime();
  const e = new Date(ev.end).getTime();
  const from = start?.getTime() ?? -Infinity;
  const to = end?.getTime() ?? Infinity;
  return s < to && e > from;
}

// GET ?start=ISO&end=ISO  (of ?date=YYYY-MM-DD)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const startQ = searchParams.get("start");
  const endQ = searchParams.get("end");

  let start: Date | undefined;
  let end: Date | undefined;

  if (date) {
    const d = new Date(date);
    start = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0),
    );
    end = new Date(
      Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate() + 1,
        0,
        0,
        0,
      ),
    );
  } else if (startQ || endQ) {
    if (startQ) start = new Date(startQ);
    if (endQ) end = new Date(endQ);
  }

  const db = readDB<any>();
  const items: SportMoment[] = db.planning?.items ?? [];
  const filtered = items.filter((ev) => inRange(ev, start, end));
  return NextResponse.json({ items: filtered });
}

// CREATE
export async function POST(req: NextRequest) {
  const body = await req.json();
  let { title, start, end, groepId, type, status, notities, color } =
    body || {};
  if (!start || !end)
    return NextResponse.json(
      { error: "start en end zijn verplicht" },
      { status: 400 },
    );

  const db = readDB<any>();
  const item: SportMoment = {
    id: uid(),
    title: title || "Sportmoment",
    start,
    end,
    groepId: groepId ?? null,
    type,
    status: status ?? "gepland",
    notities,
    color,
  };

  db.planning = db.planning || { items: [] };
  db.planning.items = db.planning.items || [];
  db.planning.items.push(item);
  writeDB(db);

  return NextResponse.json(item, { status: 201 });
}

// UPDATE (body moet id bevatten)
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...rest } = body || {};
  if (!id)
    return NextResponse.json({ error: "id is verplicht" }, { status: 400 });

  const db = readDB<any>();
  const items: SportMoment[] = db.planning?.items ?? [];
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1)
    return NextResponse.json({ error: "niet gevonden" }, { status: 404 });

  items[idx] = { ...items[idx], ...rest, id };
  db.planning.items = items;
  writeDB(db);

  return NextResponse.json(items[idx]);
}

// DELETE (body: {id})
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id } = body || {};
  if (!id)
    return NextResponse.json({ error: "id is verplicht" }, { status: 400 });

  const db = readDB<any>();
  const items: SportMoment[] = db.planning?.items ?? [];
  const next = items.filter((x) => x.id !== id);
  const removed = items.length - next.length;

  db.planning.items = next;
  writeDB(db);

  if (!removed)
    return NextResponse.json({ error: "niet gevonden" }, { status: 404 });
  return NextResponse.json({ ok: true, removed: 1 });
}
