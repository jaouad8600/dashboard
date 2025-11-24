"use client";
import { useEffect, useState } from "react";

type Props = {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
};

export default function TableFilter({
  placeholder = "Filter…",
  value = "",
  onChange,
  className = "",
}: Props) {
  const [q, setQ] = useState(value ?? "");
  useEffect(() => {
    setQ(value ?? "");
  }, [value]);
  return (
    <input
      value={q}
      onChange={(e) => {
        setQ(e.target.value);
        onChange?.(e.target.value);
      }}
      placeholder={placeholder}
      className={
        className || "w-64 max-w-full rounded-md border px-3 py-2 text-sm"
      }
    />
  );
}
