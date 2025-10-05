import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type Overdracht = {
  id: string;
  datumISO: string;   // YYYY-MM-DD
  tijd: string;       // HH:MM
  auteur?: string;
  bericht: string;
  belangrijk?: boolean;
  createdAt: string;  // ISO datetime
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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || "50");
  const all = await load();
  // sort desc op createdAt
  const sorted = [...all].sort((a,b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return NextResponse.json(sorted.slice(0, Math.max(1, Math.min(limit, 500))));
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const bericht = (b.bericht ?? "").toString().trim();
  const auteur  = (b.auteur ?? "").toString().trim() || undefined;
  const belangrijk = Boolean(b.belangrijk);

  if (!bericht) {
    return NextResponse.json({ error: "Bericht is verplicht." }, { status: 400 });
  }

  const now = new Date();
  const pad2 = (n:number)=>String(n).padStart(2,"0");
  const datumISO = `${now.getFullYear()}-${pad2(now.getMonth()+1)}-${pad2(now.getDate())}`;
  const tijd     = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

  const rows = await load();
  const row: Overdracht = {
    id: crypto.randomUUID(),
    datumISO,
    tijd,
    auteur,
    bericht,
    belangrijk,
    createdAt: now.toISOString(),
  };
  rows.push(row);
  await save(rows);
  return NextResponse.json(row, { status: 201 });
}
