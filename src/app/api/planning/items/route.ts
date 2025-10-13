import { NextResponse } from "next/server";
import { addItem, readDb, isSameDay } from "@/lib/db";
import type { SportItem } from "@/types/planning";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date"); // YYYY-MM-DD
  const from = searchParams.get("from"); // ISO
  const to = searchParams.get("to"); // ISO
  const db = await readDb();
  let items = db.planning.items;

  if (date) {
    const target = new Date(date + "T00:00:00");
    items = items.filter((i) => isSameDay(i.start, target.toISOString()));
  } else if (from || to) {
    items = items.filter((i) => {
      const s = new Date(i.start).getTime();
      return (
        (!from || s >= new Date(from).getTime()) &&
        (!to || s <= new Date(to).getTime())
      );
    });
  }

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = await req.json();
  const now = new Date();
  const item: SportItem = {
    id: crypto.randomUUID(),
    title: body.title ?? "Sportmoment",
    start: body.start ?? now.toISOString(),
    end: body.end ?? new Date(now.getTime() + 60 * 60000).toISOString(),
    groupId: body.groupId ?? undefined,
    status: body.status ?? "open",
    type: body.type ?? "fitness",
    notes: Array.isArray(body.notes) ? body.notes : [],
  };
  await addItem(item);
  return NextResponse.json(item, { status: 201 });
}
