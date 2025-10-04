export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-24 rounded-3xl bg-gradient-to-r from-indigo-200 via-indigo-100 to-emerald-100" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map(i=>(
          <div key={i} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="h-3 w-16 bg-zinc-200 rounded" />
            <div className="mt-2 h-8 w-20 bg-zinc-200 rounded" />
            <div className="mt-2 h-2 bg-zinc-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
