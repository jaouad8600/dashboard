import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function startEndOf(dateStr?: string) {
  const now = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  const start = new Date(now);
  start.setHours(0,0,0,0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || undefined;
    const { start, end } = startEndOf(date);
    const rows = await prisma.planning.findMany({
      where: { start: { gte: start }, eind: { lt: end } },
      orderBy: [{ start: "asc" }],
    });
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Serverfout" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const item = await prisma.planning.create({
      data: {
        titel: String(b.titel ?? "Activiteit"),
        locatie: String(b.locatie ?? "Onbekend"),
        start: new Date(b.start),
        eind: new Date(b.eind),
        notitie: b.notitie ? String(b.notitie) : null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Kan niet toevoegen" }, { status: 500 });
  }
}
