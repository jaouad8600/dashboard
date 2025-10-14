'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href:'/dashboard',      label:'Dashboard' },
  { href:'/groepen',        label:'Groepen' },
  { href:'/sportmomenten',  label:'Sportmomenten' },
  { href:'/kalender',       label:'Kalender' },
  { href:'/mutaties',       label:'Sportmutaties' },
  { href:'/indicaties',     label:'Indicaties' },
  { href:'/inventaris',     label:'Inventaris' },
];

export default function Sidebar(){
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r bg-gray-900 text-white">
      <div className="p-4 text-lg font-semibold">Menu</div>
      <nav className="px-2 pb-4 space-y-1">
        {items.map(it=>{
          const active = path === it.href;
          return (
            <Link key={it.href} href={it.href}
              className={`block px-3 py-2 rounded ${active ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
