"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile topbar */}
      <header className="sticky top-0 z-40 border-b bg-white md:hidden">
        <div className="flex items-center justify-between p-3">
          <button aria-label="Menu" onClick={()=>setOpen(v=>!v)} className="btn px-2 py-1">☰</button>
          <div className="flex items-center gap-2">
            <Image src="/teylingereind-logo.svg" width={24} height={24} alt="Teylingereind"/>
            <div className="font-semibold text-sm">Sport & Activiteiten · Teylingereind</div>
          </div>
          <div className="w-8" />
        </div>
      </header>

      <div className="md:flex">
        {/* Sidebar */}
        <div className={`md:block ${open ? "block" : "hidden"}`}>
          <Sidebar />
        </div>

        {/* Main */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
