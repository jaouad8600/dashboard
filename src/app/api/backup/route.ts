import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');

export async function GET(req: NextRequest) {
  let data: any = {};
  try {
    const txt = fs.readFileSync(DB_PATH, 'utf8');
    data = JSON.parse(txt);
  } catch { data = {}; }

  const url = new URL(req.url);
  const download = url.searchParams.get('download');
  const body = JSON.stringify(data, null, 2);

  if (download) {
    const filename = `backup-${new Date().toISOString().slice(0,10)}.json`;
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.json({ ok: true, data }, { status: 200 });
}
