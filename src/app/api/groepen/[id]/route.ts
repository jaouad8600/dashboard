import { NextResponse } from "next/server";
import { updateGroep, deleteGroep } from "@/server/store";

export async function PATCH(req: Request, { params }: any) {
  const body = await req.json();
  const g = await updateGroep(params.id, body);
  return NextResponse.json(g);
}

export async function DELETE(req: Request, { params }: any) {
  await deleteGroep(params.id);
  return NextResponse.json({ ok: true });
}
