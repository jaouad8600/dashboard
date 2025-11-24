import { NextResponse } from "next/server";
import { listNotes, createNote } from "@/server/notesStore";

const headers = { "cache-control": "no-store" };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const groupId = url.searchParams.get("groupId") ?? url.searchParams.get("groepId") ?? undefined;
  const includeArchived = (url.searchParams.get("archived") ?? "false").toLowerCase()==="true";
  const items = await listNotes(groupId, includeArchived);
  return NextResponse.json({ items }, { headers });
}

export async function POST(req: Request) {
  const body = await req.json().catch(()=> ({} as any));
  const groupId = body.groupId ?? body.groepId;
  const text = (body.text ?? body.opmerking ?? body.content ?? body.body ?? "").trim();
  if (!groupId || !text) {
    return NextResponse.json({ error: "groupId en text zijn verplicht" }, { status: 400, headers });
  }
  const item = await createNote({ groupId, text });
  return NextResponse.json({ item }, { headers });
}
