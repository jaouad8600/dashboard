import { NextResponse } from "next/server";

export type Indicatie = {
  id: string;
  naam: string;
  type: string;
  status: "Open" | "In behandeling" | "Afgerond";
  start?: string;
  eind?: string;
  opmerking?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __INDICATIES__: Indicatie[] | undefined;
}

function seed(): Indicatie[] {
  const today = new Date().toISOString().slice(0,10);
  return [
    { id: crypto.randomUUID(), naam: "Tidiane Kamara", type: "Sportindicatie", status: "Open", start: today, opmerking: "Aanvraag binnen" },
    { id: crypto.randomUUID(), naam: "M. Janssen",       type: "Begeleiding",    status: "In behandeling", start: today },
    { id: crypto.randomUUID(), naam: "A. de Vries",      type: "Sportindicatie", status: "Afgerond", start: today, eind: today },
  ];
}

const store = (globalThis as any).__INDICATIES__ ?? seed();
(globalThis as any).__INDICATIES__ = store;

export async function GET() {
  return NextResponse.json(store, { status: 200 });
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const naam = String(b.naam ?? "").trim();
  const type = String(b.type ?? "").trim();
  if (!naam || !type) {
    return NextResponse.json({ error: "naam en type zijn verplicht" }, { status: 400 });
  }
  const item = {
    id: crypto.randomUUID(),
    naam,
    type,
    status: (["Open","In behandeling","Afgerond"] as const).includes(b.status) ? b.status : "Open",
    start: b.start ? String(b.start) : new Date().toISOString().slice(0,10),
    eind: b.eind ? String(b.eind) : undefined,
    opmerking: b.opmerking ? String(b.opmerking) : undefined,
  } satisfies Indicatie;
  store.unshift(item);
  return NextResponse.json(item, { status: 201 });
}
