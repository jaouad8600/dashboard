"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-open");
    if (saved !== null) setOpen(saved === "1");
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    localStorage.setItem("sidebar-open", next ? "1" : "0");
  };

  return (
    <aside
      className={`h-screen border-r transition-all ${open ? "w-64" : "w-16"} sticky top-0`}
    >
      <div className="p-2 flex items-center justify-between">
        <span
          className={`font-semibold ${open ? "opacity-100" : "opacity-0"} transition-opacity`}
        >
          Menu
        </span>
        <button
          aria-label="Toggle sidebar"
          onClick={toggle}
          className="w-8 h-8 rounded hover:bg-gray-100 btn"
          title={open ? "Inklappen" : "Uitklappen"}
        >
          {open ? "«" : "»"}
        </button>
      </div>

      <nav className="mt-2 space-y-1">
        <Link
          className="block px-3 py-2 hover:bg-gray-100 rounded"
          href="/dashboard"
          title="Dashboard"
        >
          {open ? "Dashboard" : "D"}
        </Link>
        <Link
          className="block px-3 py-2 hover:bg-gray-100 rounded"
          href="/groepen"
          title="Groepen"
        >
          {open ? "Groepen" : "G"}
        </Link>
        <Link className="btn-ghost" href="/extra-sportmomenten">
          Extra sportmomenten
        </Link>
        <Link
          className="block px-3 py-2 hover:bg-gray-100 rounded"
          href="/kalender"
          title="Kalender"
        >
          {open ? "Kalender" : "K"}
        </Link>
        <Link
          className="block px-3 py-2 hover:bg-gray-100 rounded"
          href="/mutaties"
          title="Mutaties"
        >
          {open ? "Mutaties" : "M"}
        </Link>
      </nav>
    </aside>
  );
}
