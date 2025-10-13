'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Groepen', href: '/groepen' },
  { label: 'Sportmomenten', href: '/sportmomenten' },
  { label: 'Kalender', href: '/kalender' },
  { label: 'Mutaties', href: '/mutaties' },
  { label: 'Indicaties', href: '/indicaties' },
  { label: 'Inventaris', href: '/inventaris' },
];

export default function Sidebar(){
  const pathname = usePathname();
  return (
    <aside className="w-64 border-r bg-white h-full">
      <div className="p-4 text-lg font-semibold">Menu</div>
      <nav className="px-2 pb-6 space-y-1">
        {links.map(l=>{
          const active = pathname?.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={"block px-3 py-2 rounded-xl " + (active ? "bg-gray-900 text-white" : "hover:bg-gray-100")}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
