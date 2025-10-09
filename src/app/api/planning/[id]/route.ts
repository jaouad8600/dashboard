import { NextResponse } from "next/server";
import { updatePlanning, removePlanning } from "@/server/store";

export async function PATCH(req:Request, { params }:{ params:{ id:string }}) {
  const body = await req.json().catch(()=> ({}));
  const it = await updatePlanning(params.id, body);
  return NextResponse.json(it, { headers:{ 'cache-control':'no-store' }});
}

export async function DELETE(_req:Request, { params }:{ params:{ id:string }}) {
  await removePlanning(params.id);
  return NextResponse.json({ ok:true }, { headers:{ 'cache-control':'no-store' }});
}
