"use client";
import clsx from "clsx";
export default function Badge({
  children,
  color = "muted",
  className = "",
}: {
  children: React.ReactNode;
  color?: "green" | "indigo" | "muted";
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "badge",
        {
          "badge-green": color === "green",
          "badge-indigo": color === "indigo",
          "badge-muted": color === "muted",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
