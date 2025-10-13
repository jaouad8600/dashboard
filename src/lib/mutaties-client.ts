export type MutatieStatus = "Open" | "In behandeling" | "Afgerond";
export type MutatieActie = "Toegevoegd" | "Bewerkt" | "Verwijderd" | "Status";
export type Severity = "laag" | "normaal" | "hoog";
export type Mutatie = {
  id: string;
  datum: string;
  medewerker: string;
  locatie?: string;
  actie: MutatieActie;
  beschrijving: string;
  status: MutatieStatus;
  severity?: Severity;
};

async function toJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function listMutaties(): Promise<Mutatie[]> {
  const res = await fetch("/api/mutaties", { cache: "no-store" });
  try {
    return await toJson<Mutatie[]>(res);
  } catch {
    return [];
  }
}
export async function createMutatie(input: {
  medewerker: string;
  beschrijving: string;
  locatie?: string;
  status?: MutatieStatus;
  severity?: Severity;
  datum?: string;
}): Promise<Mutatie> {
  const res = await fetch("/api/mutaties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return toJson<Mutatie>(res);
}
export async function updateMutatie(
  id: string,
  patch: Partial<Mutatie>,
): Promise<Mutatie> {
  const res = await fetch(`/api/mutaties/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return toJson<Mutatie>(res);
}
export async function deleteMutatie(id: string): Promise<{ ok: true }> {
  const res = await fetch(`/api/mutaties/${id}`, { method: "DELETE" });
  return toJson<{ ok: true }>(res);
}
