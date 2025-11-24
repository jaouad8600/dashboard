'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

// Map routes to Dutch labels
const routeLabels: Record<string, string> = {
    '': 'Dashboard',
    'groepen': 'Groepen',
    'rapportages': 'Rapportages',
    'sportmutaties': 'Sportmutaties',
    'sportindicaties': 'Sportindicaties',
    'incidenten': 'Incidenten',
    'materialen': 'Materialen',
    'documenten': 'Documenten',
    'programmas': "Programma's",
    'kalender': 'Kalender',
    'sportmomenten': 'Dagplanning',
    'extra-sport': 'Extra Sport',
    'input': 'Snelle Invoer',
    'admin': 'Beheer',
    'audit': 'Audit Log',
    'instellingen': 'Instellingen',
    'dagrapport': 'Dagrapport',
};

export default function Breadcrumbs() {
    const pathname = usePathname();

    // Split path and filter empty strings
    const segments = pathname.split('/').filter(Boolean);

    // Don't show breadcrumbs on home page
    if (segments.length === 0) {
        return null;
    }

    // Build breadcrumb items
    const breadcrumbs = segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        const label = routeLabels[segment] || segment;
        const isLast = index === segments.length - 1;

        return {
            label,
            path,
            isLast,
        };
    });

    return (
        <nav className="flex items-center space-x-2 text-sm mb-6 px-1">
            {/* Home link */}
            <Link
                href="/"
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors group"
            >
                <Home size={16} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Home</span>
            </Link>

            {/* Breadcrumb items */}
            {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center space-x-2">
                    <ChevronRight size={16} className="text-gray-400" />
                    {crumb.isLast ? (
                        <span className="font-semibold text-gray-900 px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                            {crumb.label}
                        </span>
                    ) : (
                        <Link
                            href={crumb.path}
                            className="text-gray-500 hover:text-gray-900 transition-colors font-medium hover:underline px-2 py-1 rounded-lg hover:bg-gray-50"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}
