export type Group = {
  id: string;
  naam: string;
  kleur?: string;
  status?: "open" | "gesloten" | "pauze";
  soort?: string; // bv. 'fitness', 'verbod', 'anders'
};

export type SportItem = {
  id: string;
  title: string;
  start: string; // ISO
  end: string; // ISO
  groupId?: string;
  status?: "open" | "gesloten" | "pauze";
  type?: string; // bv. 'fitness', 'training', ...
  notes?: string[];
};

export type Database = {
  groepen: Group[];
  planning: {
    items: SportItem[];
  };
};
