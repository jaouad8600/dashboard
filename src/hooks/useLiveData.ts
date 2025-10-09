"use client";
import { useEffect, useState } from "react";

export function useLiveData<T>(url: string, intervalMs = 30000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(res.statusText);
      setData(await res.json());
    } catch (e) {
      console.error("LiveData error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const h = setInterval(fetchData, intervalMs);
    return () => clearInterval(h);
  }, [url, intervalMs]);

  return { data, loading };
}
