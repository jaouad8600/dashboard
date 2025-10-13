"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  ssr: false,
});

type ApiItem = {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
};

export default function KalenderPage() {
  const calendarRef = useRef<any>(null);

  const refetch = useCallback(() => {
    const api = calendarRef.current?.getApi?.();
    api?.refetchEvents();
  }, []);

  async function fetchEvents(
    info: { startStr: string; endStr: string },
    successCallback: any,
    failureCallback: any,
  ) {
    try {
      const res = await fetch(
        `/api/planning?start=${encodeURIComponent(info.startStr)}&end=${encodeURIComponent(info.endStr)}`,
      );
      const data = await res.json();
      const events = (data.items as ApiItem[]).map((e) => ({
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        color: e.color,
      }));
      successCallback(events);
    } catch (e) {
      failureCallback(e);
    }
  }

  const handleSelect = async (selInfo: any) => {
    const title = window.prompt("Titel voor sportmoment:", "Sportmoment");
    if (!title) return;
    await fetch("/api/planning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        start: selInfo.startStr,
        end: selInfo.endStr,
      }),
    });
    refetch();
  };

  const handleEventClick = async (clickInfo: any) => {
    const ev = clickInfo.event;
    const choice = window.prompt(
      `Bewerk titel of typ "DELETE" om te verwijderen:\nHuidig: ${ev.title}`,
      ev.title,
    );
    if (choice === null) return;
    if (choice.trim().toUpperCase() === "DELETE") {
      if (!confirm("Zeker weten verwijderen?")) return;
      await fetch("/api/planning", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ev.id }),
      });
      refetch();
      return;
    }
    if (choice.trim() !== ev.title) {
      await fetch("/api/planning", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ev.id, title: choice.trim() }),
      });
      refetch();
    }
  };

  const handleChangeTime = async (changeInfo: any) => {
    const ev = changeInfo.event;
    await fetch("/api/planning", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: ev.id,
        start: ev.start.toISOString(),
        end: ev.end?.toISOString(),
      }),
    });
    refetch();
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kalender</h1>
        <button
          className="btn"
          onClick={() => refetch()}
          className="px-3 py-2 rounded-lg border hover:bg-gray-50"
        >
          Herladen
        </button>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        selectable
        selectMirror
        editable
        droppable={false}
        eventDurationEditable
        eventStartEditable
        events={fetchEvents}
        select={handleSelect}
        eventClick={handleEventClick}
        eventDrop={handleChangeTime}
        eventResize={handleChangeTime}
        height="auto"
        slotDuration="00:30:00"
      />
    </div>
  );
}
