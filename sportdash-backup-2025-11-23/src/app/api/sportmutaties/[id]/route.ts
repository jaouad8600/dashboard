import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fsjson";

type Mutatie = {
  id: string;
  datum: string;
  jongere: string;
  activiteit: string;
  status: "open" | "afgerond";
  opmerking?: string;
};
const FILE = "sportmutaties.json";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json().catch(() => ({}));
  const list = await readJson<Mutatie[]>(FILE, []);
  const idx = list.findIndex((m) => m.id === params.id);
  if (idx === -1)
    return NextResponse.json({ error: "niet gevonden" }, { status: 404 });
  const curr = list[idx];
  list[idx] = {
    ...curr,
    datum: typeof body?.datum === "string" ? body.datum : curr.datum,
    jongere: typeof body?.jongere === "string" ? body.jongere : curr.jongere,
    activiteit:
      typeof body?.activiteit === "string" ? body.activiteit : curr.activiteit,
    status:
      body?.status === "afgerond"
        ? "afgerond"
        : body?.status === "open"
          ? "open"
          : curr.status,
    opmerking:
      typeof body?.opmerking === "string" ? body.opmerking : curr.opmerking,
  };
  await writeJson(FILE, list);
  return NextResponse.json(list[idx]);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const list = await readJson<Mutatie[]>(FILE, []);
  const next = list.filter((m) => m.id !== params.id);
  if (next.length === list.length)
    return NextResponse.json({ error: "niet gevonden" }, { status: 404 });
  await writeJson(FILE, next);
  return NextResponse.json({ ok: true });
}
