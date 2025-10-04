-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Overdracht" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auteur" TEXT NOT NULL,
    "bericht" TEXT NOT NULL,
    "datumISO" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tijd" TEXT NOT NULL,
    "belangrijk" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Overdracht" ("auteur", "bericht", "datumISO", "id", "tijd") SELECT "auteur", "bericht", "datumISO", "id", "tijd" FROM "Overdracht";
DROP TABLE "Overdracht";
ALTER TABLE "new_Overdracht" RENAME TO "Overdracht";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
