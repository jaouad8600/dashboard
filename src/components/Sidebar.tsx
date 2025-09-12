"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/kalender", label: "Kalender" },
  { href: "/planner", label: "Planner" },
  { href: "/groepen", label: "Groepen" },
  { href: "/sportmutaties", label: "Sportmutaties" },
  { href: "/indicatie-sport", label: "Indicatie sport" },
  { href: "/overdrachten", label: "Overdrachten" },
  { href: "/materialen", label: "Materialen" },
  { href: "/diagnose", label: "Diagnose" },
  { href: "/sharepoint", label: "SharePoint" },
];

export default function Sidebar(){
  const path = usePathname();
  return (
    <aside className="w-64 h-screen bg-white shadow-md p-4 flex flex-col">
      <h1 className="text-xl font-bold mb-6">Teylingereind</h1>
      <nav className="flex-1 space-y-1">
        {NAV.map(({href,label})=>{
          const active = path === href;
          return (
            <Link key={href} href={href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
