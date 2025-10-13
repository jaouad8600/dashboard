'use client';

import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import nlLocale from '@fullcalendar/core/locales/nl';

type Ev = { id?: string; title: string; start: string; end?: string; allDay?: boolean };

async function fetchEvents(startStr: string, endStr: string): Promise<Ev[]> {
  try {
    const res = await fetch(`/api/planning?start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(endStr)}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    return items
      .filter((it: any) => it?.start)
      .map((it: any) => ({ id: it.id, title: it.title || it.naam || 'Sportmoment', start: it.start, end: it.end }));
  } catch { return []; }
}

async function createEvent(e: Ev) {
  await fetch('/api/planning', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(e) });
}

async function updateEvent(e: Ev) {
  if (!e.id) return;
  await fetch(`/api/planning/${e.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(e) });
}

export default function KalenderPage() {
  const [events, setEvents] = useState<Ev[]>([]);
  const calRef = useRef<FullCalendar | null>(null);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kalender</h1>
        <button
          className="px-3 py-2 rounded-lg bg-gray-900 text-white"
          onClick={async () => {
            const api = (calRef.current as any)?.getApi?.();
            if (!api) return;
            const range = api.view?.currentStart && api.view?.currentEnd
              ? { start: api.view.currentStart.toISOString(), end: api.view.currentEnd.toISOString() }
              : null;
            if (!range) return;
            setEvents(await fetchEvents(range.start, range.end));
          }}
        >
          Herladen
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <FullCalendar
          ref={calRef as any}
          plugins={[timeGridPlugin, interactionPlugin]}
          locales={[nlLocale]}
          locale="nl"
          initialView="timeGridWeek"
          firstDay={1}
          height="auto"
          slotMinTime="09:00:00"
          slotMaxTime="21:30:00"
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          headerToolbar={{
            left: 'prev today next',
            center: 'title',
            right: 'timeGridWeek,timeGridDay',
          }}
          allDaySlot={false}
          selectable
          editable
          events={events}
          datesSet={async (arg) => {
            const list = await fetchEvents(arg.startStr, arg.endStr);
            setEvents(list);
          }}
          select={async (sel) => {
            const title = window.prompt('Titel van sportmoment:', 'Sportmoment');
            if (!title) return;
            const ev: Ev = { title, start: sel.startStr, end: sel.endStr };
            await createEvent(ev);
            const api = (calRef.current as any)?.getApi?.();
            api?.unselect();
            setEvents(await fetchEvents(sel.startStr, sel.endStr));
          }}
          eventDrop={async (info) => {
            await updateEvent({ id: info.event.id, title: info.event.title, start: info.event.start!.toISOString(), end: info.event.end?.toISOString() });
          }}
          eventResize={async (info) => {
            await updateEvent({ id: info.event.id, title: info.event.title, start: info.event.start!.toISOString(), end: info.event.end?.toISOString() });
          }}
        />
      </div>
    </div>
  );
}
