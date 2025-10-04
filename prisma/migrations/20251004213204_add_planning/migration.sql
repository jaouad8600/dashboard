-- CreateTable
CREATE TABLE "Planning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titel" TEXT NOT NULL,
    "locatie" TEXT NOT NULL,
    "start" DATETIME NOT NULL,
    "eind" DATETIME NOT NULL,
    "notitie" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
