import { NextResponse } from "next/server";
import { readDb, updateItem, deleteItem } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const db = await readDb();
  const item = db.planning.items.find((i) => i.id === params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const partial = await req.json();
  const item = await updateItem(params.id, partial);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const ok = await deleteItem(params.id);
  return NextResponse.json({ ok });
}
