export function formatTodayNL(tz: string = "Europe/Amsterdam") {
  const fmt = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    timeZone: tz,
  });
  return fmt.format(new Date());
}
