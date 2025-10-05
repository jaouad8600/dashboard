export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { listMutaties, saveMutaties, type Mutatie } from "@/lib/mutaties.store";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").toLowerCase();
  const status = url.searchParams.get("status") as Mutatie["status"] | null;
  const all = await listMutaties();
  const filtered = all
    .filter(m => !status || m.status === status)
    .filter(m => {
      if (!q) return true;
      return (
        m.titel.toLowerCase().includes(q) ||
        (m.omschrijving || "").toLowerCase().includes(q) ||
        (m.categorie || "").toLowerCase().includes(q) ||
        (m.auteur || "").toLowerCase().includes(q)
      );
    })
    .sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json(filtered);
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const titel = String(b.titel ?? "").trim();
  if (!titel) return NextResponse.json({ error: "titel is verplicht" }, { status: 400 });

  const now = new Date();
  const item: Mutatie = {
    id: randomUUID(),
    titel,
    omschrijving: b.omschrijving ? String(b.omschrijving) : undefined,
    status: (["Open","In behandeling","Afgerond"] as const).includes(b.status) ? b.status : "Open",
    auteur: b.auteur ? String(b.auteur) : undefined,
    categorie: b.categorie ? String(b.categorie) : undefined,
    datumISO: (b.datumISO && String(b.datumISO)) || now.toISOString().slice(0,10),
    createdAt: now.toISOString(),
  };
  const all = await listMutaties();
  all.unshift(item);
  await saveMutaties(all);
  return NextResponse.json(item, { status: 201 });
}
