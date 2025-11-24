"use client";
import { useEffect, useState } from "react";

function formatToday(): string {
  const d = new Date();
  const weekday = new Intl.DateTimeFormat("nl-NL", { weekday: "long" }).format(
    d,
  );
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${weekday} ${dd}-${mm}`;
}

export default function TodayNL({ className }: { className?: string }) {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    setText(formatToday());
    const t = setInterval(() => setText(formatToday()), 60_000);
    return () => clearInterval(t);
  }, []);

  // suppressHydrationWarning voorkomt mismatch waarschuwing op eerste render
  return (
    <span suppressHydrationWarning className={className}>
      {text || "…"}
    </span>
  );
}
