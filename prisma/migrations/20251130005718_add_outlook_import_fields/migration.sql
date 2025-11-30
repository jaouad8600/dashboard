/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SportIndication" ADD COLUMN "activities" TEXT;
ALTER TABLE "SportIndication" ADD COLUMN "advice" TEXT;
ALTER TABLE "SportIndication" ADD COLUMN "reasoning" TEXT;
ALTER TABLE "SportIndication" ADD COLUMN "receivedAt" DATETIME;
ALTER TABLE "SportIndication" ADD COLUMN "source" TEXT;
ALTER TABLE "SportIndication" ADD COLUMN "youthName" TEXT;

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channel" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "indicationId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT NOT NULL,
    "author" TEXT,
    "emailedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Evaluation_indicationId_fkey" FOREIGN KEY ("indicationId") REFERENCES "SportIndication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PhoneNumber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SESSION',
    "presentYouth" INTEGER NOT NULL DEFAULT 0,
    "mood" TEXT,
    "sessionSummary" TEXT,
    "interventions" TEXT,
    "incidents" TEXT,
    "injuries" TEXT,
    "planForTomorrow" TEXT,
    "youthCount" INTEGER NOT NULL DEFAULT 0,
    "leaderCount" INTEGER NOT NULL DEFAULT 0,
    "warmingUp" TEXT,
    "activity" TEXT,
    "rawText" TEXT,
    "cleanedText" TEXT,
    "parsedData" TEXT,
    "parsedAt" DATETIME,
    "parsedBy" TEXT,
    "confidenceScore" REAL,
    "author" TEXT,
    "authorId" TEXT,
    "isIncident" BOOLEAN NOT NULL DEFAULT false,
    "indicationId" TEXT,
    "restrictionId" TEXT,
    "youthId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Report_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_indicationId_fkey" FOREIGN KEY ("indicationId") REFERENCES "SportIndication" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_restrictionId_fkey" FOREIGN KEY ("restrictionId") REFERENCES "Restriction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "Youth" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Report" ("activity", "archived", "author", "authorId", "cleanedText", "confidenceScore", "createdAt", "date", "groupId", "id", "incidents", "indicationId", "injuries", "interventions", "isIncident", "leaderCount", "mood", "parsedAt", "parsedBy", "parsedData", "planForTomorrow", "presentYouth", "rawText", "sessionSummary", "type", "updatedAt", "warmingUp", "youthCount") SELECT "activity", "archived", "author", "authorId", "cleanedText", "confidenceScore", "createdAt", "date", "groupId", "id", "incidents", "indicationId", "injuries", "interventions", "isIncident", "leaderCount", "mood", "parsedAt", "parsedBy", "parsedData", "planForTomorrow", "presentYouth", "rawText", "sessionSummary", "type", "updatedAt", "warmingUp", "youthCount" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
CREATE TABLE "new_SportMutation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "youthId" TEXT,
    "groupId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonType" TEXT NOT NULL,
    "restriction" TEXT,
    "injuryDetails" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "totaalSportverbod" BOOLEAN NOT NULL DEFAULT false,
    "alleenFitness" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SportMutation_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "Youth" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SportMutation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SportMutation" ("createdAt", "createdBy", "endDate", "groupId", "id", "isActive", "reason", "reasonType", "startDate", "updatedAt", "youthId") SELECT "createdAt", "createdBy", "endDate", "groupId", "id", "isActive", "reason", "reasonType", "startDate", "updatedAt", "youthId" FROM "SportMutation";
DROP TABLE "SportMutation";
ALTER TABLE "new_SportMutation" RENAME TO "SportMutation";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SPORTBEGELEIDER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permissions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
