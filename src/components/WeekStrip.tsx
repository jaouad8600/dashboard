"use client";

type Item = { name: string; total: number; eb: number; vloed: number };

export default function WeekStrip({ data }: { data: Item[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {data.map((d) => {
        const total = d.total || 0;
        const ebPct = total ? Math.round((d.eb / total) * 100) : 0;
        const vloedPct = total ? 100 - ebPct : 0;
        return (
          <div key={d.name} className="border rounded-2xl p-3 bg-white grid gap-2">
            <div className="flex items-baseline justify-between">
              <div className="text-sm text-zinc-500 capitalize">{d.name}</div>
              <div className="text-xl font-bold text-brand-700">{d.total}</div>
            </div>

            {/* Stacked microbar Eb/Vloed (subtiel, geen library) */}
            <div className="h-2 w-full rounded-full overflow-hidden border flex" aria-label={`Verdeling Eb/Vloed voor ${d.name}`}>
              <div
                className="h-full"
                style={{ width: `${ebPct}%`, background: "#22c55e" }}  /* groen voor Eb */
                title={`Eb ${d.eb}`}
              />
              <div
                className="h-full"
                style={{ width: `${vloedPct}%`, background: "#3b82f6" }} /* blauw voor Vloed */
                title={`Vloed ${d.vloed}`}
              />
            </div>

            <div className="flex justify-between text-xs text-zinc-600">
              <span>Eb: {d.eb}</span>
              <span>Vloed: {d.vloed}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
