const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const root = process.cwd();
const p = (...a) => path.join(root, ...a);

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function uid() {
  try {
    return randomUUID();
  } catch {
    return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
function monthsAgo(n, day = 10) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(day);
  d.setHours(12, 0, 0, 0);
  return d.getTime();
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d.getTime();
}

// ----- Companies -----
const companiesFile = p("data", "companies.json");
let companies = readJSON(companiesFile, []);

const demoCompanies = [
  {
    name: "Acme Logistics",
    city: "Leiden",
    industry: "Transport",
    createdAt: monthsAgo(5),
  },
  {
    name: "Bluewave Tech",
    city: "Den Haag",
    industry: "IT",
    createdAt: monthsAgo(4),
  },
  {
    name: "GreenLeaf Foods",
    city: "Rotterdam",
    industry: "Voeding",
    createdAt: monthsAgo(4, 20),
  },
  {
    name: "Sunrise Health",
    city: "Utrecht",
    industry: "Zorg",
    createdAt: monthsAgo(3),
  },
  {
    name: "Northwind Traders",
    city: "Amsterdam",
    industry: "Groothandel",
    createdAt: monthsAgo(2),
  },
  {
    name: "Pixel Studio",
    city: "Delft",
    industry: "Design",
    createdAt: monthsAgo(1),
  },
  {
    name: "Riviera Finance",
    city: "Haarlem",
    industry: "FinTech",
    createdAt: monthsAgo(0, 5),
  },
  {
    name: "Delta Security",
    city: "Zoetermeer",
    industry: "Beveiliging",
    createdAt: monthsAgo(0, 18),
  },
];

let addedC = 0;
for (const c of demoCompanies) {
  if (!companies.some((x) => x.name === c.name)) {
    companies.push({
      id: uid(),
      name: c.name,
      city: c.city,
      industry: c.industry,
      createdAt: c.createdAt,
      updatedAt: c.createdAt,
    });
    addedC++;
  }
}
writeJSON(companiesFile, companies);

// ----- Activities -----
const actsFile = p("data", "activities.json");
let acts = readJSON(actsFile, []);
const demoActs = [
  { message: "Admin ingelogd", when: daysAgo(10) },
  { message: "Nieuw bedrijf: Bluewave Tech", when: daysAgo(9) },
  { message: "Nieuw bedrijf: GreenLeaf Foods", when: daysAgo(8) },
  { message: "Mutatie aangemaakt door beheerder", when: daysAgo(6) },
  { message: "Kanban: taak verplaatst naar Doing", when: daysAgo(4) },
  { message: "Overdracht geplaatst voor avonddienst", when: daysAgo(2) },
  { message: "Nieuw bedrijf: Riviera Finance", when: daysAgo(1) },
];

let addedA = 0;
for (const a of demoActs) {
  if (!acts.some((x) => x.message === a.message)) {
    acts.push({ id: uid(), message: a.message, createdAt: a.when });
    addedA++;
  }
}
acts.sort((a, b) => b.createdAt - a.createdAt);
writeJSON(actsFile, acts);

// ----- Kanban -----
const kanbanFile = p("data", "kanban.json");
let kanban = readJSON(kanbanFile, { columns: [], tasks: [] });
if (!kanban.columns || !kanban.tasks) kanban = { columns: [], tasks: [] };
const cols = kanban.columns.length
  ? kanban.columns
  : [
      { id: "todo", title: "To Do", order: 0 },
      { id: "doing", title: "Doing", order: 1 },
      { id: "done", title: "Done", order: 2 },
    ];
kanban.columns = cols;

function nextOrder(columnId) {
  const orders = kanban.tasks
    .filter((t) => t.columnId === columnId)
    .map((t) => t.order);
  return (orders.length ? Math.max(...orders) : -1) + 1;
}

const demoTasks = [
  {
    title: "Inventarischeck materialen",
    description: "Sporthal Q1",
    col: "todo",
  },
  {
    title: "Sync Refine resources",
    description: "Companies hook koppelen",
    col: "doing",
  },
  {
    title: "Update dashboard tegels",
    description: "Rode groepen + mutaties",
    col: "doing",
  },
  {
    title: "SSE live testen",
    description: "EventSource in Kanban",
    col: "done",
  },
];

let addedT = 0;
for (const t of demoTasks) {
  if (!kanban.tasks.some((x) => x.title === t.title)) {
    kanban.tasks.push({
      id: uid(),
      title: t.title,
      description: t.description,
      columnId: t.col,
      order: nextOrder(t.col),
      createdAt: Date.now(),
    });
    addedT++;
  }
}
writeJSON(kanbanFile, kanban);

console.log(
  `✅ Seed klaar: +${addedC} companies, +${addedA} activities, +${addedT} kanban tasks`,
);
