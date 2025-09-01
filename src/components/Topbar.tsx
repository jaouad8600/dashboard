"use client";
import { Search } from "lucide-react";
export default function Topbar(){
  return (
    <header className="h-14 border-b bg-white/95 backdrop-blur flex items-center gap-3 px-3 sticky top-0 z-40">
      <div className="flex items-center gap-2 text-sm text-zinc-600 border rounded-xl px-2 py-1">
        <Search size={16} className="text-brand-600" />
        <input className="outline-none text-sm placeholder:text-zinc-400" placeholder="Zoeken…" />
      </div>
      <div className="ml-auto text-sm opacity-80">Ingelogd als <b>Sport & Activiteiten</b></div>
    </header>
  );
}
