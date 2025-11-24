import { NextResponse } from "next/server";
import {
  listMaterialen,
  addMateriaal,
  updateMateriaal,
  deleteMateriaal,
} from "@/server/store";

export async function GET() {
  const list = await listMaterialen();
  return NextResponse.json(list, { headers: { "cache-control": "no-store" } });
}
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const it = await addMateriaal(body || {});
    return NextResponse.json(it);
  } catch (e: any) {
    return NextResponse.json(
      { error: String(e?.message || e) },
      { status: 400 },
    );
  }
}
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { id, ...patch } = body || {};
  if (!id) return NextResponse.json({ error: "id verplicht" }, { status: 400 });
  try {
    const it = await updateMateriaal(id, patch);
    return NextResponse.json(it);
  } catch (e: any) {
    return NextResponse.json(
      { error: String(e?.message || e) },
      { status: 400 },
    );
  }
}
export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { id } = body || {};
  if (!id) return NextResponse.json({ error: "id verplicht" }, { status: 400 });
  await deleteMateriaal(id);
  return NextResponse.json({ ok: true });
}
