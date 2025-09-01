"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, CalendarDays, ClipboardList, Users, FileText, PackageSearch,
  Settings, FolderOpenDot, StickyNote, ShieldAlert, BookOpen, UserSquare2
} from "lucide-react";
import { clsx } from "clsx";

const NAV = [
  { href: "/admin",            label: "Dashboard",        icon: Home },
  { href: "/calendar",         label: "Kalender",         icon: CalendarDays },
  { href: "/schedule",         label: "Schedule",         icon: ClipboardList },
  { href: "/groepen",          label: "Groepen",          icon: Users },
  { href: "/overdrachten",     label: "Overdrachten",     icon: FileText },
  { href: "/sportmutaties",    label: "Sportmutaties",    icon: ShieldAlert },
  { href: "/bezoek",           label: "Bezoek/Bibliotheek", icon: BookOpen },
  { href: "/indicatie-sport",  label: "Indicatie sport",  icon: UserSquare2 },
  { href: "/bestanden",        label: "Bestanden",        icon: FolderOpenDot },
  { href: "/logging",          label: "Logging",          icon: StickyNote },
  { href: "/middelen",         label: "Materialen",       icon: PackageSearch },
  { href: "/instellingen",     label: "Instellingen",     icon: Settings },
  { href: "/back-up",          label: "Back-up",          icon: FileText },
];

export default function Sidebar(){
  const path = usePathname();
  const W = "w-64";
  return (
    <aside className={`fixed left-0 top-0 ${W} h-screen border-r bg-white flex flex-col`}>
      <div className="px-4 py-3 font-bold text-brand-700">Sport & Activiteiten</div>
      <nav className="flex-1 px-2 pb-3 space-y-1 overflow-auto">
        {NAV.map(i=>{
          const Icon=i.icon, active=path.startsWith(i.href);
          return (
            <Link key={i.href} href={i.href}
              className={clsx("flex items-center gap-3 px-3 py-2 rounded-xl border",
                              active ? "active-nav" : "border-transparent hover:bg-zinc-50")}>
              <Icon size={18} className={active?"text-brand-700":"text-zinc-500"} />
              <span>{i.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 text-xs text-zinc-500">© Teylingereind</div>
    </aside>
  );
}
