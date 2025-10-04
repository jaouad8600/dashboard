type Listener = () => void;

export type LiveStore<S> = {
  key: string;
  get: () => S;
  set: (next: S | ((prev: S) => S)) => void;
  subscribe: (fn: Listener) => () => void;
};

export function createLiveStore<S>(key: string, initial: S): LiveStore<S> {
  let state: S = initial;
  const listeners = new Set<Listener>();
  const bc = typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel(`store:${key}`)
    : null;

  const persist = () => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(key);
      if (raw) state = JSON.parse(raw) as S;
    } catch {}

    window.addEventListener("storage", (e) => {
      if (e.key === key && e.newValue) {
        try { state = JSON.parse(e.newValue) as S; } catch { return; }
        listeners.forEach((l) => l());
      }
    });

    if (bc) {
      bc.onmessage = (ev) => {
        if (ev.data?.type === "set" && ev.data.key === key) {
          state = ev.data.value as S;
          persist();
          listeners.forEach((l) => l());
        }
      };
    }
  }

  return {
    key,
    get: () => state,
    set: (next) => {
      state = typeof next === "function" ? (next as (prev:S)=>S)(state) : next;
      if (typeof window !== "undefined") persist();
      if (bc) bc.postMessage({ type: "set", key, value: state });
      listeners.forEach((l) => l());
    },
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
  };
}
