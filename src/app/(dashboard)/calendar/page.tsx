"use client";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import nl from "date-fns/locale/nl";
import { loadEvents } from "@/lib/clientStore";
const locales = { nl };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek:(d)=>startOfWeek(d,{weekStartsOn:1}), getDay, locales });
export default function WeekCalendar(){
  const events = loadEvents();
  return (
    <div className="grid gap-3">
      <h1 className="text-xl font-bold">Weekkalender</h1>
      <div style={{height:700}} className="rounded-xl border overflow-hidden bg-white">
        <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end"
          defaultView={Views.WEEK} views={["week","day","agenda"]} culture="nl" />
      </div>
    </div>
  );
}
