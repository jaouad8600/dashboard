import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const base = path.join(process.cwd(), "public", "indicaties");
  let items: string[] = [];
  try {
    const all = await fs.readdir(base);
    items = all.filter((f) => f.endsWith(".docx") || f.endsWith(".html"));
  } catch {}
  return NextResponse.json({ files: items });
}
