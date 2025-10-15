import path from "path";
import fs from "fs/promises";

const DB_PATH = path.join(process.cwd(), "data", "app-data.json");
const headers = { "cache-control": "no-store" };

export async function readDB(): Promise<any>{
  try { return JSON.parse(await fs.readFile(DB_PATH,"utf8")); } catch { return {}; }
}
export async function writeDB(db:any){
  await fs.mkdir(path.dirname(DB_PATH), { recursive:true });
  await fs.writeFile(DB_PATH, JSON.stringify(db,null,2));
}

export { headers, DB_PATH };
