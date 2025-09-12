"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/groepen", label: "Groepen" },
  { href: "/extra-sport", label: "Extra sport" },
];

export default function Sidebar(){
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <div className="mb-6">
        <div className="text-sm opacity-70">Teylingereind</div>
        <div className="font-bold">Sport & Activiteiten</div>
      </div>
      <nav className="space-y-1">
        {NAV.map(i=>{
          const active = pathname === i.href;
          return (
            <Link key={i.href} href={i.href}
              className={`block px-3 py-2 rounded-lg text-sm ${active ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}>
              {i.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
