"use client";
import { useSyncExternalStore } from "react";

type Subscribable<S> = {
  subscribe: (fn: () => void) => () => void;
  get: () => S;
};

export function useLive<S>(store: Subscribable<S>) {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
