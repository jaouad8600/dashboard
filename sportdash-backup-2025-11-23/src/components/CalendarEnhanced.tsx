"use client";
import "@/styles/vendor/fullcalendar-common.css";
import "@/styles/fullcalendar.css";

import { useMemo, useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import nlLocale from "@fullcalendar/core/locales/nl";
import { Plus, Filter, Calendar as CalendarIcon, X, FileText, Activity } from "lucide-react";
import { format, addDays, startOfYear, endOfYear, isSameDay } from "date-fns";
import { nl } from "date-fns/locale";
import { getAllSchedules } from "@/lib/schedules";

interface CalendarEvent {
    id: string;
    title: string;
    start: string | Date;
    end?: string | Date;
    type: "report" | "session" | "extraSport" | "mutation" | "indication";
    extendedProps: any;
    backgroundColor?: string;
    borderColor?: string;
}

export default function CalendarEnhanced() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<string>("ALL");
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const plugins = useMemo(
        () => [dayGridPlugin, timeGridPlugin, interactionPlugin],
        []
    );

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/calendar");
            const data = await res.json();

            // Flatten the response structure
            const allEvents: CalendarEvent[] = [
                ...(data.reports || []).map((e: any) => ({
                    ...e,
                    start: e.date,
                    backgroundColor: "#3b82f6", // Blue
                    borderColor: "#2563eb",
                })),
                ...(data.sessions || []).map((e: any) => ({
                    ...e,
                    start: e.date,
                    backgroundColor: "#10b981", // Green
                    borderColor: "#059669",
                })),
                ...(data.extraSport || []).map((e: any) => ({
                    ...e,
                    start: e.date,
                    backgroundColor: "#8b5cf6", // Purple
                    borderColor: "#7c3aed",
                })),
                ...(data.mutations || []).map((e: any) => ({
                    ...e,
                    start: e.startDate,
                    end: e.endDate,
                    backgroundColor: "#ef4444", // Red
                    borderColor: "#dc2626",
                })),
                ...(data.indications || []).map((e: any) => ({
                    ...e,
                    start: e.startDate,
                    end: e.endDate,
                    backgroundColor: "#f59e0b", // Amber
                    borderColor: "#d97706",
                })),
            ];

            // Generate static schedule events for the current year
            const schedules = getAllSchedules();
            const start = startOfYear(new Date());
            const end = endOfYear(new Date());
            let current = start;

            while (current <= end) {
                const dayName = current.toLocaleDateString("nl-NL", { weekday: "long" });
                const day = dayName.charAt(0).toUpperCase() + dayName.slice(1);

                const dailyEvents = schedules.filter(s => s.day === day);

                dailyEvents.forEach(s => {
                    // Parse start/end times (HH:MM)
                    const [startHour, startMinute] = s.startTime.split(':').map(Number);
                    const [endHour, endMinute] = s.endTime.split(':').map(Number);

                    const startDate = new Date(current);
                    startDate.setHours(startHour, startMinute);

                    const endDate = new Date(current);
                    endDate.setHours(endHour, endMinute);

                    allEvents.push({
                        id: `${s.id}-${format(current, 'yyyy-MM-dd')}`,
                        title: `${s.activity} (${s.location})`,
                        start: startDate,
                        end: endDate,
                        type: "session", // Treat as session
                        extendedProps: { location: s.location },
                        backgroundColor: s.location.includes("Vloed") ? "#1e40af" : "#15803d", // Dark blue for Vloed, Green for Eb
                        borderColor: s.location.includes("Vloed") ? "#1e3a8a" : "#14532d",
                    });
                });

                current = addDays(current, 1);
            }

            setEvents(allEvents);
            setFilteredEvents(allEvents);
        } catch (error) {
            console.error("Failed to fetch calendar events", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (activeFilter === "ALL") {
            setFilteredEvents(events);
        } else {
            setFilteredEvents(events.filter(e => e.type === activeFilter));
        }
    }, [activeFilter, events]);

    const handleDateClick = (arg: any) => {
        setSelectedDate(arg.date);
        setShowModal(true);
    };

    const eventContent = useCallback((arg: any) => {
        return (
            <div className="flex items-center px-1 py-0.5 overflow-hidden text-xs font-medium rounded-sm w-full">
                <div
                    className="w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0"
                    style={{ backgroundColor: arg.event.backgroundColor }}
                />
                <span className="truncate text-gray-700">{arg.event.title}</span>
            </div>
        );
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-[800px]">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <CalendarIcon className="mr-3 text-blue-600" />
                        Planning & Activiteiten
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Beheer alle activiteiten, rapportages en medische zaken.</p>
                </div>

                <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                    {[
                        { id: "ALL", label: "Alles" },
                        { id: "report", label: "Rapportages" },
                        { id: "session", label: "Sport" },
                        { id: "mutation", label: "Medisch" },
                    ].map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeFilter === filter.id
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Calendar */}
            <div className="flex-1 p-6 bg-white custom-calendar-wrapper">
                <FullCalendar
                    plugins={plugins}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    events={filteredEvents}
                    locales={[nlLocale]}
                    locale="nl"
                    height="100%"
                    eventContent={eventContent}
                    selectable={true}
                    dateClick={handleDateClick}
                    dayMaxEvents={3}
                    moreLinkContent={(args) => `+${args.num} meer`}
                    eventClassNames="custom-event"
                />
            </div>

            {/* Add Event Modal */}
            {showModal && selectedDate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">
                                Nieuwe toevoegen op {format(selectedDate, "d MMMM", { locale: nl })}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-sm text-gray-500 mb-4">Wat wil je toevoegen voor deze datum?</p>

                            <a
                                href={`/input?date=${format(selectedDate, "yyyy-MM-dd")}`}
                                className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Rapportage</h4>
                                    <p className="text-xs text-gray-500">Dagelijkse overdracht of incident</p>
                                </div>
                            </a>

                            <a
                                href={`/sportmutaties?date=${format(selectedDate, "yyyy-MM-dd")}`}
                                className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Sportmutatie</h4>
                                    <p className="text-xs text-gray-500">Ziekte, blessure of medisch</p>
                                </div>
                            </a>

                            <a
                                href={`/indicaties?date=${format(selectedDate, "yyyy-MM-dd")}`}
                                className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Sportindicatie</h4>
                                    <p className="text-xs text-gray-500">Specifieke begeleiding</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #f3f4f6;
        }
        .fc-col-header-cell {
          background-color: #f9fafb;
          padding: 12px 0;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #6b7280;
          font-weight: 600;
        }
        .fc-daygrid-day-number {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          padding: 8px;
        }
        .fc-day-today {
          background-color: #eff6ff !important;
        }
        .fc-button-primary {
          background-color: white !important;
          border-color: #e5e7eb !important;
          color: #374151 !important;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .fc-button-primary:hover {
          background-color: #f9fafb !important;
          border-color: #d1d5db !important;
        }
        .fc-button-active {
          background-color: #eff6ff !important;
          border-color: #3b82f6 !important;
          color: #2563eb !important;
        }
        .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 700;
          color: #111827;
        }
        .custom-event {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        .fc-daygrid-day-events {
          margin-top: 4px;
        }
      `}</style>
        </div>
    );
}
