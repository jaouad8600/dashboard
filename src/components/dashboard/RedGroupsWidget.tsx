import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useGroups } from '@/hooks/useSportData';
import Link from 'next/link';

export default function RedGroupsWidget() {
    const { data: groups, isLoading } = useGroups();

    if (isLoading) return <Skeleton />;

    // Filter groups with status 'ROOD' (Red)
    const redGroups = groups?.filter((g: any) => g.color === 'ROOD') || [];

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden h-full">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-red-50/50 dark:bg-red-900/20">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
                    <h2 className="font-bold text-gray-800 dark:text-gray-200">Rode Groepen</h2>
                </div>
                <Link href="/groepen" className="text-xs font-medium text-red-700 dark:text-red-400 hover:underline">
                    Bekijk alles
                </Link>
            </div>

            <div className="p-4 space-y-3">
                {redGroups.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
                        Geen groepen met status Rood.
                    </div>
                ) : (
                    redGroups.map((group: any) => (
                        <div key={group.id || group.name} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{group.name}</span>
                            <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                ROOD
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 h-64 animate-pulse" />
    );
}
