export type Overdracht = {
  id: string;
  datumISO: string;
  tijd?: string;
  auteur?: string;
  bericht: string;
  belangrijk?: boolean;
};

async function fx<T>(url: string, init?: RequestInit, fallback: T): Promise<T> {
  try {
    const r = await fetch(url, { cache: "no-store", ...init });
    if (!r.ok) return fallback;
    return (await r.json()) as T;
  } catch {
    return fallback;
  }
}

export async function listOverdrachten(): Promise<Overdracht[]> {
  return fx<Overdracht[]>("/api/overdrachten", undefined, []);
}

export async function addOverdracht(input: Partial<Overdracht>) {
  return fx<Overdracht>("/api/overdrachten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }, null as any);
}

export async function patchOverdracht(id: string, data: Partial<Overdracht>) {
  return fx<Overdracht>(`/api/overdrachten/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }, null as any);
}

export async function deleteOverdracht(id: string) {
  return fx<{ ok: true }>(`/api/overdrachten/${id}`, { method: "DELETE" }, { ok: true } as any);
}
