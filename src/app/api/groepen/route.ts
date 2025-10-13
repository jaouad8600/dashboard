import { NextResponse } from "next/server";
import { listGroepen, updateGroepKleur } from "@/server/store";

export async function GET() {
  const data = await listGroepen();
  return NextResponse.json(data, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { id, kleur } = body || {};
  if (!id || !kleur)
    return NextResponse.json(
      { error: "id en kleur verplicht" },
      { status: 400 },
    );
  const g = await updateGroepKleur(id, kleur);
  return NextResponse.json(g, { headers: { "cache-control": "no-store" } });
}
