import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function POST(req: Request) {
  const { file }: { file?: string } = await req.json().catch(() => ({}));
  if (!file)
    return NextResponse.json(
      { error: "file param verplicht" },
      { status: 400 },
    );

  const full = path.join(process.cwd(), "public", "indicaties", file);
  try {
    const buf = await fs.readFile(full);
    // Probeer server-side render met mammoth (optioneel dependency)
    try {
      // dynamic import zodat build niet faalt als mammoth ontbreekt
      const mammoth = await import("mammoth").catch(() => null as any);
      if (mammoth && mammoth.convertToHtml) {
        const res = await mammoth.convertToHtml({ buffer: buf });
        return NextResponse.json({ ok: true, html: res.value });
      }
    } catch {}
    // Fallback: geen mammoth -> client moet downloaden
    return NextResponse.json({ ok: false, reason: "mammoth-missing" });
  } catch {
    return NextResponse.json(
      { error: "bestand niet gevonden" },
      { status: 404 },
    );
  }
}
