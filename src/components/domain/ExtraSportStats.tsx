"use client";

import { useState, useEffect } from "react";
import { X, Trophy, Calendar, Clock } from "lucide-react";

interface ExtraSportStatsProps {
    groupId: string;
    groupName: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ExtraSportStats({ groupId, groupName, isOpen, onClose }: ExtraSportStatsProps) {
    const [stats, setStats] = useState<{ weekCount: number; monthCount: number; yearCount: number } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && groupId) {
            setLoading(true);
            fetch(`/api/extra-sport?groupId=${groupId}`)
                .then((res) => res.json())
                .then((data) => {
                    setStats(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [isOpen, groupId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-blue-50">
                    <h3 className="font-bold text-lg text-blue-900">Statistieken: {groupName}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Laden...</div>
                    ) : stats ? (
                        <div className="space-y-4">
                            <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-100">
                                <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Deze Week</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.weekCount} keer</p>
                                </div>
                            </div>

                            <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Deze Maand</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.monthCount} keer</p>
                                </div>
                            </div>

                            <div className="flex items-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="p-3 bg-purple-100 rounded-full text-purple-600 mr-4">
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Dit Jaar</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.yearCount} keer</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-red-500">Kon statistieken niet laden.</div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                    >
                        Sluiten
                    </button>
                </div>
            </div>
        </div>
    );
}
