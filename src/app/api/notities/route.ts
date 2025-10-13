import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "../../../lib/db";

export const dynamic = "force-dynamic";
type Note = { id: string; groupId: string; text: string; createdAt: string };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId") || "";
  const db = readDB<any>();
  const all: Note[] = db.notes ?? [];
  return NextResponse.json({
    items: all.filter((n) => !groupId || n.groupId === groupId),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.groupId || !body?.text)
    return NextResponse.json(
      { error: "groupId en text verplicht" },
      { status: 400 },
    );
  const db = readDB<any>();
  db.notes ??= [];
  const note: Note = {
    id: "nt_" + Math.random().toString(36).slice(2, 9),
    groupId: body.groupId,
    text: body.text,
    createdAt: new Date().toISOString(),
  };
  db.notes.push(note);
  writeDB(db);
  return NextResponse.json(note, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  if (!body?.id)
    return NextResponse.json({ error: "id verplicht" }, { status: 400 });
  const db = readDB<any>();
  db.notes ??= [];
  const before = db.notes.length;
  db.notes = db.notes.filter((n: Note) => n.id !== body.id);
  writeDB(db);
  return NextResponse.json({ removed: before - db.notes.length });
}
