import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data", "app-data.json");

export async function GET() {
  try {
    const raw = fs.readFileSync(dataPath, "utf-8");
    const json = JSON.parse(raw);

    // Zorg dat we ALTIJD een array teruggeven
    const groepen =
      Array.isArray(json?.groepen?.list) ? json.groepen.list : [];

    return NextResponse.json({ data: groepen });
  } catch (err) {
    console.error("❌ API-fout /api/groepen/rode:", err);
    return NextResponse.json(
      { error: "Kon data niet laden", details: String(err) },
      { status: 500 }
    );
  }
}
