"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type DagGroup = {
  name?: string;
  timeouts?: string[];
  incidenten?: string[];
  sancties?: string[];
};
type DagJson = {
  header?: { datum?: string; by?: string };
  groups?: DagGroup[];
};
type HistItem = {
  id: string;
  dateISO: string;
  by?: string;
  raw?: string;
  savedAt: string;
  json?: DagJson;
};

function safeParse<T>(v: string | null, fallback: T): T {
  try {
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}

export default function OverdrachtTile({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [hist, setHist] = useState<HistItem[]>([]);
  const [now, setNow] = useState<Date>(new Date());

  // Poll heel licht voor live updates wanneer er ergens anders gesaved wordt
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const items = safeParse<HistItem[]>(
      localStorage.getItem("overdracht-history-v1"),
      [],
    );
    // normaliseer savedAt / by fallback
    items.forEach((i) => {
      if (!i.savedAt) (i as any).savedAt = new Date().toISOString();
      if (!i.by && i.json?.header?.by) i.by = i.json.header.by;
    });
    // sort newest first
    items.sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );
    setHist(items);
  }, [now]);

  const iso = todayISO();

  const { latestToday, latestOverall, list } = useMemo(() => {
    const latestToday = hist.find((h) => h.dateISO === iso) || null;
    const latestOverall = hist[0] || null;
    const list = hist.slice(0, 8);
    return { latestToday, latestOverall, list };
  }, [hist, iso]);

  function counters(item: HistItem | null) {
    if (!item?.json?.groups) return { t: 0, i: 0, s: 0 };
    const t = sum(item.json.groups.map((g) => g.timeouts?.length || 0));
    const i = sum(item.json.groups.map((g) => g.incidenten?.length || 0));
    const s = sum(item.json.groups.map((g) => g.sancties?.length || 0));
    return { t, i, s };
  }

  const hero = (latestToday || latestOverall) ?? null;
  const cnt = counters(hero);

  return (
    <div
      className="od-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 4px 16px rgba(2,6,23,.06)",
        minWidth: compact ? 280 : 360,
        maxWidth: 560,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Overdrachten
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            Laatste van {latestToday ? "vandaag" : "recent"}
          </div>
        </div>
        <Link
          href="/overdrachten"
          style={{ fontSize: 12, color: "#2563eb", textDecoration: "none" }}
        >
          Openen →
        </Link>
      </div>

      {hero ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 10,
            alignItems: "start",
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "#334155" }}>
              {hero.dateISO} •{" "}
              {new Date(hero.savedAt).toLocaleTimeString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div style={{ fontSize: 13, color: "#475569" }}>
              Door: <b>{hero.by || "Onbekend"}</b>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span
              className="chip"
              style={{ background: "#fee2e2", color: "#991b1b" }}
              title="Timeouts"
            >
              T {cnt.t}
            </span>
            <span
              className="chip"
              style={{ background: "#fef3c7", color: "#92400e" }}
              title="Incidenten"
            >
              I {cnt.i}
            </span>
            <span
              className="chip"
              style={{ background: "#dbeafe", color: "#1e40af" }}
              title="Sancties"
            >
              S {cnt.s}
            </span>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "#475569" }}>
          Nog geen overdrachten gevonden.
        </div>
      )}

      {/* Lijst nieuwste -> oudste */}
      <div style={{ marginTop: 2 }}>
        <div
          style={{
            fontSize: 12,
            color: "#64748b",
            marginBottom: 6,
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          Historie
        </div>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {list.map((it) => {
            const c = counters(it);
            return (
              <li
                key={it.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}
                  >
                    {it.dateISO}
                  </span>
                  <span style={{ fontSize: 12, color: "#475569" }}>
                    {new Date(it.savedAt).toLocaleString("nl-NL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    • {it.by || "Onbekend"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    className="chip"
                    style={{ background: "#fee2e2", color: "#991b1b" }}
                  >
                    T {c.t}
                  </span>
                  <span
                    className="chip"
                    style={{ background: "#fef3c7", color: "#92400e" }}
                  >
                    I {c.i}
                  </span>
                  <span
                    className="chip"
                    style={{ background: "#dbeafe", color: "#1e40af" }}
                  >
                    S {c.s}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
