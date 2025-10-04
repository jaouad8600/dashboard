"use client";
export default function Loading() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-24 rounded-3xl bg-gradient-to-r from-indigo-200 via-indigo-100 to-emerald-100" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({length:6}).map((_,i)=>(
          <div key={i} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="h-2 w-20 bg-zinc-200 rounded mb-3" />
            <div className="h-6 bg-zinc-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
