import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const getGroups = async () => {
    return await prisma.group.findMany({
        orderBy: { name: "asc" },
        include: {
            notes: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
            _count: {
                select: {
                    mutations: { where: { isActive: true } },
                    indications: { where: { isActive: true } },
                    youths: true,
                }
            }
        }
    });
};

export const getGroupById = async (id: string) => {
    return await prisma.group.findUnique({
        where: { id },
        include: {
            reports: {
                orderBy: { createdAt: "desc" },
                take: 5,
            },
            sessions: {
                orderBy: { date: "desc" },
                take: 5,
            },
            notes: {
                orderBy: { createdAt: "desc" },
            },
            _count: {
                select: {
                    mutations: { where: { isActive: true } },
                    indications: { where: { isActive: true } },
                    youths: true,
                }
            }
        },
    });
};

export const createGroup = async (data: Prisma.GroupCreateInput) => {
    return await prisma.group.create({
        data,
    });
};

export const updateGroup = async (id: string, data: Prisma.GroupUpdateInput) => {
    return await prisma.group.update({
        where: { id },
        data,
    });
};
