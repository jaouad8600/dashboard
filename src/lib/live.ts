"use client";
import { useState, useEffect } from "react";

export function broadcast(channel: string, data?: any) {
  try {
    new BroadcastChannel(channel).postMessage(data ?? Date.now());
  } catch { }
}
export function onBroadcast(channel: string, cb: () => void) {
  try {
    const bc = new BroadcastChannel(channel);
    bc.onmessage = () => cb();
    return () => {
      try {
        bc.close();
      } catch { }
    };
  } catch {
    return () => { };
  }
}

export function createLiveStore<T>(channel: string, initialValue: T) {
  let value = initialValue;
  const listeners = new Set<() => void>();

  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(channel);
    bc.onmessage = (ev) => {
      value = ev.data;
      listeners.forEach((l) => l());
    };
  } catch { }

  return {
    get: () => value,
    set: (valOrFn: T | ((prev: T) => T)) => {
      const newValue = typeof valOrFn === 'function' ? (valOrFn as any)(value) : valOrFn;
      value = newValue;
      if (bc) bc.postMessage(newValue);
      listeners.forEach((l) => l());
    },
    subscribe: (cb: () => void) => {
      listeners.add(cb);
      return () => { listeners.delete(cb); };
    },
  };
}

export function useLiveObject<T>(channel: string, initialValue: T): [T, (val: T) => void] {
  const [val, setVal] = useState<T>(initialValue);

  useEffect(() => {
    const bc = new BroadcastChannel(channel);
    bc.onmessage = (ev) => {
      if (ev.data) setVal(ev.data);
    };
    return () => bc.close();
  }, [channel]);

  const update = (newVal: T) => {
    setVal(newVal);
    const bc = new BroadcastChannel(channel);
    bc.postMessage(newVal);
    bc.close();
  };

  return [val, update];
}
