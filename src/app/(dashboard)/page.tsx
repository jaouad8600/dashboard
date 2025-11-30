'use client';

import React from 'react';
import StatsOverview from '@/components/dashboard/StatsOverview';
import TodaySchedule from '@/components/dashboard/TodaySchedule';

import RestorativeTalksList from '@/components/dashboard/RestorativeTalksList';
import ExtraSportPriorityWidget from '@/components/dashboard/ExtraSportPriorityWidget';

import RedGroupsWidget from '@/components/dashboard/RedGroupsWidget';

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Stats Overview Cards */}
      <StatsOverview />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Today's Schedule */}
        <div className="h-full">
          <TodaySchedule />
        </div>

        {/* Restorative Talks */}
        <div className="h-full">
          <RestorativeTalksList />
        </div>

        {/* Extra Sport Priority */}
        <div className="h-full">
          <ExtraSportPriorityWidget />
        </div>

        {/* Red Groups */}
        <div className="h-full">
          <RedGroupsWidget />
        </div>
      </div>
    </div>
  );
}


