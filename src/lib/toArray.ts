export function toArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x as T[];
  if (x && Array.isArray((x as any).list)) return (x as any).list as T[];
  if (x && Array.isArray((x as any).data)) return (x as any).data as T[];
  if (x && typeof x === "object") {
    for (const k of Object.keys(x)) {
      const v = (x as any)[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}
