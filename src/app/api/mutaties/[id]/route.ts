import { NextResponse } from "next/server";
import { patchMutatie, removeMutatie } from "@/lib/mutaties.data";

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const b = await req.json().catch(() => ({}));
  const it = await patchMutatie(params.id, b);
  return NextResponse.json(it);
}

export async function DELETE(_req: Request, { params }: { params: { id: string }}) {
  await removeMutatie(params.id);
  return NextResponse.json({ ok: true });
}
