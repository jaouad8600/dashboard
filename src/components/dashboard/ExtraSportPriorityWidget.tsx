
'use client';

import React from 'react';
import { Trophy, TrendingUp, AlertCircle } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import Link from 'next/link';

export default function ExtraSportPriorityWidget({
    externalData,
    showAll = false,
    splitView = false
}: {
    externalData?: any[],
    showAll?: boolean,
    splitView?: boolean
}) {
    const { data: stats, isLoading } = useDashboardStats();

    // If externalData is provided, use it directly. Otherwise use the fetched stats.
    // When externalData is provided, we are not loading.
    const allGroups = (externalData || stats?.extraSportPriority || []);

    // Filter logic
    const priorityGroups = showAll ? allGroups : allGroups.slice(0, 3);

    const renderGroupList = (groups: any[]) => {
        if (groups.length === 0) {
            return (
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
                    Geen data beschikbaar.
                </div>
            );
        }
        return groups.map((group: any, index: number) => (
            <div key={group.id} className="flex items-center gap-4">
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        index === 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' :
                            'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}
                `}>
                    {index + 1}
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{group.name}</span>
                        {/* Score removed to reduce confusion */}
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={`h-full rounded-full ${group.score > 80 ? 'bg-green-500' :
                                group.score > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${Math.max(group.score, 10)}%` }}
                        />
                    </div>
                    {/* Detailed stats removed to simplify UI */}
                </div>
            </div>
        ));
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden h-full">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-green-50/50 dark:bg-green-900/20">
                <div className="flex items-center gap-2">
                    <Trophy className="text-green-600 dark:text-green-400" size={20} />
                    <h2 className="font-bold text-gray-800 dark:text-gray-200">Extra Sport Prioriteit</h2>
                </div>
                {!showAll && (
                    <Link href="/extra-sportmomenten" className="text-xs font-medium text-green-700 dark:text-green-400 hover:underline">
                        Bekijk alles
                    </Link>
                )}
            </div>

            <div className="p-4">
                {splitView ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">Vloed</h3>
                            <div className="space-y-4">
                                {renderGroupList(priorityGroups.filter((g: any) => {
                                    const dept = (g.department || '').toUpperCase();
                                    const name = (g.name || '');
                                    return dept === 'VLOED' ||
                                        ['Bron', 'Dijk', 'Duin', 'Kade', 'Kreek', 'Lei', 'Rak', 'Zift'].some(n => name.includes(n));
                                }))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">Eb</h3>
                            <div className="space-y-4">
                                {renderGroupList(priorityGroups.filter((g: any) => {
                                    const dept = (g.department || '').toUpperCase();
                                    const name = (g.name || '');
                                    return dept === 'EB' ||
                                        ['Lier', 'Nes', 'Golf', 'Gaag', 'Kust', 'Vliet', 'Zijl', 'Poel A', 'Poel B'].some(n => name.includes(n));
                                }))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {renderGroupList(priorityGroups)}
                    </div>
                )}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
                <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                <p>Prioriteit wordt berekend op basis van gemiste kansen en aantal extra momenten in de afgelopen 30 dagen.</p>
            </div>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 h-64 animate-pulse" />
    );
}
