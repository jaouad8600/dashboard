import { NextResponse } from "next/server";
import { listNotes, updateNote, deleteNote } from "@/server/notesStore";

const headers = { "cache-control": "no-store" };

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const items = await listNotes();
  const item = items.find(n => n.id === id);
  if (!item) return NextResponse.json({ error: "Niet gevonden" }, { status: 404, headers });
  return NextResponse.json({ item }, { headers });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(()=> ({} as any));
  const patch: any = {};
  if (typeof body.text !== "undefined" || typeof body.opmerking !== "undefined" || typeof body.content !== "undefined") {
    patch.text = String(body.text ?? body.opmerking ?? body.content ?? "").trim();
  }
  if (typeof body.archived !== "undefined") patch.archived = !!body.archived;
  const item = await updateNote(id, patch);
  if (!item) return NextResponse.json({ error: "Niet gevonden" }, { status: 404, headers });
  return NextResponse.json({ item }, { headers });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  // zelfde gedrag als PATCH
  return PATCH(req, ctx as any);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ok = await deleteNote(id);
  if (!ok) return NextResponse.json({ error: "Niet gevonden" }, { status: 404, headers });
  return NextResponse.json({ ok: true }, { headers });
}
