"use client";

import { useState, useEffect } from "react";
import { Phone, Trophy, Calendar, TrendingUp, Award, CheckCircle, Info, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface GroupPriority {
    groupId: string;
    groupName: string;
    groupColor: string;
    regularMoments: number;
    extraMoments: number;
    missedMoments: number;
    totalScore: number;
    priority: number;
    explanation: string;
}

const colorMap: Record<string, string> = {
    ROOD: "#EF4444",
    BLAUW: "#3B82F6",
    GROEN: "#10B981",
    GEEL: "#F59E0B",
    ORANJE: "#F97316",
    PAARS: "#8B5CF6",
    ROZE: "#EC4899",
};

type Tab = "PRIORITY" | "TALLY";

export default function SportPriorityPage() {
    const [priorities, setPriorities] = useState<GroupPriority[]>([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("PRIORITY");
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [timeRange, setTimeRange] = useState<"ALL" | "WEEK" | "MONTH" | "YEAR">("ALL");

    const fetchPriorities = async () => {
        setLoading(true);
        try {
            let url = "/api/sport-priority";
            if (timeRange !== "ALL") {
                const now = new Date();
                let start = new Date();
                if (timeRange === "WEEK") start.setDate(now.getDate() - 7);
                if (timeRange === "MONTH") start.setMonth(now.getMonth() - 1);
                if (timeRange === "YEAR") start.setFullYear(now.getFullYear() - 1);
                url += `?startDate=${start.toISOString()}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            setPriorities(data);
        } catch (error) {
            console.error("Error fetching priorities:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPriorities();
    }, [timeRange]);

    const handleRegisterMoment = async (groupId: string) => {
        if (!confirm("Weet je zeker dat je een extra sportmoment wilt registreren voor deze groep?")) {
            return;
        }

        setRegistering(groupId);
        try {
            await fetch("/api/sport-priority", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupId }),
            });
            await fetchPriorities();
        } catch (error) {
            console.error("Error registering moment:", error);
            alert("Er is iets misgegaan bij het registreren.");
        } finally {
            setRegistering(null);
        }
    };

    const handleTallyExtra = async (groupId: string) => {
        setRegistering(groupId);
        try {
            await fetch("/api/sport-priority", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupId, date: selectedDate }),
            });
            await fetchPriorities();
        } catch (error) {
            console.error("Error tallying:", error);
        } finally {
            setRegistering(null);
        }
    };

    const getPriorityBadgeColor = (priority: number) => {
        if (priority === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
        if (priority === 2) return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900";
        if (priority === 3) return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
    };

    const getPriorityIcon = (priority: number) => {
        if (priority === 1) return <Trophy className="w-5 h-5" />;
        if (priority === 2) return <Award className="w-5 h-5" />;
        if (priority === 3) return <Award className="w-5 h-5" />;
        return <TrendingUp className="w-4 h-4" />;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-serif bg-gradient-to-r from-teylingereind-blue to-teylingereind-royal bg-clip-text text-transparent">
                        Extra Sportmomenten
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Beheer sportmomenten en bekijk de verdeling
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                        <button
                            onClick={() => setActiveTab("PRIORITY")}
                            className={`px-4 py-2 rounded-md transition-all ${activeTab === "PRIORITY"
                                ? "bg-white shadow-sm text-teylingereind-royal font-semibold"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <Phone className="w-4 h-4 inline mr-2" />
                            Belvolgorde
                        </button>
                        <button
                            onClick={() => setActiveTab("TALLY")}
                            className={`px-4 py-2 rounded-md transition-all ${activeTab === "TALLY"
                                ? "bg-white shadow-sm text-teylingereind-orange font-semibold"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <CheckCircle className="w-4 h-4 inline mr-2" />
                            Turven
                        </button>
                    </div>
                </div>
            </div>

            {/* Time Range Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <span className="font-medium text-gray-700">Periode:</span>
                {["ALL", "WEEK", "MONTH", "YEAR"].map((range) => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range as typeof timeRange)}
                        className={`px-4 py-2 rounded-lg transition-all ${timeRange === range
                            ? "bg-teylingereind-royal text-white font-semibold"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {range === "ALL" && "Alles"}
                        {range === "WEEK" && "Deze Week"}
                        {range === "MONTH" && "Deze Maand"}
                        {range === "YEAR" && "Dit Jaar"}
                    </button>
                ))}
            </div>

            {/* Priority Tab */}
            {activeTab === "PRIORITY" ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Totaal Groepen</h3>
                                <Trophy className="opacity-80" size={24} />
                            </div>
                            <p className="text-4xl font-bold">{priorities.length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Hoogste Prioriteit</h3>
                                <Award className="opacity-80" size={24} />
                            </div>
                            <p className="text-4xl font-bold">{priorities[0]?.groupName || "-"}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium opacity-90">Totaal Extra Momenten</h3>
                                <Calendar className="opacity-80" size={24} />
                            </div>
                            <p className="text-4xl font-bold">
                                {priorities.reduce((sum, g) => sum + g.extraMoments, 0)}
                            </p>
                        </div>
                    </div>

                    {/* Priority List */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-teylingereind-blue to-teylingereind-royal p-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Phone className="w-6 h-6" />
                                Belvolgorde voor Extra Sportmomenten
                            </h2>
                            <p className="text-blue-100 mt-1">Bel groepen in deze volgorde bij beschikbaarheid</p>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center">
                                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                                <p className="text-gray-500">Prioriteiten berekenen...</p>
                            </div>
                        ) : priorities.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>Geen groepen gevonden</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {priorities.map((group, index) => (
                                    <motion.div
                                        key={group.groupId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all group"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`${getPriorityBadgeColor(
                                                        group.priority
                                                    )} w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg`}
                                                >
                                                    {group.priority}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-4 h-4 rounded-full shadow-md"
                                                        style={{
                                                            backgroundColor: colorMap[group.groupColor] || "#10B981",
                                                        }}
                                                    />
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                            {group.groupName}
                                                            {group.priority <= 3 && getPriorityIcon(group.priority)}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">{group.explanation}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="hidden md:flex items-center gap-6 text-sm">
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-teylingereind-orange">
                                                            {group.extraMoments}
                                                        </p>
                                                        <p className="text-xs text-gray-500">Extra</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-gray-900">
                                                            {group.totalScore}
                                                        </p>
                                                        <p className="text-xs text-gray-500">Totaal</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleRegisterMoment(group.groupId)}
                                                    disabled={registering === group.groupId}
                                                    className="bg-teylingereind-orange text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                                                >
                                                    {registering === group.groupId ? (
                                                        <>
                                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                                            Bezig...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trophy className="w-5 h-5" />
                                                            Registreer
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                    {/* Date Selector */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <label className="font-medium text-gray-700">Datum:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teylingereind-royal outline-none"
                        />
                    </div>

                    {/* Tally List */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-teylingereind-orange to-orange-600 p-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <CheckCircle className="w-6 h-6" />
                                Turf Extra Sport
                            </h2>
                            <p className="text-orange-100 mt-1">Klik om extra sportmoment te registreren voor {selectedDate}</p>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {priorities.map((group) => (
                                <div key={group.groupId} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-4 h-4 rounded-full shadow-md"
                                            style={{ backgroundColor: colorMap[group.groupColor] || "#10B981" }}
                                        />
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{group.groupName}</h3>
                                            <p className="text-sm text-gray-500">
                                                Extra: {group.extraMoments} | Totaal: {group.totalScore}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleTallyExtra(group.groupId)}
                                        disabled={registering === group.groupId}
                                        className="bg-teylingereind-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-all disabled:opacity-50 font-semibold shadow-md flex items-center gap-2"
                                    >
                                        {registering === group.groupId ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Bezig...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Turf Extra
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
