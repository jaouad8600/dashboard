import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fsjson";

type Mutatie = {
  id: string;
  datum: string; // ISO
  jongere: string;
  activiteit: string;
  status: "open" | "afgerond";
  opmerking?: string;
};

const FILE = "sportmutaties.json";

export async function GET() {
  const list = await readJson<Mutatie[]>(FILE, []);
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const now = new Date().toISOString();
  const nieuw: Mutatie = {
    id: crypto.randomUUID(),
    datum: typeof body?.datum === "string" ? body.datum : now,
    jongere: String(body?.jongere || "").trim(),
    activiteit: String(body?.activiteit || "").trim(),
    status: body?.status === "afgerond" ? "afgerond" : "open",
    opmerking:
      typeof body?.opmerking === "string" ? body.opmerking.trim() : undefined,
  };
  if (!nieuw.jongere || !nieuw.activiteit) {
    return NextResponse.json(
      { error: "jongere en activiteit verplicht" },
      { status: 400 },
    );
  }
  const list = await readJson<Mutatie[]>(FILE, []);
  list.unshift(nieuw);
  await writeJson(FILE, list);
  return NextResponse.json(nieuw, { status: 201 });
}
