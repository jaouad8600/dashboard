'use client';

import { useState, useEffect } from 'react';
import { X, ShieldAlert, Plus, CheckCircle, XCircle, Archive, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { anonymizeName } from '@/lib/privacy';

interface RestorativeTalk {
    id: string;
    youthName: string;
    reason: string;
    createdBy: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    failureReason?: string | null;
    archived: boolean;
    createdAt: string;
    completedAt?: string | null;
}

interface RestorativeTalkModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    groupName: string;
}

export default function RestorativeTalkModal({
    isOpen,
    onClose,
    groupId,
    groupName,
}: RestorativeTalkModalProps) {
    const [talks, setTalks] = useState<RestorativeTalk[]>([]);
    const [loading, setLoading] = useState(false);
    const [newYouthName, setNewYouthName] = useState('');
    const [newReason, setNewReason] = useState('');
    const [newCreatedBy, setNewCreatedBy] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [failureModalOpen, setFailureModalOpen] = useState(false);
    const [selectedTalkId, setSelectedTalkId] = useState<string | null>(null);
    const [failureReason, setFailureReason] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchTalks();
        }
    }, [isOpen, showArchived]);

    const fetchTalks = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/restorative-talks?groupId=${groupId}&includeArchived=${showArchived}`);
            const data = await res.json();
            setTalks(data);
        } catch (error) {
            console.error('Error fetching talks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTalk = async () => {
        if (!newYouthName.trim()) {
            alert('Vul een naam in');
            return;
        }

        try {
            const res = await fetch('/api/restorative-talks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId,
                    youthName: newYouthName.trim(),
                    reason: newReason.trim(),
                    createdBy: newCreatedBy.trim() || 'Onbekend',
                }),
            });

            if (res.ok) {
                setNewYouthName('');
                setNewReason('');
                setNewCreatedBy('');
                fetchTalks();
            } else {
                alert('Toevoegen mislukt');
            }
        } catch (error) {
            console.error('Error adding talk:', error);
            alert('Er is een fout opgetreden');
        }
    };

    const handleMarkCompleted = async (talkId: string) => {
        try {
            const res = await fetch('/api/restorative-talks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: talkId,
                    status: 'COMPLETED',
                    archived: true,
                }),
            });

            if (res.ok) {
                fetchTalks();
            } else {
                alert('Update mislukt');
            }
        } catch (error) {
            console.error('Error marking completed:', error);
            alert('Er is een fout opgetreden');
        }
    };

    const handleMarkFailed = (talkId: string) => {
        setSelectedTalkId(talkId);
        setFailureModalOpen(true);
    };

    const handleSubmitFailure = async () => {
        if (!selectedTalkId || !failureReason.trim()) {
            alert('Vul een reden in');
            return;
        }

        try {
            const res = await fetch('/api/restorative-talks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedTalkId,
                    status: 'FAILED',
                    failureReason: failureReason.trim(),
                    archived: true,
                }),
            });

            if (res.ok) {
                setFailureModalOpen(false);
                setFailureReason('');
                setSelectedTalkId(null);
                fetchTalks();
            } else {
                alert('Update mislukt');
            }
        } catch (error) {
            console.error('Error marking failed:', error);
            alert('Er is een fout opgetreden');
        }
    };

    const handleDelete = async (talkId: string) => {
        if (!confirm('Weet je zeker dat je deze herstelgesprek wilt verwijderen?')) {
            return;
        }

        try {
            const res = await fetch(`/api/restorative-talks?id=${talkId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchTalks();
            } else {
                alert('Verwijderen mislukt');
            }
        } catch (error) {
            console.error('Error deleting talk:', error);
            alert('Er is een fout opgetreden');
        }
    };

    const activeTalks = talks.filter(t => !t.archived);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-teylingereind-orange/10 to-orange-50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-serif">
                                        <ShieldAlert className="text-teylingereind-orange" />
                                        Herstelgesprekken
                                    </h2>
                                    <p className="text-gray-700 text-sm">Groep {groupName}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-orange-100 rounded-full text-teylingereind-orange transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="px-6 pt-4 pb-2 border-b border-gray-100 bg-gray-50">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Nieuw Herstelgesprek Toevoegen
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Naam jongere..."
                                        value={newYouthName}
                                        onChange={(e) => setNewYouthName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teylingereind-orange focus:border-transparent outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Reden voor gesprek..."
                                        value={newReason}
                                        onChange={(e) => setNewReason(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teylingereind-orange focus:border-transparent outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Begeleider (sportdocent)..."
                                        value={newCreatedBy}
                                        onChange={(e) => setNewCreatedBy(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teylingereind-orange focus:border-transparent outline-none"
                                    />
                                    <button
                                        onClick={handleAddTalk}
                                        className="w-full px-4 py-2 bg-teylingereind-orange text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <Plus size={18} />
                                        Toevoegen
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 pt-4 pb-2 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-700">
                                    Actieve Gesprekken ({activeTalks.length})
                                </h3>
                                <button
                                    onClick={() => setShowArchived(!showArchived)}
                                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                                >
                                    {showArchived ? 'Verberg gearchiveerd' : 'Toon gearchiveerd'}
                                </button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto">
                                {loading ? (
                                    <p className="text-center text-gray-500">Laden...</p>
                                ) : talks.length === 0 ? (
                                    <p className="text-center text-gray-500 italic">
                                        {showArchived ? 'Geen gesprekken' : 'Geen actieve gesprekken'}
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {talks.map((talk) => (
                                            <div
                                                key={talk.id}
                                                className={`p-4 rounded-lg border transition-all ${talk.status === 'PENDING'
                                                    ? 'bg-red-50 border-red-200'
                                                    : talk.status === 'COMPLETED'
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-gray-50 border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900">{anonymizeName(talk.youthName)}</p>
                                                        <p className="text-xs text-gray-600 mt-0.5">{talk.reason || "Geen reden opgegeven"}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">Door: {talk.createdBy || "Onbekend"}</p>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            {talk.status === 'PENDING' && (
                                                                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded font-medium">
                                                                    In afwachting
                                                                </span>
                                                            )}
                                                            {talk.status === 'COMPLETED' && (
                                                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium flex items-center gap-1">
                                                                    <CheckCircle size={12} />
                                                                    Voltooid
                                                                </span>
                                                            )}
                                                            {talk.status === 'FAILED' && (
                                                                <>
                                                                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded font-medium flex items-center gap-1">
                                                                        <XCircle size={12} />
                                                                        Niet gelukt
                                                                    </span>
                                                                    {talk.failureReason && (
                                                                        <span className="text-xs text-gray-600">
                                                                            - {talk.failureReason}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            )}
                                                            {talk.archived && (
                                                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded flex items-center gap-1">
                                                                    <Archive size={10} />
                                                                    Gearchiveerd
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {!talk.archived && talk.status === 'PENDING' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleMarkCompleted(talk.id)}
                                                                className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                                                title="Gesprek Voltooid"
                                                            >
                                                                <CheckCircle size={14} />
                                                                Voltooid
                                                            </button>
                                                            <button
                                                                onClick={() => handleMarkFailed(talk.id)}
                                                                className="px-3 py-1.5 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1"
                                                                title="Gesprek Niet Gelukt"
                                                            >
                                                                <XCircle size={14} />
                                                                Niet Gelukt
                                                            </button>
                                                        </div>
                                                    )}
                                                    {talk.archived && (
                                                        <button
                                                            onClick={() => handleDelete(talk.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Verwijderen"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-500">
                                Jongeren met een openstaand herstelgesprek mogen niet deelnemen aan activiteiten.
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {failureModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Reden voor Mislukking</h3>
                            <textarea
                                value={failureReason}
                                onChange={(e) => setFailureReason(e.target.value)}
                                placeholder="Waarom is het gesprek niet gelukt?"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none resize-none"
                                rows={4}
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => {
                                        setFailureModalOpen(false);
                                        setFailureReason('');
                                        setSelectedTalkId(null);
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Annuleren
                                </button>
                                <button
                                    onClick={() => handleSubmitFailure()}
                                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Opslaan
                                </button>
                            </div>
                        </motion.div>
                    </div >
                )
                }
            </AnimatePresence >
        </>
    );
}
