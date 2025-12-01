'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, MessageSquare, CheckCircle, XCircle, Archive, Trash2, Send, Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import axios from 'axios';

type Evaluation = {
    id: string;
    date: Date | string;
    summary: string;
    author: string | null;
    createdAt: Date | string;
};

type RestorativeTalk = {
    id: string;
    youthName: string;
    groupId: string;
    reason: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdBy?: string;
    createdAt: string;
    completedAt?: string;
    failureReason?: string;
    archived: boolean;
    group?: {
        name: string;
    };
    evaluations?: Evaluation[];
};

interface RestorativeTalkDetailModalProps {
    talk: RestorativeTalk | null;
    isOpen: boolean;
    onClose: () => void;
    onComplete: (id: string) => void;
    onFail: (id: string) => void;
    onArchive: (id: string) => void;
    onDelete: (id: string) => void;
    onCreateFollowUp: (talk: RestorativeTalk) => void;
    onRefresh?: () => void;
}

export default function RestorativeTalkDetailModal({
    talk,
    isOpen,
    onClose,
    onComplete,
    onFail,
    onArchive,
    onDelete,
    onCreateFollowUp,
    onRefresh
}: RestorativeTalkDetailModalProps) {
    const [newEvalSummary, setNewEvalSummary] = useState('');
    const [newEvalAuthor, setNewEvalAuthor] = useState('');
    const [submittingEval, setSubmittingEval] = useState(false);

    if (!talk) return null;

    const safeDateFormat = (dateStr: string | Date | null | undefined, formatStr: string) => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return null;
            return format(date, formatStr, { locale: nl });
        } catch (e) {
            return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                        Open
                    </span>
                );
            case 'COMPLETED':
                return (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        Succesvol
                    </span>
                );
            case 'FAILED':
                return (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        Niet gelukt
                    </span>
                );
            default:
                return null;
        }
    };

    const handleAddEvaluation = async () => {
        if (!newEvalSummary.trim()) return;

        setSubmittingEval(true);
        try {
            await axios.post('/api/evaluations', {
                restorativeTalkId: talk.id,
                summary: newEvalSummary,
                author: newEvalAuthor || null,
            });
            setNewEvalSummary('');
            setNewEvalAuthor('');
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Error adding evaluation:', error);
            alert('Fout bij het toevoegen van evaluatie');
        } finally {
            setSubmittingEval(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 border-b border-purple-500/20 z-10">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                                    <MessageSquare className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white">
                                                        {talk.youthName}
                                                    </h2>
                                                    <p className="text-purple-100 text-sm">
                                                        Herstelgesprek Details
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                                            aria-label="Sluiten"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Quick Info Badges */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/30">
                                            {talk.group?.name || "Onbekend"}
                                        </span>
                                        {getStatusBadge(talk.status)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
                                    {/* Grid Info */}
                                    <div className="grid grid-cols-2 gap-6 mb-8">
                                        {/* Created At */}
                                        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                    Aangemaakt op
                                                </p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                    {safeDateFormat(talk.createdAt, "dd MMMM yyyy") || "Onbekend"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Completed At (if completed) */}
                                        {talk.completedAt && (
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                        Afgerond op
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                        {safeDateFormat(talk.completedAt, "dd MMMM yyyy") || "Onbekend"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Created By */}
                                        {talk.createdBy && (
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                        Aangemaakt door
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                        {talk.createdBy}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Reason Section */}
                                    <div className="mb-8">
                                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            Reden voor gesprek
                                        </h3>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                                {talk.reason || "Geen reden opgegeven"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Failure Reason (if failed) */}
                                    {talk.status === 'FAILED' && talk.failureReason && (
                                        <div className="mb-8">
                                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                                <XCircle className="w-4 h-4" />
                                                Reden voor mislukken
                                            </h3>
                                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                                <p className="text-red-900 dark:text-red-100">
                                                    {talk.failureReason}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Evaluations Section */}
                                    <div className="mb-8">
                                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Evaluaties ({talk.evaluations?.length || 0})
                                        </h3>

                                        {/* Existing Evaluations */}
                                        {talk.evaluations && talk.evaluations.length > 0 ? (
                                            <div className="space-y-3 mb-4">
                                                {talk.evaluations.map((evaluation) => (
                                                    <div key={evaluation.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {evaluation.author || 'Anoniem'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {safeDateFormat(evaluation.createdAt, "dd MMM yyyy")}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                            {evaluation.summary}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Nog geen evaluaties.</p>
                                        )}

                                        {/* Add New Evaluation Form */}
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="Naam auteur (optioneel)"
                                                    value={newEvalAuthor}
                                                    onChange={(e) => setNewEvalAuthor(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                                />
                                                <textarea
                                                    placeholder="Voeg een evaluatie toe..."
                                                    value={newEvalSummary}
                                                    onChange={(e) => setNewEvalSummary(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                                />
                                                <button
                                                    onClick={handleAddEvaluation}
                                                    disabled={!newEvalSummary.trim() || submittingEval}
                                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                >
                                                    <Send size={16} />
                                                    {submittingEval ? 'Bezig...' : 'Evaluatie Toevoegen'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                                            Acties
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => {
                                                    onCreateFollowUp(talk);
                                                    onClose();
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                            >
                                                <Plus size={18} />
                                                Vervolggesprek
                                            </button>
                                            {talk.status !== 'COMPLETED' && (
                                                <button
                                                    onClick={() => {
                                                        onComplete(talk.id);
                                                        onClose();
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                                >
                                                    <CheckCircle size={18} />
                                                    Markeer als Succesvol
                                                </button>
                                            )}
                                            {talk.status !== 'FAILED' && talk.status !== 'COMPLETED' && (
                                                <button
                                                    onClick={() => {
                                                        onFail(talk.id);
                                                        onClose();
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                                >
                                                    <XCircle size={18} />
                                                    Markeer als Niet Gelukt
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    onArchive(talk.id);
                                                    onClose();
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                                            >
                                                <Archive size={18} />
                                                Archiveren
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Weet je zeker dat je dit gesprek definitief wilt verwijderen?')) {
                                                        onDelete(talk.id);
                                                        onClose();
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                            >
                                                <Trash2 size={18} />
                                                Verwijderen
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={onClose}
                                            className="px-6 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium border border-gray-300 dark:border-gray-600"
                                        >
                                            Sluiten
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )
            }
        </AnimatePresence >
    );
}
