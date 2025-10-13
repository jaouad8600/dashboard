import { NextResponse } from "next/server";
import { updateIndicatie, deleteIndicatie } from "@/server/store";
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json().catch(() => ({}));
  await updateIndicatie(params.id, body || {});
  return NextResponse.json({ ok: true });
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  await deleteIndicatie(params.id);
  return NextResponse.json({ ok: true });
}
