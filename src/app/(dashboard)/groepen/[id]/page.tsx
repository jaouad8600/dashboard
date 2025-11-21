"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Users, Activity, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { ParsedReport } from "@/services/parserService";

interface Group {
    id: string;
    name: string;
    color: string;
    youthCount: number;
    notes: string;
}

interface Report {
    id: string;
    date: string;
    content: string;
    parsedData: string | null;
    confidenceScore?: number;
}

export default function GroupDetailPage() {
    const params = useParams();
    const groupId = params.id as string;

    const [group, setGroup] = useState<Group | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (groupId) {
            fetchData();
        }
    }, [groupId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [groupRes, reportsRes] = await Promise.all([
                fetch(`/api/groups?id=${groupId}`), // Assuming this endpoint can filter by ID or returns all
                fetch(`/api/reports?groupId=${groupId}`)
            ]);

            const groupsData = await groupRes.json();
            // If API returns array, find the group
            const foundGroup = Array.isArray(groupsData)
                ? groupsData.find((g: any) => g.id === groupId)
                : groupsData;

            setGroup(foundGroup);
            setReports(await reportsRes.json());
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Laden...</div>;
    if (!group) return <div className="p-8">Groep niet gevonden.</div>;

    // Calculate KPIs
    const totalReports = reports.length;
    const incidents = reports.filter(r => {
        const parsed = r.parsedData ? JSON.parse(r.parsedData) : null;
        return parsed?.incidents?.length > 0;
    }).length;

    const averageYouth = reports.length > 0
        ? Math.round(reports.reduce((sum, r) => {
            const parsed = r.parsedData ? JSON.parse(r.parsedData) : null;
            return sum + (parsed?.presentYouth || 0);
        }, 0) / reports.length)
        : 0;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                <div>
                    <div className="flex items-center space-x-4 mb-2">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: group.color }}
                        />
                        <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                    </div>
                    <p className="text-gray-500">Detailoverzicht en historie</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Huidige Bezetting</div>
                    <div className="text-2xl font-bold text-gray-900 flex items-center justify-end">
                        <Users className="mr-2 text-blue-500" size={24} />
                        {group.youthCount}
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Gem. Opkomst</h3>
                        <Activity className="text-green-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{averageYouth}</p>
                    <p className="text-xs text-gray-400 mt-1">Afgelopen periode</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Totaal Sessies</h3>
                        <Calendar className="text-blue-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{totalReports}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Incidenten</h3>
                        <AlertTriangle className="text-red-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{incidents}</p>
                </div>
            </div>

            {/* Recent Reports Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Recente Activiteit</h2>
                <div className="space-y-6">
                    {reports.slice(0, 10).map((report) => {
                        const parsed: ParsedReport | null = report.parsedData ? JSON.parse(report.parsedData) : null;
                        const hasIncidents = parsed?.incidents && parsed.incidents.length > 0;

                        return (
                            <div key={report.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className={`w-3 h-3 rounded-full ${hasIncidents ? 'bg-red-500' : 'bg-blue-500'}`} />
                                    <div className="w-0.5 h-full bg-gray-100 my-1" />
                                </div>
                                <div className="pb-6 flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-medium text-gray-900">
                                            {new Date(report.date).toLocaleDateString("nl-NL", { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </span>
                                        {hasIncidents && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">Incident</span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">
                                        {parsed?.sessionSummary || report.content.substring(0, 100) + "..."}
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            Sfeer: {parsed?.mood || "Onbekend"}
                                        </span>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            Aanwezig: {parsed?.presentYouth || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
