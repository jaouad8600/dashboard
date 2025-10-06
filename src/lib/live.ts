"use client";
export function broadcast(channel: string, data?: any) {
  try { new BroadcastChannel(channel).postMessage(data ?? Date.now()); } catch {}
}
export function onBroadcast(channel: string, cb: () => void) {
  try {
    const bc = new BroadcastChannel(channel);
    bc.onmessage = () => cb();
    return () => { try { bc.close(); } catch {} };
  } catch { return () => {}; }
}
