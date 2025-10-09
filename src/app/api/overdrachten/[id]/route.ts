import { NextResponse } from "next/server";
import { updateOverdracht, deleteOverdracht } from "@/server/store";

export async function PATCH(req: Request, { params }: any) {
  const body = await req.json();
  const updated = await updateOverdracht(params.id, body);
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: any) {
  await deleteOverdracht(params.id);
  return NextResponse.json({ ok: true });
}
