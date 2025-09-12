"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const ROLES = ["Sportdocent","GL","Coördinator","TL","AV","Gast"];

export default function Topbar() {
  const [role, setRole] = useState("Sportdocent");

  useEffect(() => {
    const stored = localStorage.getItem("role");
    if (stored) setRole(stored);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setRole(newRole);
    localStorage.setItem("role", newRole);
  };

  return (
    <header className="w-full h-14 bg-white shadow flex items-center justify-between px-4">
      <div className="flex items-center gap-2 text-gray-600">
        <Search className="w-4 h-4" />
        <input
          type="text"
          placeholder="Zoeken..."
          className="outline-none text-sm"
        />
      </div>
      <select
        value={role}
        onChange={handleChange}
        className="border rounded px-2 py-1 text-sm"
      >
        {ROLES.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </header>
  );
}
