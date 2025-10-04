/*
  Warnings:

  - You are about to drop the column `by` on the `Event` table. All the data in the column will be lost.
  - Made the column `entityId` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "OverdrachtHistory_overdrachtId_idx";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ts" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "data" JSONB
);
INSERT INTO "new_Event" ("data", "entity", "entityId", "id", "kind", "ts") SELECT "data", "entity", "entityId", "id", "kind", "ts" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_ts_idx" ON "Event"("ts");
CREATE INDEX "Event_entity_entityId_idx" ON "Event"("entity", "entityId");
CREATE TABLE "new_Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "locatie" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Goed',
    "aantal" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Material" ("aantal", "createdAt", "id", "locatie", "name", "note", "status", "updatedAt") SELECT "aantal", "createdAt", "id", "locatie", "name", "note", "status", "updatedAt" FROM "Material";
DROP TABLE "Material";
ALTER TABLE "new_Material" RENAME TO "Material";
CREATE INDEX "Material_locatie_idx" ON "Material"("locatie");
CREATE INDEX "Material_status_idx" ON "Material"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Mutatie_active_ts_idx" ON "Mutatie"("active", "ts");

-- CreateIndex
CREATE INDEX "Mutatie_group_idx" ON "Mutatie"("group");
