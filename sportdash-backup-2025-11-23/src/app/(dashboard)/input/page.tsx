"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, AlertTriangle, CheckCircle, Edit3 } from "lucide-react";
import { ParsedReport } from "@/services/parserService";
import { useAuth } from "@/components/providers/AuthContext";

interface Group {
    id: string;
    name: string;
}

export default function InputPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [text, setText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Review State
    const [parsedResult, setParsedResult] = useState<ParsedReport | null>(null);
    const [reviewMode, setReviewMode] = useState(false);

    useEffect(() => {
        fetch("/api/groups")
            .then((res) => res.json())
            .then((data) => setGroups(data));
    }, []);

    const handleAnalyze = async () => {
        if (!selectedGroup || !text) return;

        setIsAnalyzing(true);
        try {
            const groupName = groups.find(g => g.id === selectedGroup)?.name || "Unknown";
            const res = await fetch("/api/parse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, groupName }),
            });

            if (!res.ok) throw new Error("Analysis failed");

            const data: ParsedReport = await res.json();
            setParsedResult(data);
            setReviewMode(true);
        } catch (error) {
            console.error("Analysis error:", error);
            alert("Kon de tekst niet analyseren. Probeer het opnieuw.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!parsedResult || !selectedGroup) return;
        if (!user || !user.id) { // Added check for user and user.id
            alert("Gebruiker niet ingelogd of ID ontbreekt.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user.id, // Added x-user-id header
                },
                body: JSON.stringify({
                    groupId: selectedGroup,
                    content: parsedResult.sessionSummary, // Use summary as main content
                    date: new Date().toISOString(),
                    type: "SESSION",
                    parsedData: parsedResult, // Store full JSON
                    youthCount: parsedResult.presentYouth,
                    // New fields
                    rawText: parsedResult.rawText,
                    parsedAt: parsedResult.parsedAt,
                    parsedBy: parsedResult.parsedBy,
                    confidenceScore: parsedResult.confidenceScore,
                }),
            });

            if (res.ok) {
                router.push("/rapportage");
            } else {
                alert("Opslaan mislukt.");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Er ging iets mis bij het opslaan.");
        } finally {
            setIsSaving(false);
        }
    };

    if (reviewMode && parsedResult) {
        return (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Edit3 className="mr-2 text-blue-600" />
                    Controleer Analyse
                </h1>

                {parsedResult.confidenceScore < 0.7 && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start text-amber-800">
                        <AlertTriangle className="mr-2 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                            <p className="font-medium">Lage betrouwbaarheid ({Math.round(parsedResult.confidenceScore * 100)}%)</p>
                            <p className="text-sm mt-1">De AI is niet zeker van de analyse. Controleer de gegevens goed.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Aantal Jongeren</label>
                        <input
                            type="number"
                            value={parsedResult.presentYouth}
                            onChange={(e) => setParsedResult({ ...parsedResult, presentYouth: parseInt(e.target.value) || 0 })}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sfeer</label>
                        <input
                            type="text"
                            value={parsedResult.mood}
                            onChange={(e) => setParsedResult({ ...parsedResult, mood: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Samenvatting</label>
                    <textarea
                        value={parsedResult.sessionSummary}
                        onChange={(e) => setParsedResult({ ...parsedResult, sessionSummary: e.target.value })}
                        className="w-full p-3 border rounded-lg h-32"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Incidenten ({parsedResult.incidents.length})</label>
                    {parsedResult.incidents.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">Geen incidenten gedetecteerd.</p>
                    ) : (
                        <ul className="space-y-2">
                            {parsedResult.incidents.map((inc, idx) => (
                                <li key={idx} className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800">
                                    {inc.description}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                        onClick={() => setReviewMode(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200"
                    >
                        Terug naar invoer
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
                        Bevestigen & Opslaan
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Snel Invoeren</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selecteer Groep
                    </label>
                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Kies een groep...</option>
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plak Rapportage Tekst
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Plak hier de tekst van de overdracht..."
                        className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        De AI zal automatisch aantallen, sfeer en incidenten herkennen.
                    </p>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleAnalyze}
                        disabled={!selectedGroup || !text || isAnalyzing}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium transition-colors"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={20} />
                                Analyseren...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2" size={20} />
                                Analyseer Tekst
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
