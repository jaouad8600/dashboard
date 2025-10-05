import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type Overdracht = {
  id: string;
  datumISO: string;
  tijd: string;
  auteur?: string;
  bericht: string;
  belangrijk?: boolean;
  createdAt: string;
};

const dataFile = path.join(process.cwd(), "var", "overdrachten.json");

async function load(): Promise<Overdracht[]> {
  try {
    const buf = await fs.readFile(dataFile, "utf8");
    const arr = JSON.parse(buf);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
async function save(rows: Overdracht[]) {
  await fs.writeFile(dataFile, JSON.stringify(rows, null, 2), "utf8");
}

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const id = params.id;
  const patch = await req.json().catch(() => ({}));
  const rows = await load();
  const idx = rows.findIndex(r => r.id === id);
  if (idx === -1) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const r = rows[idx];
  if (typeof patch.bericht === "string") r.bericht = patch.bericht.trim();
  if (typeof patch.auteur === "string")  r.auteur  = patch.auteur.trim() || undefined;
  if (typeof patch.belangrijk === "boolean") r.belangrijk = patch.belangrijk;

  rows[idx] = r;
  await save(rows);
  return NextResponse.json(r);
}

export async function DELETE(_req: Request, { params }: { params: { id: string }}) {
  const id = params.id;
  const rows = await load();
  const kept = rows.filter(r => r.id !== id);
  if (kept.length === rows.length) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
  await save(kept);
  return NextResponse.json({ ok: true });
}
