import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const [groups, youths, reports, materials] = await Promise.all([
      prisma.group.findMany({ include: { notes: true } }),
      prisma.youth.findMany({ include: { mutations: true, indications: true } }),
      prisma.report.findMany(),
      prisma.material.findMany(),
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      groups,
      youths,
      reports,
      materials,
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="sportdash_backup_${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "Failed to create backup" },
      { status: 500 }
    );
  }
}
