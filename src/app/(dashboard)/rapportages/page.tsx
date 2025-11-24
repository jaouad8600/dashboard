'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Edit2, Archive, FileText, Calendar, Users, User, Clock, TrendingUp, CheckCircle, X, Sparkles, Download, Share2, Copy, Printer, AlertTriangle, Plus, RefreshCw, ChevronUp, ChevronDown, FileJson, Mail, ShieldCheck, Brain, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { anonymizeText } from '@/lib/privacy';
import { analyzeReport, type AIAnalysisResult } from '@/services/aiService';
import Counter from '@/components/ui/Counter';
import ChipSelector from '@/components/ui/ChipSelector';
import TagInput from '@/components/ui/TagInput';
import { WARMING_UP_SUGGESTIONS, ACTIVITY_SUGGESTIONS, NOTE_TAGS, generateReportText } from '@/lib/reportConstants';

interface Report {
    id: string;
    groupId: string;
    group: { name: string; color: string };
    date: string;
    authorId: string;
    sessionSummary?: string;
    content: string;
    cleanedText?: string | null;
    youthCount?: number;
    leaderCount?: number;
    warmingUp?: string | null;
    activity?: string | null;
    parsedData: string | null;
    archived: boolean;
}

export default function ReportsArchivePage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<Report | null>(null);
    const [showArchived, setShowArchived] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [groups, setGroups] = useState<Array<{ id: string; name: string; color: string }>>([]);
    const [newReport, setNewReport] = useState({
        groupId: '',
        date: new Date().toISOString().split('T')[0],
        instructor: '',
        youthCount: 8,
        leaderCount: 2,
        warmingUp: '',
        activity: '',
        content: '',
        rawText: '',
    });
    const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
    const [activeTab, setActiveTab] = useState<'summary' | 'json'>('summary');

    useEffect(() => {
        fetchReports();
        fetchGroups();
    }, [showArchived]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports?archived=${showArchived}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setReports(data);
            } else {
                console.error("API returned non-array for reports:", data);
                setReports([]);
            }
        } catch (error) {
            console.error("Error fetching reports", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups');
            const data = await res.json();
            if (Array.isArray(data)) {
                setGroups(data);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const handleCreateReport = async () => {
        if (!newReport.groupId || !newReport.content.trim()) {
            alert('Vul minimaal een groep en inhoud in');
            return;
        }

        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId: newReport.groupId,
                    date: newReport.date,
                    youthCount: newReport.youthCount,
                    leaderCount: newReport.leaderCount,
                    warmingUp: newReport.warmingUp,
                    activity: newReport.activity,
                    content: newReport.content,
                    rawText: newReport.rawText,
                    authorId: newReport.instructor || 'system',
                    parsedData: analysisResult ? JSON.stringify(analysisResult) : null,
                    sessionSummary: analysisResult?.meta.overallMood || null,
                }),
            });

            if (res.ok) {
                setIsCreateModalOpen(false);
                setNewReport({
                    groupId: '',
                    date: new Date().toISOString().split('T')[0],
                    instructor: '',
                    youthCount: 8,
                    leaderCount: 2,
                    warmingUp: '',
                    activity: '',
                    content: '',
                    rawText: '',
                });
                setIsPrivacyChecked(false);
                setAnalysisResult(null);
                fetchReports();
            } else {
                alert('Rapportage aanmaken mislukt');
            }
        } catch (error) {
            console.error('Error creating report:', error);
            alert('Rapportage aanmaken mislukt');
        }
    };

    const handleAnalyze = async () => {
        if (!newReport.content.trim()) {
            alert('Vul eerst de rapportage in.');
            return;
        }

        setIsAnalyzing(true);
        try {
            const groupName = groups.find(g => g.id === newReport.groupId)?.name || 'Onbekend';
            const result = await analyzeReport(newReport.content, newReport.date, groupName);
            setAnalysisResult(result);
        } catch (error) {
            console.error("Analysis failed", error);
            alert("Analyse mislukt");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const filteredReports = reports.filter(r =>
        (r.group?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleArchive = async (id: string, archive: boolean) => {
        if (confirm(`Weet je zeker dat je deze rapportage wilt ${archive ? 'archiveren' : 'terughalen'}?`)) {
            try {
                await fetch('/api/reports', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, archived: archive }),
                });
                fetchReports();
            } catch (error) {
                console.error("Error archiving report", error);
            }
        }
    };

    const handleEdit = (report: Report) => {
        setEditingReport({ ...report });
        setIsEditModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingReport) {
            try {
                await fetch('/api/reports', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingReport.id,
                        content: editingReport.content,
                        summary: editingReport.sessionSummary
                    }),
                });
                setIsEditModalOpen(false);
                setEditingReport(null);
                fetchReports();
            } catch (error) {
                console.error("Error updating report", error);
            }
        }
    };

    const getMoodColor = (mood: string) => {
        switch (mood?.toLowerCase()) {
            case 'positief': return 'bg-green-100 text-green-700';
            case 'neutraal': return 'bg-blue-100 text-blue-700';
            case 'onrustig': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleCopySummary = (summary: string) => {
        navigator.clipboard.writeText(summary);
        alert('Samenvatting gekopieerd naar klembord');
    };

    const handleExportJson = (report: Report) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(report.parsedData || JSON.stringify(report));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `report_${report.date}_${report.group.name}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleExportText = (report: Report) => {
        const textContent = generateReportText({
            group: report.group,
            date: report.date,
            youthCount: report.youthCount || 0,
            leaderCount: report.leaderCount || 0,
            warmingUp: report.warmingUp,
            activity: report.activity,
            cleanedText: report.cleanedText,
            parsedData: report.parsedData,
        });

        const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(textContent);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `rapport-${report.group.name}-${report.date}.txt`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleEmailShare = (report: Report) => {
        const subject = `Sportrapportage ${report.group.name} - ${new Date(report.date).toLocaleDateString('nl-NL')}`;
        const body = generateReportText({
            group: report.group,
            date: report.date,
            youthCount: report.youthCount || 0,
            leaderCount: report.leaderCount || 0,
            warmingUp: report.warmingUp,
            activity: report.activity,
            cleanedText: report.cleanedText,
            parsedData: report.parsedData,
        });

        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handlePrint = () => {
        window.print();
    };

    const calculateMoodScore = (result: AIAnalysisResult) => {
        let score = 100;
        // Deduct for incidents
        score -= (result.incidents?.length || 0) * 15;
        // Deduct for negative mood keywords (simple heuristic)
        const mood = result.meta.overallMood.toLowerCase();
        if (mood.includes('onrustig') || mood.includes('slecht') || mood.includes('gespannen')) score -= 20;
        if (mood.includes('matig')) score -= 10;

        return Math.max(0, Math.min(100, score));
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 print:p-0 print:max-w-none">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Rapportages</h1>
                    <p className="text-gray-500 text-lg mt-1">Beheer en doorzoek alle sportrapportages</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-medium shadow-lg hover:shadow-xl"
                    >
                        <Plus size={20} />
                        Nieuwe Rapportage
                    </button>
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium
                            ${showArchived
                                ? 'bg-gray-900 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Archive size={20} />
                        {showArchived ? 'Toon Actief' : 'Toon Archief'}
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm print:hidden">
                <Search className="text-gray-400 ml-2" size={20} />
                <input
                    type="text"
                    placeholder="Zoek op groep, auteur of inhoud..."
                    className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                    onClick={fetchReports}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
                        <FileText size={48} className="mx-auto mb-3 opacity-20" />
                        <p>Geen rapportages gevonden</p>
                    </div>
                ) : (
                    filteredReports.map((report) => {
                        const parsed = report.parsedData ? JSON.parse(report.parsedData) : null;

                        return (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-6 flex flex-col md:flex-row gap-8">
                                    {/* Meta Info */}
                                    <div className="flex-shrink-0 w-full md:w-56 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                                                style={{ backgroundColor: report.group?.color || '#3b82f6' }}
                                            >
                                                {report.group?.name?.substring(0, 2) || 'GR'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg">{report.group?.name || 'Onbekend'}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                                    <Calendar size={14} />
                                                    {new Date(report.date).toLocaleDateString('nl-NL')}
                                                </p>
                                            </div>
                                        </div>

                                        {parsed?.mood && (
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${getMoodColor(parsed.mood)}`}>
                                                Sfeer: {parsed.mood}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {report.sessionSummary || parsed?.sessionSummary || "Geen samenvatting"}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(report)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                    title="Bewerken"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(report.id, !showArchived)}
                                                    className={`p-2 rounded-xl transition-colors
                                                        ${showArchived
                                                            ? 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                                            : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                                                        }`}
                                                    title={showArchived ? "Terughalen" : "Archiveren"}
                                                >
                                                    {showArchived ? <RefreshCw size={18} /> : <Archive size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-3">
                                            {anonymizeText(report.content)}
                                        </p>

                                        <button
                                            onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                                            className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 group"
                                        >
                                            {expandedId === report.id ? 'Toon minder' : 'Lees meer'}
                                            {expandedId === report.id
                                                ? <ChevronUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                                                : <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
                                            }
                                        </button>

                                        <AnimatePresence>
                                            {expandedId === report.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="mt-4 pt-4 border-t border-gray-100"
                                                >
                                                    {parsed ? (
                                                        <div className="bg-indigo-50 rounded-xl border border-indigo-100 overflow-hidden print:border-none print:bg-white">
                                                            <div className="flex border-b border-indigo-100 print:hidden">
                                                                <div className="px-4 py-2 text-xs font-bold text-indigo-800 uppercase tracking-wider bg-indigo-100/50">
                                                                    AI Analyse
                                                                </div>
                                                            </div>
                                                            <div className="p-4 space-y-6">
                                                                {/* Mood Meter & Stats */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    {/* Mood Meter */}
                                                                    <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex flex-col items-center justify-center">
                                                                        <div className="text-xs font-bold text-gray-500 uppercase mb-2">Groepsdruk</div>
                                                                        <div className="relative w-32 h-16 overflow-hidden">
                                                                            <div className="absolute top-0 left-0 w-full h-full bg-gray-200 rounded-t-full"></div>
                                                                            <div
                                                                                className={`absolute top-0 left-0 w-full h-full rounded-t-full origin-bottom transition-transform duration-1000 ${calculateMoodScore(parsed) > 70 ? 'bg-green-500' :
                                                                                    calculateMoodScore(parsed) > 40 ? 'bg-orange-500' : 'bg-red-500'
                                                                                    }`}
                                                                                style={{ transform: `rotate(${calculateMoodScore(parsed) * 1.8 - 180}deg)` }}
                                                                            ></div>
                                                                        </div>
                                                                        <div className="mt-2 font-bold text-xl text-gray-800">{calculateMoodScore(parsed)}%</div>
                                                                    </div>

                                                                    {/* Stats */}
                                                                    <div className="col-span-2 bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex justify-around items-center">
                                                                        <div className="text-center">
                                                                            <div className="text-2xl font-bold text-indigo-600">{parsed.incidents?.length || 0}</div>
                                                                            <div className="text-xs text-gray-500 font-medium uppercase">Incidenten</div>
                                                                        </div>
                                                                        <div className="text-center">
                                                                            <div className="text-2xl font-bold text-blue-600">{parsed.measures?.length || 0}</div>
                                                                            <div className="text-xs text-gray-500 font-medium uppercase">Maatregelen</div>
                                                                        </div>
                                                                        <div className="text-center">
                                                                            <div className="text-2xl font-bold text-purple-600">{parsed.appointments?.length || 0}</div>
                                                                            <div className="text-xs text-gray-500 font-medium uppercase">Afspraken</div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h4 className="text-sm font-bold text-indigo-900 mb-2">Samenvatting</h4>
                                                                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 bg-white p-3 rounded-lg border border-indigo-100 print:border-none print:p-0">
                                                                        {parsed.summary || "Geen samenvatting beschikbaar"}
                                                                    </pre>
                                                                </div>

                                                                {parsed.incidents && parsed.incidents.length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                                                                            <AlertTriangle size={16} />
                                                                            Incidenten ({parsed.incidents.length})
                                                                        </h4>
                                                                        <div className="space-y-2">
                                                                            {parsed.incidents.map((inc: any, idx: number) => (
                                                                                <div key={idx} className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-900">
                                                                                    <span className="font-bold">{inc.time}:</span> {inc.description}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <details className="group">
                                                                    <summary className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                                                        <FileJson size={14} />
                                                                        Toon volledige JSON data
                                                                    </summary>
                                                                    <pre className="mt-2 font-mono text-xs text-gray-600 bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                                                                        {JSON.stringify(parsed, null, 2)}
                                                                    </pre>
                                                                </details>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-700 whitespace-pre-wrap">
                                                            {report.content}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Action Buttons (Export/Share) */}
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleCopySummary(report.sessionSummary || report.content)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Kopieer samenvatting"
                                            >
                                                <Copy size={16} />
                                                Kopieer
                                            </button>
                                            <button
                                                onClick={() => handleExportJson(report)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Exporteer als JSON"
                                            >
                                                <FileJson size={16} />
                                                JSON
                                            </button>
                                            <button
                                                onClick={() => handleExportText(report)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Exporteer als Tekst"
                                            >
                                                <FileText size={16} />
                                                Tekst
                                            </button>
                                            <button
                                                onClick={() => handleEmailShare(report)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Deel via E-mail"
                                            >
                                                <Mail size={16} />
                                                E-mail
                                            </button>
                                            <button
                                                onClick={handlePrint}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Print Rapportage"
                                            >
                                                <Printer size={16} />
                                                Print
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && editingReport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8"
                        >
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">Rapportage Bewerken</h2>
                            <form onSubmit={handleSave} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Samenvatting</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingReport.sessionSummary || ''}
                                        onChange={e => setEditingReport({ ...editingReport, sessionSummary: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Inhoud</label>
                                    <textarea
                                        required
                                        value={editingReport.content}
                                        onChange={e => setEditingReport({ ...editingReport, content: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 h-48 resize-none transition-all"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Annuleren
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                    >
                                        Opslaan
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Report Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Nieuwe Rapportage</h2>
                                        <p className="text-sm text-gray-600 mt-1">Schrijf of plak een rapportage</p>
                                    </div>
                                    <button
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="p-2 hover:bg-white rounded-lg transition-colors"
                                    >
                                        <X size={24} className="text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Group Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Groep <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={newReport.groupId}
                                        onChange={(e) => setNewReport({ ...newReport, groupId: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        required
                                    >
                                        <option value="">Selecteer een groep...</option>
                                        {groups.map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date and Instructor Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Datum <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                value={newReport.date}
                                                onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
                                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Instructor */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Sportbegeleider
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={newReport.instructor}
                                                onChange={(e) => setNewReport({ ...newReport, instructor: e.target.value })}
                                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Naam sportbegeleider..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* JJI Quick-Input Section */}
                                <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Users className="text-blue-600" size={20} />
                                        <h3 className="text-lg font-bold text-gray-900">Groepsgegevens</h3>
                                    </div>

                                    {/* Counters Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Counter
                                            label="Aantal Jongeren"
                                            value={newReport.youthCount}
                                            onChange={(value) => setNewReport({ ...newReport, youthCount: value })}
                                            min={0}
                                            max={50}
                                        />
                                        <Counter
                                            label="Aantal GL"
                                            value={newReport.leaderCount}
                                            onChange={(value) => setNewReport({ ...newReport, leaderCount: value })}
                                            min={0}
                                            max={10}
                                        />
                                    </div>

                                    {/* Warming-up */}
                                    <ChipSelector
                                        label="Warming-up"
                                        options={WARMING_UP_SUGGESTIONS}
                                        value={newReport.warmingUp}
                                        onChange={(value) => setNewReport({ ...newReport, warmingUp: value })}
                                        placeholder="Beschrijf de warming-up..."
                                    />

                                    {/* Activity / Sportmoment */}
                                    <ChipSelector
                                        label="Sportmoment / Activiteit"
                                        options={ACTIVITY_SUGGESTIONS}
                                        value={newReport.activity}
                                        onChange={(value) => setNewReport({ ...newReport, activity: value })}
                                        placeholder="Beschrijf de hoofdactiviteit..."
                                    />

                                    {/* Bijzonderheden / Notes with Tags */}
                                    <TagInput
                                        label="Bijzonderheden"
                                        tags={NOTE_TAGS}
                                        value={newReport.content}
                                        onChange={(value) => setNewReport({ ...newReport, content: value })}
                                        placeholder="Voeg bijzonderheden toe..."
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Rapportage Inhoud <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Schrijf of plak hier de volledige rapportage
                                    </p>
                                    <textarea
                                        value={newReport.content}
                                        onChange={(e) => {
                                            setNewReport({ ...newReport, content: e.target.value });
                                            // Auto-grow
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm min-h-[300px] transition-all"
                                        placeholder="Plak of typ hier de rapportage...

Voorbeeld:
Groep: Vliet
Datum: 2024-01-15
Sportbegeleider: Jan Jansen

Stemming: Positief
Activiteit: Voetbal
Deelname: 8/10 jeugdigen

Opvallende momenten:
- Goede samenwerking tijdens teamspel
- Twee jeugdigen hadden moeite met regels"
                                        required
                                    />

                                    {!isPrivacyChecked ? (
                                        <button
                                            onClick={() => {
                                                const cleaned = anonymizeText(newReport.content);
                                                setNewReport({
                                                    ...newReport,
                                                    rawText: newReport.content,
                                                    content: cleaned
                                                });
                                                setIsPrivacyChecked(true);
                                            }}
                                            className="mt-2 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            <ShieldCheck size={16} />
                                            Anonimiseer Namen (Privacy Check)
                                        </button>
                                    ) : (
                                        <div className="mt-2 p-3 bg-green-50 border border-green-100 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-bold text-green-800 flex items-center gap-2">
                                                    <ShieldCheck size={16} />
                                                    Geanonimiseerde Tekst
                                                </span>
                                                <button
                                                    onClick={() => setIsPrivacyChecked(false)}
                                                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                                                >
                                                    Bewerken
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{newReport.content}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Analysis Section */}
                                {analysisResult && (
                                    <div className="bg-indigo-50 rounded-xl border border-indigo-100 overflow-hidden">
                                        <div className="flex border-b border-indigo-100">
                                            <button
                                                onClick={() => setActiveTab('summary')}
                                                className={`flex-1 py-3 text-sm font-bold ${activeTab === 'summary' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-indigo-400 hover:text-indigo-600'}`}
                                            >
                                                Samenvatting
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('json')}
                                                className={`flex-1 py-3 text-sm font-bold ${activeTab === 'json' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-indigo-400 hover:text-indigo-600'}`}
                                            >
                                                JSON Data
                                            </button>
                                        </div>
                                        <div className="p-4 max-h-60 overflow-y-auto">
                                            {activeTab === 'summary' ? (
                                                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                                                    {analysisResult.summary}
                                                </pre>
                                            ) : (
                                                <pre className="font-mono text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                                                    {JSON.stringify(analysisResult, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Help Text */}
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-sm text-blue-800">
                                        <strong>💡 Tip:</strong> Je kunt een bestaande rapportage kopiëren en hier plakken.
                                        Het systeem zal automatisch proberen de informatie te verwerken.
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Annuleren
                                </button>
                                <button
                                    onClick={handleCreateReport}
                                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Rapportage Opslaan
                                </button>
                                {!analysisResult && (
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isAnalyzing ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Brain size={18} />
                                        )}
                                        Analyseer met AI
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
