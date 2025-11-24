import prisma from "@/lib/db";
import { MaterialCategory, ConditionStatus } from "@prisma/client";

// Get all materials with optional filters
export async function getMaterials(filters?: {
    category?: MaterialCategory;
    conditionStatus?: ConditionStatus;
    location?: string;
}) {
    return await prisma.material.findMany({
        where: {
            ...(filters?.category && { category: filters.category }),
            ...(filters?.conditionStatus && { conditionStatus: filters.conditionStatus }),
            ...(filters?.location && { location: { contains: filters.location, mode: "insensitive" } }),
        },
        orderBy: { name: "asc" },
    });
}

// Get single material by ID
export async function getMaterialById(id: string) {
    return await prisma.material.findUnique({
        where: { id },
        include: {
            usage: {
                include: {
                    group: true,
                    report: true,
                },
                orderBy: { date: "desc" },
                take: 10,
            },
        },
    });
}

// Create new material
export async function createMaterial(data: {
    name: string;
    category: MaterialCategory;
    description?: string;
    quantityTotal: number;
    quantityUsable: number;
    location: string;
    conditionStatus?: ConditionStatus;
}) {
    return await prisma.material.create({
        data: {
            ...data,
            conditionStatus: data.conditionStatus || "GOED",
        },
    });
}

// Update material
export async function updateMaterial(
    id: string,
    data: {
        name?: string;
        category?: MaterialCategory;
        description?: string;
        quantityTotal?: number;
        quantityUsable?: number;
        location?: string;
        conditionStatus?: ConditionStatus;
    }
) {
    return await prisma.material.update({
        where: { id },
        data,
    });
}

// Delete material
export async function deleteMaterial(id: string) {
    return await prisma.material.delete({
        where: { id },
    });
}

// Get material usage history
export async function getMaterialUsage(filters?: {
    materialId?: string;
    groupId?: string;
    startDate?: Date;
    endDate?: Date;
}) {
    return await prisma.materialUsage.findMany({
        where: {
            ...(filters?.materialId && { materialId: filters.materialId }),
            ...(filters?.groupId && { groupId: filters.groupId }),
            ...(filters?.startDate && { date: { gte: filters.startDate } }),
            ...(filters?.endDate && { date: { lte: filters.endDate } }),
        },
        include: {
            material: true,
            group: true,
            report: true,
        },
        orderBy: { date: "desc" },
    });
}

// Log material usage
export async function logMaterialUsage(data: {
    materialId: string;
    date: Date;
    groupId?: string;
    reportId?: string;
    quantityUsed: number;
    notes?: string;
    createdBy: string;
}) {
    return await prisma.materialUsage.create({
        data,
    });
}

// Get usage statistics
export async function getMaterialUsageStats(dateRange?: { start: Date; end: Date }) {
    const usage = await prisma.materialUsage.groupBy({
        by: ["materialId"],
        _sum: {
            quantityUsed: true,
        },
        where: dateRange
            ? {
                date: {
                    gte: dateRange.start,
                    lte: dateRange.end,
                },
            }
            : undefined,
        orderBy: {
            _sum: {
                quantityUsed: "desc",
            },
        },
    });

    // Fetch material details
    const materialIds = usage.map((u) => u.materialId);
    const materials = await prisma.material.findMany({
        where: { id: { in: materialIds } },
    });

    return usage.map((u) => ({
        material: materials.find((m) => m.id === u.materialId),
        totalUsed: u._sum.quantityUsed || 0,
    }));
}
