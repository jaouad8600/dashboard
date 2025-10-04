-- CreateTable
CREATE TABLE "Overdracht" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "lastEditedAt" DATETIME,
    "lastEditedBy" TEXT
);

-- CreateTable
CREATE TABLE "OverdrachtHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "overdrachtId" TEXT NOT NULL,
    "ts" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "by" TEXT,
    "title" TEXT,
    "body" TEXT NOT NULL,
    CONSTRAINT "OverdrachtHistory_overdrachtId_fkey" FOREIGN KEY ("overdrachtId") REFERENCES "Overdracht" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "locatie" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "aantal" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Mutatie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "group" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "dienst" TEXT,
    "type" TEXT NOT NULL,
    "notitie" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "ts" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "by" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ts" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "by" TEXT,
    "data" JSONB
);

-- CreateIndex
CREATE INDEX "Overdracht_createdAt_idx" ON "Overdracht"("createdAt");

-- CreateIndex
CREATE INDEX "OverdrachtHistory_overdrachtId_idx" ON "OverdrachtHistory"("overdrachtId");

-- CreateIndex
CREATE INDEX "Event_ts_idx" ON "Event"("ts");

-- CreateIndex
CREATE INDEX "Event_entity_entityId_idx" ON "Event"("entity", "entityId");
