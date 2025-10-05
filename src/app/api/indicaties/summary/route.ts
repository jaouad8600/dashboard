import { NextResponse } from "next/server";
import type { Indicatie } from "../route";

declare global {
  // eslint-disable-next-line no-var
  var __INDICATIES__: Indicatie[] | undefined;
}

const store: Indicatie[] = (globalThis as any).__INDICATIES__ ?? [];

export async function GET() {
  const open = store.filter(i => i.status === "Open").length;
  const inBehandeling = store.filter(i => i.status === "In behandeling").length;
  const afgerond = store.filter(i => i.status === "Afgerond").length;
  const totaal = store.length;
  return NextResponse.json({ open, inBehandeling, afgerond, totaal });
}
