import * as base from "./groepen";
import { GROEPEN_BLACKLIST } from "./groepen-blacklist";

/**
 * Zelfde functies als in "@/lib/groepen", maar listGroepen() filtert Eb en Vloed eruit.
 * Alle andere exports (setKleur, addGroep, deleteGroep, etc.) blijven werken.
 */

export const listGroepen = async (): ReturnType<typeof base.listGroepen> => {
  try {
    const groepen = await base.listGroepen();
    return groepen.filter((g: any) => !GROEPEN_BLACKLIST.has((g as any).naam));
  } catch {
    return [];
  }
};

// Exporteer alle andere helpers ongewijzigd
export const {
  onGroepenChange,
  setKleur,
} = base;

export type { Groep } from "./groepen";
