'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import nlLocale from '@fullcalendar/core/locales/nl';

export default function KalenderPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kalender</h1>
        <button
          onClick={() => location.reload()}
          className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:opacity-90"
        >
          Herladen
        </button>
      </div>

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locales={[nlLocale]}
        locale="nl"
        firstDay={1}                 // maandag
        hiddenDays={[0, 6]}          // alleen ma-vr
        dayHeaderFormat={{ weekday: 'short', day: '2-digit', month: '2-digit' }}
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        slotMinTime="09:00:00"
        slotMaxTime="21:30:00"
        slotDuration="00:30:00"
        allDaySlot={false}
        nowIndicator={true}
        height="auto"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridWeek' }}
        titleFormat={{ year: 'numeric', month: 'long', day: '2-digit' }}
        events={async (info, success, failure) => {
          try {
            const start = info.startStr.slice(0, 10); // YYYY-MM-DD
            const res = await fetch(`/api/planning?date=${start}`, { cache: 'no-store' });
            const data = await res.json();
            const events = (data.items ?? []).map((it: any) => ({
              id: it.id,
              title: it.title || 'Sportmoment',
              start: it.start,
              end: it.end,
            }));
            success(events);
          } catch (e) {
            failure(e as any);
          }
        }}
      />
    </div>
  );
}
