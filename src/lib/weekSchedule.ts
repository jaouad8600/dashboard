export type WeekDay =
  | "Maandag" | "Dinsdag" | "Woensdag" | "Donderdag" | "Vrijdag"
  | "Zaterdag" | "Zondag";

export const WEEK_DAYS = ["Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag"] as const;
export const WEEKEND_DAYS = ["Zaterdag","Zondag"] as const;

/**
 * Doordeweeks kolomkoppen (starttijden). Pauze is 17:00–17:30.
 * Cells kunnen leeg zijn; default invulling komt uit BASE_SCHEDULE/getBaseCell.
 */
export const WEEK_TIMES = ["16:00","17:00","17:30","18:15","19:00","19:45","20:30"] as const;

/** Weekend starttijden; we tonen label als "start–eindtijd" (45 min) in de UI */
export const WEEKEND_TIMES = ["10:30","11:30","12:30","13:30","14:30","15:30","16:30"] as const;

export type CellColor = "green" | "orange" | "yellow" | "red" | "pause";

type BaseCell = {
  day: WeekDay;
  time: string;           // moet overeenkomen met WEEK_TIMES / WEEKEND_TIMES
  group?: string;         // bijv. "Poel A", "PAUZE", ...
  note?: string;          // vrije notitie (bijv. "16:00–16:45")
  color?: CellColor;      // default UI-kleur voor dit vak
};

/**
 * BASISROOSTER:
 * - Doordeweeks: 16:00–16:45 om en om Poel A/B (Poel A start op maandag)
 * - Pauze: 17:00–17:30 (amber)
 */
const DW_DAGEN: WeekDay[] = ["Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag"];
const POEL_AB = (i: number) => (i % 2 === 0 ? "Poel A" : "Poel B");

const DOORDEWEEKS_CELLS: BaseCell[] = DW_DAGEN.flatMap((d, i) => ([
  {
    day: d,
    time: "16:00",
    group: POEL_AB(i),
    note: "16:00–16:45",
    color: "green",
  },
  {
    day: d,
    time: "17:00",
    group: "PAUZE",
    note: "17:00–17:30",
    color: "pause",
  },
]));

/** Weekend: geen vaste invulling, alleen kolommen; invulbaar via UI */
const WEEKEND_CELLS: BaseCell[] = [];

export const BASE_SCHEDULE: BaseCell[] = [
  ...DOORDEWEEKS_CELLS,
  ...WEEKEND_CELLS,
];

/** Vind de basis-invulling voor (dag, tijd). UI voegt hier custom overrides bovenop. */
export function getBaseCell(day: WeekDay, time: string): BaseCell | undefined {
  return BASE_SCHEDULE.find((c) => c.day === day && c.time === time);
}
