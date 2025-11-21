"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check, Dumbbell } from "lucide-react";
import ExtraSportStats from "@/components/domain/ExtraSportStats";

interface Group {
  id: string;
  name: string;
  color: string;
}

interface ExtraSportMoment {
  id: string;
  date: string;
  groupId: string;
}

export default function ExtraSportPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [moments, setMoments] = useState<ExtraSportMoment[]>([]);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [loading, setLoading] = useState(true);

  // Stats Modal State
  const [selectedGroup, setSelectedGroup] = useState<{ id: string, name: string } | null>(null);

  function getMonday(d: Date) {
    d = new Date(d);
    const day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchMoments();
  }, [weekStart]);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setGroups(data);
      } else {
        console.error("Groups API returned non-array:", data);
        setGroups([]);
      }
    } catch (error) {
      console.error("Failed to fetch groups", error);
      setGroups([]);
    }
  };

  const fetchMoments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/extra-sport?weekStart=${weekStart.toISOString()}`);
      const data = await res.json();
      setMoments(data);
    } catch (error) {
      console.error("Failed to fetch moments", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMoment = async (groupId: string, date: Date) => {
    // Optimistic update
    const dateStr = date.toISOString();
    const isChecked = moments.some(m => m.groupId === groupId && new Date(m.date).toDateString() === date.toDateString());

    if (isChecked) {
      setMoments(prev => prev.filter(m => !(m.groupId === groupId && new Date(m.date).toDateString() === date.toDateString())));
    } else {
      setMoments(prev => [...prev, { id: "temp", groupId, date: dateStr }]);
    }

    try {
      await fetch("/api/extra-sport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, date: dateStr }),
      });
      // Re-fetch to ensure sync (optional, but good for IDs)
      fetchMoments();
    } catch (error) {
      console.error("Failed to toggle", error);
      // Revert on error
      fetchMoments();
    }
  };

  const changeWeek = (offset: number) => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + (offset * 7));
    setWeekStart(newStart);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Dumbbell className="mr-3 text-blue-600" />
          Extra Sportmomenten
        </h1>

        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <span className="font-medium text-gray-700 min-w-[150px] text-center">
            Week {getWeekNumber(weekStart)} - {weekStart.getFullYear()}
          </span>
          <button onClick={() => changeWeek(1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-left text-sm font-semibold text-gray-600 w-48 sticky left-0 bg-gray-50 z-10">Groep</th>
                {weekDays.map((day) => (
                  <th key={day.toISOString()} className="p-4 text-center text-sm font-semibold text-gray-600 min-w-[80px]">
                    <div className="flex flex-col items-center">
                      <span className="text-xs uppercase text-gray-400">{day.toLocaleDateString('nl-NL', { weekday: 'short' })}</span>
                      <span className={`mt-1 w-8 h-8 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-blue-600 text-white' : 'text-gray-900'}`}>
                        {day.getDate()}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 sticky left-0 bg-white z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <button
                      onClick={() => setSelectedGroup({ id: group.id, name: group.name })}
                      className="font-medium text-gray-900 hover:text-blue-600 hover:underline text-left w-full flex items-center"
                    >
                      <div className={`w-3 h-3 rounded-full mr-2 bg-${group.color}-500`} style={{ backgroundColor: group.color }}></div>
                      {group.name}
                    </button>
                  </td>
                  {weekDays.map((day) => {
                    const isChecked = moments.some(m => m.groupId === group.id && new Date(m.date).toDateString() === day.toDateString());
                    return (
                      <td key={day.toISOString()} className="p-2 text-center">
                        <button
                          onClick={() => toggleMoment(group.id, day)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${isChecked
                            ? "bg-green-500 text-white shadow-sm scale-100"
                            : "bg-gray-100 text-gray-300 hover:bg-gray-200 scale-90 hover:scale-100"
                            }`}
                        >
                          {isChecked && <Check size={20} strokeWidth={3} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="p-4 text-center text-gray-500 text-sm bg-gray-50 border-t">
            Gegevens bijwerken...
          </div>
        )}
      </div>

      <ExtraSportStats
        isOpen={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        groupId={selectedGroup?.id || ""}
        groupName={selectedGroup?.name || ""}
      />
    </div>
  );
}

function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

function isToday(someDate: Date) {
  const today = new Date();
  return someDate.getDate() == today.getDate() &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear();
}
