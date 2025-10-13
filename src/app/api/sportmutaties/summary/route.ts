import { NextResponse } from "next/server";
import { readJson } from "@/lib/fsjson";

type Mutatie = { id: string; status: "open" | "afgerond" };

export async function GET() {
  const list = await readJson<Mutatie[]>("sportmutaties.json", []);
  const open = list.filter((m) => m.status !== "afgerond").length;
  const totaal = list.length;
  return NextResponse.json({ open, totaal });
}
