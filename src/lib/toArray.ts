export function toArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x as T[];
  if (x && Array.isArray((x as any).data)) return (x as any).data as T[];
  if (x && typeof x === "object" && Array.isArray((x as any).items)) return (x as any).items as T[];
  return [];
}
