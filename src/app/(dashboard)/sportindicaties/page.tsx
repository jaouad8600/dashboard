"use client";

import { useState, useEffect } from "react";
import { Plus, Filter, Calendar, User, Activity, CheckCircle, X } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface Indication {
    id: string;
    youth: { firstName: string; lastName: string };
    group: { name: string; color: string };
    description: string;
    type: string;
    validFrom: string;
    validUntil?: string;
    isActive: boolean;
}

interface Group {
    id: string;
    name: string;
}

interface Youth {
    id: string;
    firstName: string;
    lastName: string;
    groupId: string;
}

const INDICATION_TYPES = ["CARDIO", "KRACHT", "REVALIDATIE", "OVERIG"];

export default function SportIndicationsPage() {
    const [indications, setIndications] = useState<Indication[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [selectedGroup, setSelectedGroup] = useState("");
    const [youthName, setYouthName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("CARDIO");
    const [validFrom, setValidFrom] = useState(new Date().toISOString().split("T")[0]);
    const [validUntil, setValidUntil] = useState("");

    useEffect(() => {
        fetchData();
    }, []);



    const fetchData = async () => {
        try {
            const [indRes, groupRes] = await Promise.all([
                fetch("/api/medical/indications"),
                fetch("/api/groups")
            ]);
            setIndications(await indRes.json());
            setGroups(await groupRes.json());
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/medical/indications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    youthName,
                    groupId: selectedGroup,
                    description,
                    type,
                    validFrom,
                    validUntil: validUntil || undefined,
                }),
            });

            if (res.ok) {
                setShowModal(false);
                resetForm();
                fetchData();
            } else {
                alert("Fout bij opslaan");
            }
        } catch (error) {
            console.error("Error saving indication", error);
        }
    };

    const handleEndIndication = async (id: string) => {
        if (!confirm("Weet je zeker dat je deze indicatie wilt beëindigen?")) return;

        try {
            const res = await fetch("/api/medical/indications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    isActive: false,
                    validUntil: new Date().toISOString(),
                }),
            });

            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Error ending indication", error);
        }
    };

    const resetForm = () => {
        setSelectedGroup("");
        setYouthName("");
        setDescription("");
        setType("CARDIO");
        setValidUntil("");
    };

    if (loading) return <div className="p-8">Laden...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Sportindicaties</h1>
                    <p className="text-gray-500 mt-1">Beheer extra sportmomenten op indicatie</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center shadow-sm transition-all"
                >
                    <Plus size={20} className="mr-2" />
                    Nieuwe Indicatie
                </button>
            </div>

            {/* Filters (Placeholder) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
                <div className="flex items-center text-gray-500">
                    <Filter size={18} className="mr-2" />
                    <span className="text-sm font-medium">Filters:</span>
                </div>
                <select className="bg-gray-50 border-none text-sm rounded-md px-3 py-1 focus:ring-0">
                    <option>Alle Groepen</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <select className="bg-gray-50 border-none text-sm rounded-md px-3 py-1 focus:ring-0">
                    <option>Alle Types</option>
                    {INDICATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Jongere</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Groep</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Omschrijving</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Geldigheid</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actie</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {indications.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">
                                    Geen actieve indicaties gevonden.
                                </td>
                            </tr>
                        ) : (
                            indications.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                                                <User size={14} />
                                            </div>
                                            <span className="font-medium text-gray-900">{m.youth.firstName} {m.youth.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {m.group.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">{m.type}</span>
                                            <span className="text-xs text-gray-500">{m.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar size={14} className="mr-2 text-gray-400" />
                                            {format(new Date(m.validFrom), "d MMM", { locale: nl })}
                                            {" - "}
                                            {m.validUntil ? format(new Date(m.validUntil), "d MMM", { locale: nl }) : "..."}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleEndIndication(m.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
                                        >
                                            Beëindigen
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <Activity className="mr-2 text-purple-500" />
                                Nieuwe Sportindicatie
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Groep</label>
                                    <select
                                        required
                                        value={selectedGroup}
                                        onChange={(e) => setSelectedGroup(e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        <option value="">Selecteer Groep</option>
                                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Naam Jongere</label>
                                    <input
                                        type="text"
                                        required
                                        value={youthName}
                                        onChange={(e) => setYouthName(e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="bijv. Jan Jansen"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        {INDICATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Geldig Vanaf</label>
                                    <input
                                        type="date"
                                        required
                                        value={validFrom}
                                        onChange={(e) => setValidFrom(e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Omschrijving</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-lg h-24 focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Bijv. 2x per week cardio..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Annuleren
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                                >
                                    <CheckCircle size={18} className="mr-2" />
                                    Opslaan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
