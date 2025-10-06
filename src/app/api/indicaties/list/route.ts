import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "public", "indicaties");
  try {
    const files = await fs.readdir(dir);
    const docx = files.filter(f => f.toLowerCase().endsWith(".docx"));
    return NextResponse.json(docx.map(file => ({ file, title: file.replace(/\.docx$/i,"") })));
  } catch {
    return NextResponse.json([]);
  }
}
