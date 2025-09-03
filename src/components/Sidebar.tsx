"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/kalender", label: "Kalender" },
  { href: "/planner", label: "Planner" },
  { href: "/groepen", label: "Groepen" },
  { href: "/sportmutaties", label: "Sportmutaties" },
  { href: "/indicatie-sport", label: "Indicatie sport" },
  { href: "/overdrachten", label: "Overdrachten" },
  { href: "/back-up", label: "Back-up" },
  { href: "/diagnose", label: "Diagnose" },
  , { label: "SharePoint", href: "/sharepoint" }
];

    <a href="/sharepoint" className="block px-3 py-2 rounded-lg hover:bg-zinc-50">SharePoint</a>
export default function Sidebar(){
  const path = usePathname();
  return (
    <aside className="w-64 border-r bg-white min-h-screen">
      <div className="p-4 border-b">
        <div className="text-sm opacity-70">Teylingereind</div>
        <div className="font-bold">Sport & Activiteiten</div>
      </div>
      <nav className="p-2 grid gap-1">
        {links.map(l=>{
          const active = path === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded-xl text-sm ${active ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50"}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
