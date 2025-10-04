-- CreateTable
CREATE TABLE "Groep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "naam" TEXT NOT NULL,
    "kleur" TEXT NOT NULL DEFAULT 'gray',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Notitie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tekst" TEXT NOT NULL,
    "auteur" TEXT,
    "datumISO" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groepId" TEXT NOT NULL,
    CONSTRAINT "Notitie_groepId_fkey" FOREIGN KEY ("groepId") REFERENCES "Groep" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Materiaal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "naam" TEXT NOT NULL,
    "aantal" INTEGER NOT NULL,
    "locatie" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Overdracht" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auteur" TEXT NOT NULL,
    "bericht" TEXT NOT NULL,
    "datumISO" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tijd" TEXT NOT NULL
);
