export function toArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    // Meest voorkomende vormen: {items:[]}, {data:[]}, {groepen:[]}, record-object
    if (Array.isArray((data as any).items))   return (data as any).items as T[];
    if (Array.isArray((data as any).data))    return (data as any).data as T[];
    if (Array.isArray((data as any).groepen)) return (data as any).groepen as T[];
    const values = Object.values(data);
    // Als object eruitziet als record van id -> item
    if (values.length && values.every(v => typeof v === "object" && v !== null)) {
      return values as T[];
    }
  }
  return [];
}
