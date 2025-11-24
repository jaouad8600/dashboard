"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Plus, Trash2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { anonymizeText } from "@/lib/privacy";

interface Reservation {
    id: string;
    resourceId: string;
    userName: string;
    startTime: string;
    endTime: string;
    title: string;
}

const RESOURCES = [
    { id: "SPORTZAAL", label: "Sportzaal" },
    { id: "FITNESS", label: "Fitnessruimte" },
    { id: "SPORTVELD", label: "Sportveld" }
];

export default function ReservationsPage() {
    const [activeResource, setActiveResource] = useState(RESOURCES[0].id);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        userName: "",
        startTime: "09:00",
        endTime: "10:00",
        title: ""
    });

    useEffect(() => {
        fetchReservations();
    }, [selectedDate]);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reservations?date=${selectedDate}`);
            const data = await res.json();
            setReservations(data);
        } catch (error) {
            console.error("Error fetching reservations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch("/api/reservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resourceId: activeResource,
                    date: selectedDate,
                    ...formData
                }),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchReservations();
                setFormData({ userName: "", startTime: "09:00", endTime: "10:00", title: "" });
            } else {
                const err = await res.json();
                alert(err.error || "Reserveren mislukt");
            }
        } catch (error) {
            console.error("Error creating reservation", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Reservering verwijderen?")) return;
        try {
            await fetch(`/api/reservations?id=${id}`, { method: "DELETE" });
            fetchReservations();
        } catch (error) {
            console.error("Error deleting reservation", error);
        }
    };

    const filteredReservations = reservations.filter(r => r.resourceId === activeResource);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 font-serif">Reserveringen</h1>
                    <p className="text-gray-500 mt-2">Beheer ruimtegebruik</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teylingereind-royal outline-none"
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-teylingereind-royal text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium shadow-lg"
                    >
                        <Plus size={20} />
                        Reserveren
                    </button>
                </div>
            </div>

            {/* Resource Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {RESOURCES.map(res => (
                    <button
                        key={res.id}
                        onClick={() => setActiveResource(res.id)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeResource === res.id
                            ? "bg-teylingereind-royal text-white shadow-md"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                            }`}
                    >
                        {res.label}
                    </button>
                ))}
            </div>

            {/* Timeline / List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <Calendar size={20} className="text-teylingereind-royal" />
                        Overzicht voor {new Date(selectedDate).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h2>
                </div>

                <div className="p-6 space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Laden...</div>
                    ) : filteredReservations.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Clock size={48} className="mx-auto mb-3 opacity-20" />
                            <p>Geen reserveringen voor deze ruimte</p>
                        </div>
                    ) : (
                        filteredReservations.map(res => {
                            const start = new Date(res.startTime);
                            const end = new Date(res.endTime);
                            return (
                                <div key={res.id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex flex-col items-center justify-center w-20 p-2 bg-teylingereind-royal/10 text-teylingereind-royal rounded-lg">
                                        <span className="text-sm font-bold">
                                            {start.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="text-xs opacity-70">tot</span>
                                        <span className="text-sm font-bold">
                                            {end.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{anonymizeText(res.title || "Geen titel")}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <User size={14} />
                                            {res.userName}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(res.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <h2 className="text-xl font-bold mb-6">Nieuwe Reservering</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Naam Medewerker</label>
                                    <input
                                        className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.userName}
                                        onChange={e => setFormData({ ...formData, userName: e.target.value })}
                                        placeholder="Wie reserveert?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Activiteit / Titel</label>
                                    <input
                                        className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Bijv. Zaalvoetbal Groep 1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Starttijd</label>
                                        <input
                                            type="time"
                                            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.startTime}
                                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Eindtijd</label>
                                        <input
                                            type="time"
                                            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.endTime}
                                            onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuleren</button>
                                    <button onClick={handleCreate} className="px-4 py-2 bg-teylingereind-royal text-white rounded-lg hover:bg-blue-700 shadow-md">Bevestigen</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
