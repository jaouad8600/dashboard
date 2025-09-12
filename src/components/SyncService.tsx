"use client";
import { useEffect } from "react";

export default function SyncService(){
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      window.dispatchEvent(new CustomEvent("sportdash-sync", { detail: { key: e.key } }));
    };
    window.addEventListener("storage", onStorage);

    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel("sportdash-sync");
      bc.onmessage = (msg) => window.dispatchEvent(new CustomEvent("sportdash-sync", { detail: msg?.data || { key: "*" } }));
    }

    // Heartbeat zorgt dat schermen zichzelf af en toe her-evalueren
    const iv = setInterval(() => {
      window.dispatchEvent(new CustomEvent("sportdash-sync", { detail: { key: "*" } }));
    }, 10000);

    return () => { window.removeEventListener("storage", onStorage); bc?.close(); clearInterval(iv); };
  }, []);
  return null;
}
