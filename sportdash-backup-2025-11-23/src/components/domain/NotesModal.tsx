'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Archive, ArchiveRestore, Save } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface Note {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    archived: boolean;
    authorId: string | null;
}

interface NotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    groupName: string;
}

export default function NotesModal({ isOpen, onClose, groupId, groupName }: NotesModalProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [showArchived, setShowArchived] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchNotes();
        }
    }, [isOpen, groupId]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/groups/${groupId}/notes?includeArchived=true`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setNotes(data);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNoteContent.trim()) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/groups/${groupId}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newNoteContent }),
            });

            if (res.ok) {
                setNewNoteContent('');
                fetchNotes();
            }
        } catch (error) {
            console.error('Error adding note:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateNote = async (noteId: string) => {
        if (!editContent.trim()) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/groups/${groupId}/notes/${noteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent }),
            });

            if (res.ok) {
                setEditingId(null);
                setEditContent('');
                fetchNotes();
            }
        } catch (error) {
            console.error('Error updating note:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm('Weet je zeker dat je deze notitie wilt verwijderen?')) return;

        try {
            const res = await fetch(`/api/groups/${groupId}/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchNotes();
            }
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleToggleArchive = async (noteId: string, currentArchived: boolean) => {
        try {
            const res = await fetch(`/api/groups/${groupId}/notes/${noteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ archived: !currentArchived }),
            });

            if (res.ok) {
                fetchNotes();
            }
        } catch (error) {
            console.error('Error archiving note:', error);
        }
    };

    const activeNotes = notes.filter(n => !n.archived);
    const archivedNotes = notes.filter(n => n.archived);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-yellow-50 to-amber-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Notities</h2>
                        <p className="text-sm text-gray-600 mt-1">{groupName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Add New Note */}
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nieuwe Notitie
                        </label>
                        <textarea
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none resize-none"
                            rows={3}
                            placeholder="Typ hier je notitie..."
                            disabled={saving}
                        />
                        <button
                            onClick={handleAddNote}
                            disabled={!newNoteContent.trim() || saving}
                            className="mt-2 flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            <Plus size={18} />
                            {saving ? 'Opslaan...' : 'Notitie Toevoegen'}
                        </button>
                    </div>

                    {/* Active Notes */}
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Laden...</div>
                    ) : activeNotes.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            Nog geen notities. Voeg er een toe!
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                                Actieve Notities ({activeNotes.length})
                            </h3>
                            {activeNotes.map((note) => (
                                <div
                                    key={note.id}
                                    className="bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                                >
                                    {editingId === note.id ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                                rows={3}
                                                disabled={saving}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdateNote(note.id)}
                                                    disabled={saving}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                                >
                                                    <Save size={14} />
                                                    Opslaan
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setEditContent('');
                                                    }}
                                                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                                                >
                                                    Annuleren
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-gray-800 whitespace-pre-wrap mb-2">{note.content}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    {formatDistanceToNow(new Date(note.createdAt), {
                                                        addSuffix: true,
                                                        locale: nl,
                                                    })}
                                                </span>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(note.id);
                                                            setEditContent(note.content);
                                                        }}
                                                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                        title="Bewerken"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleArchive(note.id, note.archived)}
                                                        className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                                                        title="Archiveren"
                                                    >
                                                        <Archive size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                        title="Verwijderen"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Archived Notes */}
                    {archivedNotes.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowArchived(!showArchived)}
                                className="text-sm font-bold text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors flex items-center gap-2"
                            >
                                <Archive size={14} />
                                Gearchiveerd ({archivedNotes.length})
                                <span className="text-xs">{showArchived ? '▼' : '▶'}</span>
                            </button>
                            {showArchived && (
                                <div className="space-y-2">
                                    {archivedNotes.map((note) => (
                                        <div
                                            key={note.id}
                                            className="bg-gray-50 p-3 rounded-lg border border-gray-200 opacity-75"
                                        >
                                            <p className="text-gray-600 text-sm whitespace-pre-wrap mb-2">
                                                {note.content}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-400">
                                                    {formatDistanceToNow(new Date(note.createdAt), {
                                                        addSuffix: true,
                                                        locale: nl,
                                                    })}
                                                </span>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleToggleArchive(note.id, note.archived)}
                                                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                        title="Herstellen"
                                                    >
                                                        <ArchiveRestore size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                        title="Verwijderen"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
