"use client";

import { useState, useEffect } from "react";
import { Plus, Filter, Calendar, User, Activity, CheckCircle, X, Edit2, Archive, Pause, Play, FileText, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface Indication {
    id: string;
    youth: { firstName: string; lastName: string };
    group: { name: string; color: string };
    description: string;
    type: string;
    validFrom: string;
    validUntil?: string;
    isActive: boolean;
    isPaused?: boolean;
    pausedAt?: string;
    pauseReason?: string;
    evaluations?: Evaluation[];
}

interface Evaluation {
    id: string;
    date: string;
    notes: string;
    createdBy: string;
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
    const [activeTab, setActiveTab] = useState<"manual" | "paste">("manual");
    const [pasteText, setPasteText] = useState("");
    const [isParsing, setIsParsing] = useState(false);

    // Edit/Action Modals
    const [editingIndication, setEditingIndication] = useState<Indication | null>(null);
    const [showEvaluationModal, setShowEvaluationModal] = useState<Indication | null>(null);
    const [showPauseModal, setShowPauseModal] = useState<Indication | null>(null);
    const [evaluationNotes, setEvaluationNotes] = useState("");
    const [pauseReason, setPauseReason] = useState("");
    const [showArchived, setShowArchived] = useState(false);

    // Form State - Basic
    const [selectedGroup, setSelectedGroup] = useState("");
    const [youthName, setYouthName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<string>(INDICATION_TYPES[0]);
    const [validFrom, setValidFrom] = useState(new Date().toISOString().split("T")[0]);
    const [validUntil, setValidUntil] = useState("");

    // Form State - Medical Service Fields
    const [leefgroep, setLeefgroep] = useState("");
    const [responsiblePersons, setResponsiblePersons] = useState("");
    const [issuedBy, setIssuedBy] = useState("Medische Dienst");
    const [feedbackTo, setFeedbackTo] = useState("");
    const [canCombine, setCanCombine] = useState(true);
    const [guidanceTips, setGuidanceTips] = useState("");
    const [learningGoals, setLearningGoals] = useState("");

    useEffect(() => {
        fetchData();
    }, []);



    const fetchData = async () => {
        try {
            const [indRes, groupRes] = await Promise.all([
                fetch("/api/medical/indications"),
                fetch("/api/groups")
            ]);
            const indData = await indRes.json();
            const grpData = await groupRes.json();
            // Ensure we always set an array for indications
            setIndications(Array.isArray(indData) ? indData : []);
            setGroups(Array.isArray(grpData) ? grpData : []);
        } catch (error) {
            console.error("Error fetching data", error);
            setIndications([]);
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const body: any = {
                youthName,
                groupId: selectedGroup,
                description,
                type,
                validFrom,
                // Only include validUntil if a value is provided
                ...(validUntil && { validUntil }),
                // New medical service fields
                leefgroep: leefgroep || undefined,
                responsiblePersons: responsiblePersons || undefined,
                issuedBy: issuedBy || undefined,
                feedbackTo: feedbackTo || undefined,
                canCombineWithGroup: canCombine,
                guidanceTips: guidanceTips || undefined,
                learningGoals: learningGoals || undefined,
            };
            const res = await fetch("/api/medical/indications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setShowModal(false);
                resetForm();
                fetchData();
            } else {
                const err = await res.json().catch(() => ({ error: "Unknown error" }));
                alert(`❌ Fout bij opslaan: ${err.error ?? "Onbekend"}\n${err.details ?? ""}`);
            }
        } catch (error) {
            console.error("Error saving indication", error);
            alert("❌ Er is een onverwachte fout opgetreden bij het opslaan.");
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

    const handleArchiveIndication = async (id: string) => {
        if (!confirm("Weet je zeker dat je deze indicatie wilt archiveren?")) return;

        try {
            const res = await fetch("/api/medical/indications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    archived: true,
                }),
            });

            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Error archiving indication", error);
        }
    };

    const handlePauseIndication = async () => {
        if (!showPauseModal || !pauseReason.trim()) {
            alert("Vul een reden in voor het pauzeren");
            return;
        }

        try {
            const res = await fetch("/api/medical/indications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: showPauseModal.id,
                    isPaused: true,
                    pausedAt: new Date().toISOString(),
                    pauseReason: pauseReason,
                }),
            });

            if (res.ok) {
                setShowPauseModal(null);
                setPauseReason("");
                fetchData();
            }
        } catch (error) {
            console.error("Error pausing indication", error);
        }
    };

    const handleResumeIndication = async (id: string) => {
        if (!confirm("Weet je zeker dat je deze indicatie wilt hervatten?")) return;

        try {
            const res = await fetch("/api/medical/indications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    isPaused: false,
                    pausedAt: null,
                    pauseReason: null,
                }),
            });

            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Error resuming indication", error);
        }
    };

    const handleEditIndication = async () => {
        if (!editingIndication) return;

        try {
            const res = await fetch("/api/medical/indications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingIndication.id,
                    description,
                    type,
                    validUntil: validUntil || undefined,
                }),
            });

            if (res.ok) {
                setEditingIndication(null);
                resetForm();
                fetchData();
            }
        } catch (error) {
            console.error("Error updating indication", error);
        }
    };

    const handleAddEvaluation = async () => {
        if (!showEvaluationModal || !evaluationNotes.trim()) {
            alert("Vul evaluatie notities in");
            return;
        }

        try {
            const res = await fetch("/api/medical/indications/evaluations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    indicationId: showEvaluationModal.id,
                    notes: evaluationNotes,
                    createdBy: "Current User", // TODO: Get from auth context
                }),
            });

            if (res.ok) {
                setShowEvaluationModal(null);
                setEvaluationNotes("");
                fetchData();
                alert("✅ Evaluatie toegevoegd!");
            }
        } catch (error) {
            console.error("Error adding evaluation", error);
        }
    };

    const startEditIndication = (indication: Indication) => {
        setEditingIndication(indication);
        setDescription(indication.description);
        setType(indication.type);
        setValidUntil(indication.validUntil || "");
        setShowModal(true);
        setActiveTab("manual");
    };

    const resetForm = () => {
        setSelectedGroup("");
        setYouthName("");
        setDescription("");
        setType(INDICATION_TYPES[0]);
        setValidUntil("");
        setPasteText("");
        setActiveTab("manual");
    };

    const handleParse = async () => {
        if (!pasteText.trim()) {
            alert("Plak eerst tekst in het veld");
            return;
        }

        setIsParsing(true);
        try {
            const res = await fetch("/api/medical/indications/parse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: pasteText }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
                throw new Error(errorData.details || errorData.error || "Parse failed");
            }

            const parsed = await res.json();

            // Show warning if AI not available
            if (parsed.warning) {
                alert(`⚠️ ${parsed.warning}`);
            }

            // Find group by name if provided
            if (parsed.groupName) {
                const group = groups.find(g => g.name.toLowerCase() === parsed.groupName.toLowerCase());
                if (group) {
                    setSelectedGroup(group.id);
                }
            }

            setYouthName(parsed.youthName || "");
            setDescription(parsed.description || "");
            setType(parsed.type || "OVERIG");
            setValidFrom(parsed.validFrom || new Date().toISOString().split("T")[0]);
            if (parsed.validUntil) {
                setValidUntil(parsed.validUntil);
            }

            // Switch to manual tab to show filled form
            setActiveTab("manual");

            const message = parsed.warning
                ? "✅ Gegevens geanalyseerd met basis-parser.\n\n⚠️ Controleer alle velden zorgvuldig voordat je opslaat!"
                : "✅ Gegevens succesvol geanalyseerd!\n\nControleer de velden en pas indien nodig aan.";

            alert(message);
        } catch (error) {
            console.error("Parse error:", error);
            const errorMessage = error instanceof Error ? error.message : "Onbekende fout";

            alert(`❌ Fout bij analyseren van tekst:\n\n${errorMessage}\n\n💡 Tip: Gebruik het 'Handmatig' tabblad om de gegevens zelf in te vullen.`);
        } finally {
            setIsParsing(false);
        }
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
                                        <div className="flex items-center gap-2">
                                            {m.isPaused && (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium flex items-center gap-1">
                                                    <Pause size={12} />
                                                    Gepauzeerd
                                                </span>
                                            )}
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => startEditIndication(m)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Bewerken"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setShowEvaluationModal(m)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Evaluatie Toevoegen"
                                                >
                                                    <MessageSquare size={16} />
                                                </button>
                                                {m.isPaused ? (
                                                    <button
                                                        onClick={() => handleResumeIndication(m.id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Hervatten"
                                                    >
                                                        <Play size={16} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowPauseModal(m)}
                                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="Pauzeren"
                                                    >
                                                        <Pause size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleArchiveIndication(m.id)}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Archiveren"
                                                >
                                                    <Archive size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEndIndication(m.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Beëindigen"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
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

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 bg-gray-50 px-6">
                            <button
                                type="button"
                                onClick={() => setActiveTab("manual")}
                                className={`px-4 py-3 font-medium text-sm transition-colors relative ${activeTab === "manual"
                                    ? "text-purple-600 border-b-2 border-purple-600"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Handmatig
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("paste")}
                                className={`px-4 py-3 font-medium text-sm transition-colors relative ${activeTab === "paste"
                                    ? "text-purple-600 border-b-2 border-purple-600"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Plak Tekst
                            </button>
                        </div>

                        {/* Paste Tab Content */}
                        {activeTab === "paste" && (
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Plak hier de volledige tekst van het indicatie document
                                    </label>
                                    <textarea
                                        value={pasteText}
                                        onChange={(e) => setPasteText(e.target.value)}
                                        className="w-full p-4 border border-gray-200 rounded-lg h-64 focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm font-mono"
                                        placeholder="Plak de tekst van het Word document hier..."
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
                                        type="button"
                                        onClick={handleParse}
                                        disabled={isParsing || !pasteText.trim()}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {isParsing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                                Analyseren...
                                            </>
                                        ) : (
                                            "Analyseer"
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Manual Tab Content */}
                        {activeTab === "manual" && (
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
                                            <option value="PHYSICAL">Fysiek</option>
                                            <option value="BEHAVIORAL">Gedrag</option>
                                            <option value="SENSORY">Sensorisch</option>
                                            <option value="MEDICAL">Medisch</option>
                                            <option value="OTHER">Overig</option>
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
                        )}
                    </div>
                </div>
            )}

            {/* Evaluation Modal */}
            <AnimatePresence>
                {showEvaluationModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEvaluationModal(null)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 m-auto w-full max-w-lg h-fit bg-white rounded-2xl shadow-2xl z-50 p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <MessageSquare className="text-green-600" />
                                    Evaluatie Toevoegen
                                </h3>
                                <button
                                    onClick={() => setShowEvaluationModal(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>Jongere:</strong> {showEvaluationModal.youth.firstName} {showEvaluationModal.youth.lastName}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Type:</strong> {showEvaluationModal.type}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Evaluatie Notities <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={evaluationNotes}
                                        onChange={(e) => setEvaluationNotes(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none h-32 resize-none"
                                        placeholder="Beschrijf de voortgang, observaties, en aanbevelingen..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowEvaluationModal(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Annuleren
                                </button>
                                <button
                                    onClick={handleAddEvaluation}
                                    disabled={!evaluationNotes.trim()}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    Opslaan
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Pause Modal */}
            <AnimatePresence>
                {showPauseModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPauseModal(null)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 m-auto w-full max-w-lg h-fit bg-white rounded-2xl shadow-2xl z-50 p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Pause className="text-orange-600" />
                                    Indicatie Pauzeren
                                </h3>
                                <button
                                    onClick={() => setShowPauseModal(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>Jongere:</strong> {showPauseModal.youth.firstName} {showPauseModal.youth.lastName}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Type:</strong> {showPauseModal.type}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reden voor Pauzeren <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={pauseReason}
                                        onChange={(e) => setPauseReason(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-24 resize-none"
                                        placeholder="Bijv. Blessure, medische redenen, etc..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowPauseModal(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Annuleren
                                </button>
                                <button
                                    onClick={handlePauseIndication}
                                    disabled={!pauseReason.trim()}
                                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Pause size={18} />
                                    Pauzeren
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
