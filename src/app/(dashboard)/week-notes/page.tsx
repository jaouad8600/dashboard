'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Filter, Save, X, Trash2 } from 'lucide-react';
import axios from 'axios';

type WeekNote = {
    id: string;
    content: string;
    date: string;
    author: string;
    groupId: string | null;
    group?: {
        name: string;
    };
    createdAt: string;
};

type Group = {
    id: string;
    name: string;
};

export default function WeekNotesPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [notes, setNotes] = useState<WeekNote[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [authorFilter, setAuthorFilter] = useState('');

    // New Note State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newNoteAuthor, setNewNoteAuthor] = useState('');
    const [newNoteGroup, setNewNoteGroup] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        fetchNotes();
    }, [currentDate, selectedGroup, authorFilter]);

    const fetchGroups = async () => {
        try {
            const res = await axios.get('/api/groups');
            setGroups(res.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                date: currentDate.toISOString(),
            });
            if (selectedGroup) params.append('groupId', selectedGroup);
            if (authorFilter) params.append('author', authorFilter);

            const res = await axios.get(`/api/week-notes?${params.toString()}`);
            setNotes(res.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = async () => {
        if (!newNoteContent || !newNoteAuthor) return;

        try {
            await axios.post('/api/week-notes', {
                content: newNoteContent,
                author: newNoteAuthor,
                groupId: newNoteGroup || null,
                date: new Date().toISOString(),
            });
            setIsModalOpen(false);
            setNewNoteContent('');
            setNewNoteAuthor('');
            setNewNoteGroup('');
            fetchNotes();
        } catch (error) {
            console.error('Error creating note:', error);
            alert('Fout bij het opslaan van de notitie');
        }
    };

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-serif">Weeknotities</h1>
                    <p className="text-gray-500">Evaluaties en bijzonderheden per week</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-teylingereind-royal text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 font-medium"
                >
                    <Plus size={20} />
                    Nieuwe Notitie
                </button>
            </div>

            {/* Filters & Navigation */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
                    <button
                        onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                        className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm"
                    >
                        <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <span className="font-medium text-gray-900 min-w-[200px] text-center">
                        Week {format(currentDate, 'w', { locale: nl })} ({format(weekStart, 'd MMM', { locale: nl })} - {format(weekEnd, 'd MMM', { locale: nl })})
                    </span>
                    <button
                        onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                        className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm"
                    >
                        <ChevronRight size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        <Filter size={16} className="text-gray-400" />
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm text-gray-700 min-w-[120px]"
                        >
                            <option value="">Alle Groepen</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                            type="text"
                            placeholder="Filter op auteur..."
                            value={authorFilter}
                            onChange={(e) => setAuthorFilter(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400 w-[150px]"
                        />
                    </div>
                </div>
            </div>

            {/* Notes Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400">Geen notities gevonden voor deze week.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map((note) => (
                        <div key={note.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                        {note.author.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{note.author}</p>
                                        <p className="text-xs text-gray-500">
                                            {format(new Date(note.createdAt), 'd MMM HH:mm', { locale: nl })}
                                        </p>
                                    </div>
                                </div>
                                {note.group && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">
                                        {note.group.name}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap flex-grow">
                                {note.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Nieuwe Weeknotitie</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
                                <input
                                    type="text"
                                    value={newNoteAuthor}
                                    onChange={(e) => setNewNoteAuthor(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Jouw naam"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Groep (Optioneel)</label>
                                <select
                                    value={newNoteGroup}
                                    onChange={(e) => setNewNoteGroup(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Geen specifieke groep</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notitie</label>
                                <textarea
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                    rows={5}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="Schrijf hier je observatie of evaluatie..."
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleCreateNote}
                                disabled={!newNoteContent || !newNoteAuthor}
                                className="px-4 py-2 bg-teylingereind-royal text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save size={18} />
                                Opslaan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
