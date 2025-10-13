import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "app-data.json");

type AnyObj = Record<string, any>;

export function readDB<T = AnyObj>(): T {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify({ planning: { items: [] }, groepen: [] }, null, 2),
    );
  }
  const raw = fs.readFileSync(DB_PATH, "utf8");
  return JSON.parse(raw);
}

export function writeDB(data: AnyObj) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function uid(prefix = "ev_") {
  return (
    prefix +
    Math.random().toString(36).slice(2, 7) +
    Date.now().toString(36).slice(-4)
  );
}
