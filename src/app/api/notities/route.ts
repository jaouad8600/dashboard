import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

const DB_PATH = path.join(process.cwd(), 'data', 'app-data.json');
async function readDB(){ try{ return JSON.parse(await fs.readFile(DB_PATH,'utf8')); }catch{ return {}; } }
async function writeDB(db:any){ await fs.mkdir(path.dirname(DB_PATH),{recursive:true}); await fs.writeFile(DB_PATH, JSON.stringify(db,null,2)); }
const uid = ()=>'n_'+Math.random().toString(36).slice(2)+Date.now().toString(36);

export async function GET(req:NextRequest){
  const db=await readDB();
  db.notities = db.notities || { items: [] };
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId') || searchParams.get('groepId');
  let items = Array.isArray(db.notities.items)? db.notities.items : [];
  if(groupId) items = items.filter((n:any)=> String(n.groupId)===String(groupId));
  // sort nieuwste boven
  items = items.sort((a:any,b:any)=> String(b.createdAt??'').localeCompare(String(a.createdAt??'')));
  return NextResponse.json(items, { headers:{'cache-control':'no-store'} });
}

export async function POST(req:NextRequest){
  const body = await req.json().catch(()=>({}));
  const groupId = body?.groupId || body?.groepId;
  const tekst   = (body?.tekst ?? body?.text ?? '').trim();
  if(!groupId || !tekst) return NextResponse.json({error:'groupId en tekst verplicht'}, {status:400, headers:{'cache-control':'no-store'}});
  const db=await readDB();
  db.notities = db.notities || { items: [] };
  if(!Array.isArray(db.notities.items)) db.notities.items=[];
  const now = new Date().toISOString();
  const note = { id: uid(), groupId: String(groupId), tekst, createdAt: now, updatedAt: now, archived: false };
  db.notities.items.unshift(note);
  await writeDB(db);
  return NextResponse.json(note, { status:201, headers:{'cache-control':'no-store'} });
}
