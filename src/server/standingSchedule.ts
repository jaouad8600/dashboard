export type CalendarEvent = {
  id: string;
  title: string;
  group?: string;
  groupId?: string;
  start: string;
  end: string;
  source: "recurring";
};

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmtISO(y: number, m: number, d: number, hh: number, mm: number, offset: string) {
  return `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00${offset}`;
}
function addMinutes(hh: number, mm: number, plus: number) {
  const t = hh * 60 + mm + plus;
  const tot = ((t % 1440) + 1440) % 1440;
  return { hh: Math.floor(tot / 60), mm: tot % 60 };
}
function pickOffsetFrom(iso?: string) {
  const m = iso?.match(/([+-]\d{2}:\d{2})$/);
  return m ? m[1] : "+02:00";
}

export function generateStandingEvents(rangeStartISO: string, rangeEndISO: string) {
  const offset = pickOffsetFrom(rangeStartISO);
  const start = new Date(rangeStartISO);
  const end = new Date(rangeEndISO);
  const oneDay = 24 * 60 * 60 * 1000;

  const events: CalendarEvent[] = [];
  for (let ts = start.getTime(); ts < end.getTime(); ts += oneDay) {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const dow = d.getDay(); // 0 zo ... 6 za

    const push = (title: string, hh: number, mm: number, durMin = 60) => {
      const sISO = fmtISO(y, m, day, hh, mm, offset);
      const tEnd = addMinutes(hh, mm, durMin);
      const eISO = fmtISO(y, m, day, tEnd.hh, tEnd.mm, offset);
      const id = `rec::${y}-${pad(m)}-${pad(day)}::${title.replace(/\s+/g, "-").toLowerCase()}::${pad(hh)}${pad(mm)}`;
      events.push({ id, title, group: title, start: sISO, end: eISO, source: "recurring" });
    };

    // ma–do 16:00 — ma/wo = A, di/do = B
    if (dow >= 1 && dow <= 4) {
      const title = (dow === 1 || dow === 3) ? "Poel A" : "Poel B";
      push(title, 16, 0, 60);
    }
    // za 14:15 Poel A
    if (dow === 6) push("Poel A", 14, 15, 60);
    // zo 14:15 Poel B
    if (dow === 0) push("Poel B", 14, 15, 60);
  }
  return events;
}

export function mergeWithRecurring(dbItems: any[], recurring: CalendarEvent[]) {
  const seen = new Set(dbItems.map((it) => `${it.start}|${it.title}`));
  const extra = recurring.filter((r) => !seen.has(`${r.start}|${r.title}`));
  return [...dbItems, ...extra];
}
