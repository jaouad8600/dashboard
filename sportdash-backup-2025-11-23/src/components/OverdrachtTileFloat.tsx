"use client";
import { usePathname } from "next/navigation";
import OverdrachtTile from "./OverdrachtTile";
import { useEffect, useState } from "react";

export default function OverdrachtTileFloat({
  onlyOn = "/admin",
}: {
  onlyOn?: string;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  if (onlyOn && pathname !== onlyOn) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 40,
        maxWidth: 560,
      }}
    >
      <OverdrachtTile compact />
    </div>
  );
}
