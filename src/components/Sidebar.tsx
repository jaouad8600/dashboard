'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const NAV = [
  { href: '/dashboard',     label: 'Dashboard' },
  { href: '/groepen',       label: 'Groepen' },
  { href: '/sportmomenten', label: 'Sportmomenten' },
  { href: '/kalender',      label: 'Kalender' },
  { href: '/indicaties',    label: 'Indicaties' },
  { href: '/inventaris',    label: 'Inventaris' },
  { href: '/mutaties',      label: 'Sportmutaties' },
];

export default function Sidebar(){
  const path = usePathname();
  return (
    <aside className="w-64 min-h-screen border-r bg-white">
      <div className="p-4 text-xl font-semibold">Menu</div>
      <nav className="px-3 pb-6 space-y-1">
        {NAV.map(i=>{
          const active = path===i.href;
          return (
            <Link
              key={i.href}
              href={i.href}
              className={
                'block px-3 py-2 rounded transition ' +
                (active
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-100 border')
              }
            >
              {i.label}
            </Link>
          );
        })}
        <a href="/backup" className="block px-3 py-2 hover:bg-gray-100 rounded">Back-up</a>
</nav>
    </aside>
  );
}
