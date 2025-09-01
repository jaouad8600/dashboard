"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/groepen", label: "Groepen" },
  { href: "/sportmutaties", label: "Sportmutaties" },     // naam aangepast
  { href: "/indicatie-sport", label: "Indicatie sport" }, // nieuwe pagina
  { href: "/overdrachten", label: "Overdrachten" },
  { href: "/back-up", label: "Back-up" },
  { href: "/diagnose", label: "Diagnose" },
];

export default function Sidebar(){
  const path = usePathname();
  return (
    <aside style={{width:256}} className="border-r bg-white min-h-screen">
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
