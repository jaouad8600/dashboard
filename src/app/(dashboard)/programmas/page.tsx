"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Dumbbell, Utensils, FileText } from "lucide-react";

interface Program {
    id: string;
    title: string;
    description: string | null;
    type: "TRAINING" | "NUTRITION";
    content: string;
    updatedAt: string;
}

export default function ProgramsPage() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<"TRAINING" | "NUTRITION">("TRAINING");
    const [content, setContent] = useState("");

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            const res = await fetch("/api/programs");
            const data = await res.json();
            setPrograms(data);
        } catch (error) {
            console.error("Failed to fetch programs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/programs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, type, content }),
            });

            if (res.ok) {
                setIsCreating(false);
                resetForm();
                fetchPrograms();
            }
        } catch (error) {
            console.error("Failed to create program", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Weet je zeker dat je dit programma wilt verwijderen?")) return;
        try {
            await fetch(`/api/programs?id=${id}`, { method: "DELETE" });
            fetchPrograms();
        } catch (error) {
            console.error("Failed to delete program", error);
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setType("TRAINING");
        setContent("");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Programma's & Schema's</h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Nieuw Programma</span>
                </button>
            </div>

            {isCreating && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Nieuw Programma Maken</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border-gray-300 rounded-lg p-2"
                                    placeholder="Bijv. Krachttraining Beginners"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="w-full border-gray-300 rounded-lg p-2"
                                >
                                    <option value="TRAINING">Training</option>
                                    <option value="NUTRITION">Voeding</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving (Optioneel)</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full border-gray-300 rounded-lg p-2"
                                placeholder="Korte omschrijving..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Inhoud</label>
                            <textarea
                                required
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={10}
                                className="w-full border-gray-300 rounded-lg p-2 font-mono text-sm"
                                placeholder="Plak hier het schema of de inhoud..."
                            ></textarea>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Annuleren
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Opslaan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program) => (
                    <div key={program.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${program.type === 'TRAINING' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                {program.type === 'TRAINING' ? <Dumbbell size={24} /> : <Utensils size={24} />}
                            </div>
                            <button
                                onClick={() => handleDelete(program.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">{program.title}</h3>
                        {program.description && (
                            <p className="text-gray-500 text-sm mb-4">{program.description}</p>
                        )}

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 h-32 overflow-y-auto text-xs font-mono text-gray-600">
                            {program.content}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                            <span>{new Date(program.updatedAt).toLocaleDateString()}</span>
                            <span className="uppercase font-semibold tracking-wider">{program.type}</span>
                        </div>
                    </div>
                ))}

                {!loading && programs.length === 0 && !isCreating && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <FileText className="mx-auto mb-3 opacity-50" size={48} />
                        <p>Nog geen programma's aangemaakt.</p>
                        <button onClick={() => setIsCreating(true)} className="text-blue-600 font-medium mt-2 hover:underline">
                            Maak er nu een aan
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
