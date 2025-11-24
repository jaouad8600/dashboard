export type Indicatie = {
  id: string;
  naam: string;
  type?: string;
  status: "open" | "in-behandeling" | "afgerond";
  start?: string;
  eind?: string;
  opmerking?: string;
  inhoud?: string;
  createdAt: string;
};

export type Mutatie = {
  id: string;
  datum: string; // ISO
  titel: string;
  omschrijving?: string;
  status: "open" | "in-behandeling" | "afgerond";
  createdAt: string;
};

export type Kleur = "GREEN" | "YELLOW" | "ORANGE" | "RED";
export type GroepNotitie = {
  id: string;
  tekst: string;
  auteur?: string;
  createdAt: string;
};
export type Groep = {
  id: string;
  naam: string;
  kleur: Kleur;
  notities: GroepNotitie[];
};

export type DB = {
  indicaties: Indicatie[];
  mutaties: Mutatie[];
  groepen: { list: Groep[] };
};
