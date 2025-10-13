'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { startOfWeek, addDays, format } from 'date-fns';
import { nl } from 'date-fns/locale';

type Group = { id: string; naam?: string; name?: string; title?: string };

export default function SportmomentenPage() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const days = useMemo(() => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const [groups, setGroups] = useState<Group[]>([]);
  const [items, setItems] = useState<{ groupId: string; date: string }[]>([]);
  const keySet = useMemo(() => new Set(items.map(i => `${i.groupId}|${i.date}`)), [items]);

  async function load() {
    const p1 = fetch('/api/groepen', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ groups: [] }));
    const params = new URLSearchParams({
      start: format(weekStart, 'yyyy-MM-dd'),
      end: format(addDays(weekStart, 6), 'yyyy-MM-dd'), // hele week
    });
    const p2 = fetch(`/api/sportmomenten?${params}`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ items: [] }));
    const [g, sm] = await Promise.all([p1, p2]);
    setGroups(Array.isArray(g?.groups) ? g.groups : []);
    setItems(Array.isArray(sm?.items) ? sm.items : []);
  }

  useEffect(() => { load(); }, [weekStart]);

  async function toggle(groupId: string, d: Date) {
    const dateStr = format(d, 'yyyy-MM-dd');
    await fetch('/api/sportmomenten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, date: dateStr }),
    });
    await load();
  }

  function label(d: Date) {
    // "ma 14-10"
    return format(d, 'EEE dd-MM', { locale: nl });
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Sportmomenten</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(addDays(weekStart, -7))}
                  className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300">Vorige week</button>
          <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                  className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:opacity-90">Deze week</button>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))}
                  className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300">Volgende week</button>
        </div>
      </div>

      <div className="overflow-auto border rounded-2xl">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 border-b w-48">Groep</th>
              {days.map(d => (
                <th key={d.toISOString()} className="text-center p-3 border-b">{label(d)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const naam = g.naam || g.name || g.title || g.id;
              return (
                <tr key={g.id} className="odd:bg-white even:bg-gray-50">
                  <td className="p-3 border-b font-medium">{naam}</td>
                  {days.map(d => {
                    const dateStr = format(d, 'yyyy-MM-dd');
                    const on = keySet.has(`${g.id}|${dateStr}`);
                    return (
                      <td key={g.id + dateStr} className="p-2 border-b text-center">
                        <button
                          onClick={() => toggle(g.id, d)}
                          className={`px-3 py-2 rounded-xl ${on ? 'bg-green-600 text-white' : 'bg-gray-900 text-white'} hover:opacity-90`}
                          title={on ? 'Sportmoment aanwezig (klik om uit te zetten)' : 'Nog geen sportmoment (klik om te turven)'}
                        >
                          {on ? '✓' : 'Turf'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
