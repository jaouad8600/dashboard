async function j<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** G R O E P E N **/
export const apiGroepen = {
  list: () => fetch("/api/groepen").then(j),
  create: (data: { naam: string; kleur?: "GREEN"|"ORANGE"|"YELLOW"|"RED" }) =>
    fetch("/api/groepen", { method: "POST", body: JSON.stringify(data) }).then(j),
  patch: (id: string, data: any) =>
    fetch(`/api/groepen/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then(j),
  remove: (id: string) => fetch(`/api/groepen/${id}`, { method: "DELETE" }).then(j),
  notes: {
    list: (groepId: string) => fetch(`/api/groepen/${groepId}/notes`).then(j),
    add: (groepId: string, data: { tekst: string; auteur?: string }) =>
      fetch(`/api/groepen/${groepId}/notes`, { method: "POST", body: JSON.stringify(data) }).then(j),
  },
};

/** O V E R D R A C H T E N **/
export const apiOverdrachten = {
  list: () => fetch("/api/overdrachten").then(j),
  create: (data: { datumISO?: string; tijd?: string; auteur?: string; bericht: string; belangrijk?: boolean }) =>
    fetch("/api/overdrachten", { method: "POST", body: JSON.stringify(data) }).then(j),
  patch: (id: string, data: any) =>
    fetch(`/api/overdrachten/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then(j),
  remove: (id: string) => fetch(`/api/overdrachten/${id}`, { method: "DELETE" }).then(j),
};

/** M U T A T I E S **/
export const apiMutaties = {
  list: () => fetch("/api/mutaties").then(j),
  create: (data: any) => fetch("/api/mutaties", { method: "POST", body: JSON.stringify(data) }).then(j),
  patch: (id: string, data: any) => fetch(`/api/mutaties/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then(j),
  remove: (id: string) => fetch(`/api/mutaties/${id}`, { method: "DELETE" }).then(j),
};
