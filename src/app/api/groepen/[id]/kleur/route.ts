import { NextResponse } from "next/server";
import { patchGroupColor } from "@/server/store";
export async function PATCH(req:Request,{params}:{params:{id:string}}){
  const body = await req.json().catch(()=>({}));
  await patchGroupColor(params.id, body?.kleur);
  return NextResponse.json({ ok:true });
}
