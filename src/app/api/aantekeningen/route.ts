import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs'; import path from 'path';
const DB = path.join(process.cwd(),'data','app-data.json');
function load(){ try{ return JSON.parse(fs.readFileSync(DB,'utf8')); }catch{ return {}; } }
function save(j:any){ fs.writeFileSync(DB, JSON.stringify(j,null,2)); }
export async function GET(req: NextRequest){
  const { searchParams } = new URL(req.url);
  const groepId = (searchParams.get('groupId') || searchParams.get('groepId') || '').toString();
  const j = load(); const items = (j.aantekeningen?.items||[]).filter((x:any)=>!groepId || x.groepId===groepId);
  return NextResponse.json({ ok:true, items }, { status:200 });
}
export async function POST(req: NextRequest){
  const b = await req.json().catch(()=>({}));
  const text=(b.text||b.opmerking||'').toString().trim();
  const groepId=(b.groepId||b.groupId||'').toString();
  if(!groepId || !text) return NextResponse.json({ok:false,error:'groepId en text vereist'},{status:400});
  const j = load(); j.aantekeningen = j.aantekeningen || {items:[]};
  const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`, groepId, text, createdAt: new Date().toISOString() };
  j.aantekeningen.items.push(item); save(j);
  return NextResponse.json({ ok:true, item }, { status:201 });
}
