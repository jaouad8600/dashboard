"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Filter, Calendar, User, AlertCircle, X, Trash2, Edit2, Archive, CheckCircle, FileText, Clipboard } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { useSportMutations, useGroups } from "@/hooks/useSportData";
import { SportMutation, Group, Youth } from "@prisma/client";
import { useToast } from "@/hooks/useToast";

// Extended type to include relations
type SportMutationWithRelations = SportMutation & {
    group: Group | null;
    youth: Youth | null;
};

const MUTATION_TYPES = [
    { value: "MEDISCH", label: "Medisch" },
    { value: "GEDRAG", label: "Gedrag" },
    { value: "BLESSURE", label: "Blessure" },
    { value: "OVERIG", label: "Overig" }
];

import { Suspense } from 'react';

function SportMutationsContent() {
    const searchParams = useSearchParams();
    const { data: mutationsData, isLoading: loadingMutations, createMutation, updateMutation, deleteMutation } = useSportMutations();
    const { data: groups, isLoading: loadingGroups } = useGroups();
    const toast = useToast();

    const [showArchived, setShowArchived] = useState(false);
    const [editingMutation, setEditingMutation] = useState<SportMutationWithRelations | null>(null);

    // Cast data to the correct type with relations
    const allMutations = mutationsData as unknown as SportMutationWithRelations[] || [];

    const mutations = allMutations.filter(m => showArchived ? !m.isActive : m.isActive !== false);

    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState<"manual" | "paste">("manual");
    const [pastedText, setPastedText] = useState("");

    // Form State
    const [selectedGroup, setSelectedGroup] = useState("");
    const [youthName, setYouthName] = useState("");
    const [reason, setReason] = useState(""); // Bijzonderheden
    const [reasonType, setReasonType] = useState("MEDISCH");
    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState("");

    // New boolean flags
    const [totaalSportverbod, setTotaalSportverbod] = useState(false);
    const [alleenFitness, setAlleenFitness] = useState(false);

    // Filters
    const [filterGroup, setFilterGroup] = useState("");
    const [filterType, setFilterType] = useState("");

    useEffect(() => {
        if (searchParams.get("new") === "true") {
            resetForm();
            setShowModal(true);
        }
    }, [searchParams]);

    const parseSportMutatieText = (text: string) => {
        const lines = text.split('\n');
        let parsedName = "";
        let parsedGroup = "";
        let parsedStartDate = "";
        let parsedEndDate = "";
        let parsedReason = "";
        let parsedTotaal = false;
        let parsedFitness = false;

        // Helper to find value after label
        const findValue = (label: string) => {
            const regex = new RegExp(`${label}[:\\s]+(.*)`, 'i');
            for (const line of lines) {
                const match = line.match(regex);
                if (match) return match[1].trim();
            }
            return "";
        };

        parsedName = findValue("Naam");
        const groupName = findValue("Afdeling");

        // Try to match group name to ID
        if (groupName && groups) {
            const group = groups.find(g => g.name.toLowerCase() === groupName.toLowerCase());
            if (group) parsedGroup = group.id;
        }

        const rawStartDate = findValue("Begindatum");
        if (rawStartDate) {
            // Try parsing DD-MM-YY or DD-MM-YYYY
            const parts = rawStartDate.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
            if (parts) {
                const day = parts[1].padStart(2, '0');
                const month = parts[2].padStart(2, '0');
                let year = parts[3];
                if (year.length === 2) year = "20" + year;
                parsedStartDate = `${year}-${month}-${day}`;
            }
        }

        const rawEndDate = findValue("Stopdatum");
        if (rawEndDate) {
            const parts = rawEndDate.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
            if (parts) {
                const day = parts[1].padStart(2, '0');
                const month = parts[2].padStart(2, '0');
                let year = parts[3];
                if (year.length === 2) year = "20" + year;
                parsedEndDate = `${year}-${month}-${day}`;
            }
        }

        parsedReason = findValue("Bijzonderheden");

        // Checkboxes
        // Look for lines containing the text and a checkmark
        const checkmarkRegex = /[☒xX\[\]\u2611]/; // Basic check for marked box characters

        for (const line of lines) {
            if (line.toLowerCase().includes("totaal sportverbod")) {
                // Check if line starts with or contains a checkmark indicator
                if (line.match(checkmarkRegex) || line.toLowerCase().includes("ja")) {
                    // Simple heuristic: if it has a box char that isn't empty square, or just assumes the line existing with context implies checked if format is strict
                    // The user example: "☒ Totaal sportverbod" vs "☐ Alleen fitness"
                    if (line.includes("☒") || line.includes("[x]") || line.includes("[X]")) {
                        parsedTotaal = true;
                    }
                }
            }
            if (line.toLowerCase().includes("alleen fitness")) {
                if (line.includes("☒") || line.includes("[x]") || line.includes("[X]")) {
                    parsedFitness = true;
                }
            }
        }

        // Apply parsed values
        if (parsedName) setYouthName(parsedName);
        if (parsedGroup) setSelectedGroup(parsedGroup);
        if (parsedStartDate) setStartDate(parsedStartDate);
        if (parsedEndDate) setEndDate(parsedEndDate);
        if (parsedReason) setReason(parsedReason);
        setTotaalSportverbod(parsedTotaal);
        setAlleenFitness(parsedFitness);

        toast.success("Tekst geanalyseerd! Controleer de gegevens.");
        setActiveTab("manual");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedGroup || !youthName || !startDate || !reason) {
            toast.warning("Vul alle verplichte velden in");
            return;
        }

        try {
            const mutationData = {
                groupId: selectedGroup,
                reason: `${reason} (Jongere: ${youthName})`, // Keeping legacy format for reason string for now, but could be cleaner
                reasonType: reasonType as any,
                // restriction string is legacy/fallback, we use booleans now
                restriction: totaalSportverbod ? "TOTAAL_SPORTVERBOD" : (alleenFitness ? "ALLEEN_FITNESS" : undefined),
                injuryDetails: "", // Not used in new form
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : undefined,
                totaalSportverbod,
                alleenFitness
            };

            if (editingMutation) {
                await updateMutation.mutateAsync({
                    id: editingMutation.id,
                    ...mutationData
                });
                toast.success("Mutatie succesvol bijgewerkt!");
            } else {
                await createMutation.mutateAsync(mutationData);
                toast.success("Mutatie succesvol toegevoegd!");
            }

            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error("Error saving mutation", error);
            toast.error("Fout bij opslaan van de mutatie");
        }
    };

    const handleArchive = async (id: string) => {
        if (!confirm("Weet je zeker dat je deze mutatie wilt archiveren?")) return;
        try {
            await updateMutation.mutateAsync({
                id,
                isActive: false,
            });
            toast.success("Mutatie gearchiveerd");
        } catch (error) {
            console.error("Error archiving mutation", error);
            toast.error("Fout bij archiveren");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Weet je zeker dat je deze mutatie definitief wilt verwijderen? Dit kan niet ongedaan worden gemaakt.")) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("Mutatie verwijderd");
        } catch (error) {
            console.error("Error deleting mutation", error);
            toast.error("Fout bij verwijderen");
        }
    };

    const startEditMutation = (mutation: SportMutationWithRelations) => {
        setEditingMutation(mutation);
        setSelectedGroup(mutation.groupId);

        // Extract name from reason if not linked
        const nameMatch = mutation.reason.match(/\(Jongere: (.*?)\)/);
        const cleanReason = mutation.reason.replace(/\(Jongere: .*?\)/, "").trim();

        setYouthName(mutation.youth ? `${mutation.youth.firstName} ${mutation.youth.lastName}` : (nameMatch ? nameMatch[1] : ""));
        setReason(cleanReason);
        setReasonType(mutation.reasonType);

        setStartDate(new Date(mutation.startDate).toISOString().split('T')[0]);
        setEndDate(mutation.endDate ? new Date(mutation.endDate).toISOString().split('T')[0] : "");

        // Set booleans
        // Fallback to legacy restriction string if booleans are false (migration support)
        const isTotaal = (mutation as any).totaalSportverbod || (mutation.restriction === "TOTAAL_SPORTVERBOD");
        const isFitness = (mutation as any).alleenFitness || (mutation.restriction === "ALLEEN_FITNESS");

        setTotaalSportverbod(isTotaal);
        setAlleenFitness(isFitness);

        setActiveTab("manual");
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingMutation(null);
        setSelectedGroup("");
        setYouthName("");
        setReason("");
        setReasonType("MEDISCH");
        setStartDate(new Date().toISOString().split("T")[0]);
        setEndDate("");
        setTotaalSportverbod(false);
        setAlleenFitness(false);
        setPastedText("");
        setActiveTab("manual");
    };

    const filteredMutations = mutations?.filter(m => {
        const groupName = m.group?.name || "";
        const matchesGroup = !filterGroup || groupName === filterGroup;
        const matchesType = !filterType || m.reasonType === filterType;
        return matchesGroup && matchesType;
    }) || [];

    if (loadingMutations || loadingGroups) return <div className="p-8">Laden...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Sportmutaties</h1>
                    <p className="text-gray-500 mt-1">Beheer zieken, geblesseerden en andere afwezigheden</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${showArchived ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        <Archive size={20} />
                        {showArchived ? "Toon Actief" : "Archief"}
                    </button>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 font-medium"
                    >
                        <Plus size={20} />
                        Nieuwe Mutatie
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
                <div className="flex items-center text-gray-500">
                    <Filter size={18} className="mr-2" />
                    <span className="text-sm font-medium">Filters:</span>
                </div>
                <select
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    className="bg-gray-50 border-none text-sm rounded-md px-3 py-1 focus:ring-0"
                >
                    <option value="">Alle Groepen</option>
                    {groups?.map(g => (
                        <option key={g.id} value={g.name}>
                            {g.name}
                        </option>
                    ))}
                </select>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-gray-50 border-none text-sm rounded-md px-3 py-1 focus:ring-0"
                >
                    <option value="">Alle Categorieën</option>
                    {MUTATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Jongere</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Groep</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Startdatum</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Stopdatum</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Beperking</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Bijzonderheden</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actie</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredMutations.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-400 italic">
                                    {showArchived ? "Geen gearchiveerde mutaties gevonden." : "Geen actieve mutaties gevonden."}
                                </td>
                            </tr>
                        ) : (
                            filteredMutations.map((m) => {
                                const isTotaal = (m as any).totaalSportverbod || (m.restriction === "TOTAAL_SPORTVERBOD");
                                const isFitness = (m as any).alleenFitness || (m.restriction === "ALLEEN_FITNESS");

                                return (
                                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3">
                                                    <User size={14} />
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {m.youth ? `${m.youth.firstName} ${m.youth.lastName}` : (m.reason.match(/\(Jongere: (.*?)\)/)?.[1] || "Onbekend")}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                                                {m.group?.name || "Onbekend"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {format(new Date(m.startDate), "d MMM yyyy", { locale: nl })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {m.endDate ? format(new Date(m.endDate), "d MMM yyyy", { locale: nl }) : "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {isTotaal && (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 w-fit">
                                                        Totaal Sportverbod
                                                    </span>
                                                )}
                                                {isFitness && (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 w-fit">
                                                        Alleen Fitness
                                                    </span>
                                                )}
                                                {!isTotaal && !isFitness && (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {m.reason.replace(/\(Jongere: .*?\)/, "").trim()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => startEditMutation(m)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Bewerken / Details"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {!showArchived && (
                                                    <button
                                                        onClick={() => handleArchive(m.id)}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Archiveren"
                                                    >
                                                        <Archive size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(m.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Verwijderen"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <AlertCircle className="mr-2 text-orange-500" />
                                {editingMutation ? "Mutatie Bewerken" : "Nieuwe Sportmutatie"}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        {!editingMutation && (
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab("manual")}
                                    className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === "manual"
                                        ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50/50"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    <Edit2 size={16} className="inline mr-2" />
                                    Handmatig
                                </button>
                                <button
                                    onClick={() => setActiveTab("paste")}
                                    className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === "paste"
                                        ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50/50"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    <Clipboard size={16} className="inline mr-2" />
                                    Plak Tekst
                                </button>
                            </div>
                        )}

                        <div className="p-6">
                            {activeTab === "paste" ? (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                                        <p className="font-medium mb-1">Instructie:</p>
                                        <p>Kopieer de tekst uit het Word-document (CTRL+A, CTRL+C) en plak het hieronder. Klik daarna op &quot;Analyseren&quot;.</p>
                                    </div>
                                    <textarea
                                        value={pastedText}
                                        onChange={(e) => setPastedText(e.target.value)}
                                        className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm"
                                        placeholder="Plak hier de tekst van het formulier..."
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => parseSportMutatieText(pastedText)}
                                            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center font-medium"
                                            disabled={!pastedText.trim()}
                                        >
                                            <FileText size={18} className="mr-2" />
                                            Analyseren & Invullen
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Naam <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={youthName}
                                                onChange={(e) => setYouthName(e.target.value)}
                                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                                placeholder="Naam jongere"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Afdeling <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                required
                                                value={selectedGroup}
                                                onChange={(e) => setSelectedGroup(e.target.value)}
                                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            >
                                                <option value="">Selecteer Afdeling</option>
                                                {groups?.map(g => (
                                                    <option key={g.id} value={g.id}>
                                                        {g.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Begindatum <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Stopdatum
                                            </label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bijzonderheden <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-lg h-24 focus:ring-2 focus:ring-orange-500 outline-none"
                                            placeholder="Bijv. Vermoeden lichte hersenschudding..."
                                        />
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={totaalSportverbod}
                                                onChange={(e) => setTotaalSportverbod(e.target.checked)}
                                                className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                            />
                                            <span className="text-sm text-gray-700 font-medium">
                                                Totaal sportverbod – geldt voor school en tijdens het luchten en de avondrecreatie.
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={alleenFitness}
                                                onChange={(e) => setAlleenFitness(e.target.checked)}
                                                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                            />
                                            <span className="text-sm text-gray-700 font-medium">
                                                Alleen fitness
                                            </span>
                                        </label>
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
                                            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
                                        >
                                            <CheckCircle size={18} className="mr-2" />
                                            {editingMutation ? "Bijwerken" : "Opslaan"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SportMutationsPage() {
    return (
        <Suspense fallback={<div className="p-8">Laden...</div>}>
            <SportMutationsContent />
        </Suspense>
    );
}
