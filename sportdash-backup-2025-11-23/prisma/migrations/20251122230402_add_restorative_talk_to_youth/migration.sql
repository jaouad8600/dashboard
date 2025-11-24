-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Youth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "groupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "needsRestorativeTalk" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Youth_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Youth" ("createdAt", "firstName", "groupId", "id", "lastName", "updatedAt") SELECT "createdAt", "firstName", "groupId", "id", "lastName", "updatedAt" FROM "Youth";
DROP TABLE "Youth";
ALTER TABLE "new_Youth" RENAME TO "Youth";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
