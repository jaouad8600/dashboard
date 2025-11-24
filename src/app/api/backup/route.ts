import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BACKUP_DIR = path.join(process.cwd(), "backups");
const DB_PATH = path.join(process.cwd(), "prisma", "dev.db");

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export async function GET() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith(".db") || file.endsWith(".zip") || file.endsWith(".tgz"))
      .map(file => {
        const stats = fs.statSync(path.join(BACKUP_DIR, file));
        return {
          name: file,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error listing backups:", error);
    return NextResponse.json({ error: "Failed to list backups" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupName = `backup-${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    // Simple file copy for SQLite
    // In a production environment with high write volume, you might want to use SQLite's backup API or VACUUM INTO
    // But for this scale, copyFile is usually fine if the db isn't locked for long.
    fs.copyFileSync(DB_PATH, backupPath);

    return NextResponse.json({ message: "Backup created", name: backupName });
  } catch (error) {
    console.error("Error creating backup:", error);
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 });
  }
}
