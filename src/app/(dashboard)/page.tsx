"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Activity, ArrowRight, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface Group {
  id: string;
  name: string;
  color: string;
  youthCount: number;
  status: string;
  _count: {
    mutations: number;
    indications: number;
    youths: number;
  };
}

interface Report {
  id: string;
  date: string;
  content: string;
  group?: {
    name: string;
    color: string;
  };
}

interface CalendarEvent {
  id: string;
  type: string;
  date?: string;
  title: string;
}

const COLOR_MAP: Record<string, { bg: string; label: string }> = {
  GREEN: { bg: "#22c55e", label: "Groen" },
  YELLOW: { bg: "#eab308", label: "Geel" },
  ORANGE: { bg: "#f97316", label: "Oranje" },
  RED: { bg: "#ef4444", label: "Rood" },
};

export default function DashboardPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      const [groupsRes, calendarRes, reportsRes] = await Promise.all([
        fetch("/api/groups"),
        fetch(`/api/calendar?day=${today}`),
        fetch(`/api/reports`),
      ]);

      const groupsData = await groupsRes.json();
      const calendarData = await calendarRes.json();
      const reportsData = await reportsRes.json();

      setGroups(groupsData);

      // Combine all calendar events for today
      const allEvents = [
        ...(calendarData.reports || []),
        ...(calendarData.sessions || []),
        ...(calendarData.extraSport || []),
      ];
      setTodayEvents(allEvents);

      // Get latest report (most recent first)
      if (Array.isArray(reportsData) && reportsData.length > 0) {
        // Sort by date descending and take first
        const sorted = reportsData.sort((a: Report, b: Report) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setLatestReport(sorted[0]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalYouth = groups.reduce((sum, g) => sum + (g._count?.youths || 0), 0);
  const activeGroups = groups.filter(g => g.status !== "INACTIVE").length;
  const totalMutations = groups.reduce((sum, g) => sum + (g._count?.mutations || 0), 0);
  const totalIndications = groups.reduce((sum, g) => sum + (g._count?.indications || 0), 0);

  // Count groups by color
  const groupsByColor = {
    GREEN: groups.filter(g => g.color === "GREEN").length,
    YELLOW: groups.filter(g => g.color === "YELLOW").length,
    ORANGE: groups.filter(g => g.color === "ORANGE").length,
    RED: groups.filter(g => g.color === "RED").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Live data - automatisch bijgewerkt</p>
        </div>
        <Link
          href="/input"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Nieuwe Rapportage
        </Link>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Totaal Jongeren</h3>
            <Users className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalYouth}</p>
          <p className="text-xs text-gray-400 mt-1">Over alle groepen</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Actieve Groepen</h3>
            <Activity className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeGroups}</p>
          <p className="text-xs text-gray-400 mt-1">Van {groups.length} totaal</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Medische Status</h3>
            <Activity className="text-red-500" size={20} />
          </div>
          <div className="flex space-x-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalMutations}</p>
              <p className="text-xs text-gray-400">Mutaties</p>
            </div>
            <div className="border-l pl-4">
              <p className="text-2xl font-bold text-gray-900">{totalIndications}</p>
              <p className="text-xs text-gray-400">Indicaties</p>
            </div>
          </div>
        </div>

        <Link
          href="/kalender"
          className="bg-gradient-to-br from-purple-500 to-blue-600 p-6 rounded-xl shadow-sm text-white hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Planning</h3>
            <Calendar size={20} />
          </div>
          <p className="text-3xl font-bold">Kalender</p>
          <p className="text-xs opacity-90 mt-1 group-hover:underline">Bekijk planning →</p>
        </Link>
      </div>

      {/* Groups by Color */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Groepen per Kleur</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          {Object.entries(groupsByColor).map(([color, count]) => (
            <div
              key={color}
              className="p-4 rounded-lg border-2 transition-all hover:shadow-md"
              style={{ borderColor: COLOR_MAP[color].bg }}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLOR_MAP[color].bg }}
                />
                <span className="text-2xl font-bold text-gray-900">{count}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">{COLOR_MAP[color].label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Planning & Latest Report */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Planning */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Vandaag Gepland</h2>
            <Link href="/kalender" className="text-sm text-blue-600 hover:underline">
              Bekijk kalender
            </Link>
          </div>
          <div className="p-6">
            {todayEvents.length === 0 ? (
              <p className="text-gray-400 text-sm italic">Geen planning voor vandaag</p>
            ) : (
              <div className="space-y-3">
                {todayEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <Calendar size={16} className="text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      {event.date && (
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(event.date), "HH:mm", { locale: nl })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {todayEvents.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{todayEvents.length - 5} meer items
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Latest Report */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Laatste Overdracht</h2>
            <Link href="/rapportage" className="text-sm text-blue-600 hover:underline">
              Alle rapportages
            </Link>
          </div>
          <div className="p-6">
            {!latestReport ? (
              <p className="text-gray-400 text-sm italic">Geen recente overdrachten</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FileText size={16} className="text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {latestReport.group?.name || "Algemeen"}
                      </p>
                      <span className="text-xs text-gray-500">
                        {format(new Date(latestReport.date), "d MMM", { locale: nl })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {latestReport.content}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Group Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Live Groepsoverzicht</h2>
          <Link href="/groepen" className="text-sm text-blue-600 hover:underline">
            Bekijk alle groepen
          </Link>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Laden...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groepen/${group.id}`}
                className="block p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLOR_MAP[group.color]?.bg || "#6b7280" }}
                    />
                    <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {group.name}
                    </span>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {group._count?.youths || 0} jongeren
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <div className="flex space-x-2">
                    {group._count?.mutations > 0 && (
                      <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded flex items-center">
                        <Activity size={10} className="mr-1" /> {group._count.mutations}
                      </span>
                    )}
                    {group._count?.indications > 0 && (
                      <span className="text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded flex items-center">
                        <Activity size={10} className="mr-1" /> {group._count.indications}
                      </span>
                    )}
                  </div>
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
