import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const DB_PATH = path.join(process.cwd(), "data", "app-data.json");

function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    return { groepen: [], planning: { items: [] }, extraMoments: [] as any[] };
  }
  const raw = fs.readFileSync(DB_PATH, "utf8");
  const db = JSON.parse(raw || "{}");
  db.groepen ||= [];
  db.planning ||= { items: [] };
  db.planning.items ||= [];
  db.extraMoments ||= [];
  return db;
}

function writeDb(db: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const aggregate = searchParams.get("aggregate");
  const db = readDb();

  if (aggregate) {
    // aantal per groep
    const byGroup: Record<string, number> = {};
    for (const m of db.extraMoments) {
      byGroup[m.groepId] = (byGroup[m.groepId] || 0) + 1;
    }
    const rows = db.groepen.map((g: any) => ({
      groepId: g.id,
      groepNaam: g.naam || g.name || g.title || g.id,
      aantal: byGroup[g.id] || 0,
    }));
    // sort desc op aantal
    rows.sort((a: any, b: any) => b.aantal - a.aantal);
    return NextResponse.json({ rows });
  }

  // laatste 50 items
  const items = [...db.extraMoments]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 50)
    .map((m) => ({
      ...m,
      groepNaam:
        db.groepen.find((g: any) => g.id === m.groepId)?.naam ||
        db.groepen.find((g: any) => g.id === m.groepId)?.name ||
        m.groepId,
    }));

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { groepId, datum, duur = 60, notities = "" } = body || {};
    if (!groepId) {
      return NextResponse.json(
        { error: "groepId is verplicht" },
        { status: 400 },
      );
    }
    const db = readDb();
    const groep = db.groepen.find((g: any) => g.id === groepId);
    if (!groep) {
      return NextResponse.json({ error: "Onbekende groepId" }, { status: 404 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const item = {
      id,
      groepId,
      datum: datum || now,
      duur,
      notities,
      createdAt: now,
      isExtra: true,
    };
    db.extraMoments.push(item);
    writeDb(db);
    return NextResponse.json({ ok: true, item });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Onbekende fout" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "id is verplicht" }, { status: 400 });
  const db = readDb();
  const before = db.extraMoments.length;
  db.extraMoments = db.extraMoments.filter((m: any) => m.id !== id);
  const removed = before - db.extraMoments.length;
  writeDb(db);
  return NextResponse.json({ ok: true, removed });
}
