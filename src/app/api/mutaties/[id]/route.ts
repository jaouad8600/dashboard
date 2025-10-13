import { NextResponse } from "next/server";
import { updateMutatie, deleteMutatie } from "@/server/store";
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json().catch(() => ({}));
  await updateMutatie(params.id, body || {});
  return NextResponse.json({ ok: true });
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  await deleteMutatie(params.id);
  return NextResponse.json({ ok: true });
}
