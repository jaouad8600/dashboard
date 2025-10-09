"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/groepen", label: "Groepen" },
  { href: "/mutaties", label: "Mutaties" },
  { href: "/overdrachten", label: "Overdrachten" },
  { href: "/kalender", label: "Kalender" },
  { href: "/inventaris", label: "Inventaris" },
  { href: "/indicaties", label: "Indicaties" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-white">
      <div className="p-4 flex items-center gap-3 border-b">
        <Image src="/teylingereind-logo.svg" width={32} height={32} alt="Teylingereind" />
        <div>
          <div className="font-semibold">Sport & Activiteiten</div>
          <div className="text-xs text-zinc-500 -mt-0.5">Teylingereind</div>
        </div>
      </div>
      <nav className="p-2 space-y-1">
        {NAV.map(item => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium
                ${active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "text-zinc-700 hover:bg-zinc-50"}
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-3 text-xs text-zinc-400 border-t">v0.1 demo</div>
    </aside>
  );
}
