"use client";
import { useEffect, useMemo } from "react";

export type Status = "all" | "open" | "in-behandeling" | "afgerond";

export default function TableFilters({
  q, onQ, status, onStatus, placeholder = "Zoek…"
}: {
  q: string; onQ: (v:string)=>void;
  status: Status; onStatus: (s:Status)=>void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
      <input
        value={q}
        onChange={e=>onQ(e.target.value)}
        placeholder={placeholder}
        className="w-full sm:w-72 rounded-md border px-3 py-2 text-sm"
      />
      <select
        value={status}
        onChange={e=>onStatus(e.target.value as Status)}
        className="w-full sm:w-56 rounded-md border px-3 py-2 text-sm"
      >
        <option value="all">Alle statussen</option>
        <option value="open">Open</option>
        <option value="in-behandeling">In behandeling</option>
        <option value="afgerond">Afgerond</option>
      </select>
    </div>
  );
}
