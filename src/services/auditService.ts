import { prisma } from "@/lib/prisma";

export enum AuditAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    LOGIN = "LOGIN",
}

export enum AuditEntity {
    REPORT = "REPORT",
    GROUP = "GROUP",
    USER = "USER",
    YOUTH = "YOUTH",
}

export async function logAudit(
    action: AuditAction,
    entity: AuditEntity,
    entityId: string,
    userId: string,
    details?: Record<string, any>
) {
    try {
        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                authorId: userId,
                details: details ? JSON.stringify(details) : null,
            },
        });
    } catch (error) {
        console.error("Failed to create audit log:", error);
        // Don't throw, we don't want to fail the main action just because logging failed
    }
}

export async function getAuditLogs(limit = 50) {
    return await prisma.auditLog.findMany({
        orderBy: { timestamp: "desc" },
        take: limit,
        include: {
            // In a real app we would include the author relation
            // author: true 
        }
    });
}
