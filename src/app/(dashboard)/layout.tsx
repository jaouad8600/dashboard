"use client";
import ClientOnly from "@/components/ClientOnly";
import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  if (typeof window === "undefined") return null;
  return (
    <div className="h-dvh w-dvw flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-4"><ClientOnly>{children}</ClientOnly></main>
      </div>
    </div>
  );
}
