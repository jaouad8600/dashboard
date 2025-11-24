'use client';

import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Search,
    Filter,
    Plus,
    Calendar,
    User,
    ShieldAlert,
    Activity,
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Group {
    id: string;
    name: string;
    color: string;
}

interface Incident {
    id: string;
    date: string;
    group: Group;
    youth?: { firstName: string; lastName: string };
    description: string;
    alarmPressed: boolean;
    afterCare: string | null;
    authorId: string;
}

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [newIncident, setNewIncident] = useState({
        groupId: '',
        youthId: '', // Optional, maybe text for now if we don't have youth list handy
        description: '',
        alarmPressed: false,
        afterCare: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [incidentsRes, groupsRes] = await Promise.all([
                fetch('/api/incidents'),
                fetch('/api/groups')
            ]);
            const incidentsData = await incidentsRes.json();
            const groupsData = await groupsRes.json();

            if (Array.isArray(incidentsData)) {
                setIncidents(incidentsData);
            } else {
                console.error("API returned non-array for incidents:", incidentsData);
                setIncidents([]);
            }

            if (Array.isArray(groupsData)) {
                setGroups(groupsData);
            } else {
                console.error("API returned non-array for groups:", groupsData);
                setGroups([]);
            }
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/incidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newIncident),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setNewIncident({
                    groupId: '',
                    youthId: '',
                    description: '',
                    alarmPressed: false,
                    afterCare: '',
                    date: new Date().toISOString().split('T')[0]
                });
                fetchData();
            }
        } catch (error) {
            console.error("Error creating incident", error);
        }
    };

    const filteredIncidents = incidents.filter(i =>
        (i.group?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <AlertTriangle className="text-orange-500" size={32} />
                        Incidenten
                    </h1>
                    <p className="text-gray-500 text-lg mt-1 ml-11">Registratie en opvolging van incidenten</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 font-bold"
                >
                    <Plus size={20} />
                    Meld Incident
                </button>
            </div>

            {/* Stats / Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Totaal Incidenten</p>
                        <p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Alarm Gedrukt</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {incidents.filter(i => i.alarmPressed).length}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
                    <Search className="text-gray-400 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Zoeken..."
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Incidents List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                    </div>
                ) : filteredIncidents.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
                        <AlertTriangle size={48} className="mx-auto mb-3 opacity-20" />
                        <p>Geen incidenten gevonden</p>
                    </div>
                ) : (
                    filteredIncidents.map((incident) => (
                        <motion.div
                            key={incident.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all
                                ${incident.alarmPressed ? 'border-red-100' : 'border-gray-100'}
                            `}
                        >
                            <div className="p-6 flex flex-col md:flex-row gap-8">
                                {/* Meta Info */}
                                <div className="flex-shrink-0 w-full md:w-56 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                                            style={{ backgroundColor: incident.group?.color || '#f97316' }}
                                        >
                                            {incident.group?.name?.substring(0, 2) || 'GR'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">{incident.group?.name || 'Onbekend'}</p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {new Date(incident.date).toLocaleDateString('nl-NL')}
                                            </p>
                                        </div>
                                    </div>

                                    {incident.alarmPressed && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-red-100 text-red-700">
                                            <ShieldAlert size={16} />
                                            ALARM
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Beschrijving</h3>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {incident.description}
                                        </p>
                                    </div>

                                    {incident.afterCare && (
                                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <h4 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-2">
                                                <Activity size={16} />
                                                Nazorg & Opvolging
                                            </h4>
                                            <p className="text-blue-800 text-sm leading-relaxed">
                                                {incident.afterCare}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                                <AlertTriangle className="text-orange-500" />
                                Incident Melden
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Datum</label>
                                        <input
                                            type="date"
                                            required
                                            value={newIncident.date}
                                            onChange={e => setNewIncident({ ...newIncident, date: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Groep</label>
                                        <select
                                            required
                                            value={newIncident.groupId}
                                            onChange={e => setNewIncident({ ...newIncident, groupId: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 transition-all"
                                        >
                                            <option value="">Selecteer Groep</option>
                                            {groups.map(g => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Beschrijving Incident</label>
                                    <textarea
                                        required
                                        value={newIncident.description}
                                        onChange={e => setNewIncident({ ...newIncident, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 h-32 resize-none transition-all"
                                        placeholder="Wat is er gebeurd?"
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100 cursor-pointer" onClick={() => setNewIncident({ ...newIncident, alarmPressed: !newIncident.alarmPressed })}>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${newIncident.alarmPressed ? 'bg-red-500 border-red-500' : 'border-red-300 bg-white'}`}>
                                        {newIncident.alarmPressed && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <span className="font-bold text-red-900">Persoonlijk Alarm Gebruikt?</span>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nazorg & Opvolging</label>
                                    <textarea
                                        value={newIncident.afterCare}
                                        onChange={e => setNewIncident({ ...newIncident, afterCare: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 h-24 resize-none transition-all"
                                        placeholder="Welke nazorg is verleend? Welke afspraken zijn gemaakt?"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Annuleren
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
                                    >
                                        Incident Melden
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
