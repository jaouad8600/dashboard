import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;
    const BACKUP_DIR = path.join(process.cwd(), "backups");
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": stats.size.toString(),
        },
    });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;
    const BACKUP_DIR = path.join(process.cwd(), "backups");
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    try {
        fs.unlinkSync(filePath);
        return NextResponse.json({ message: "File deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
}
