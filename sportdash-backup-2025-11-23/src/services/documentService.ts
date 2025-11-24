import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export const getDocuments = async () => {
    // @ts-ignore: document exists in schema
    return await prisma.document.findMany({
        orderBy: { createdAt: "desc" },
    });
};

export const createDocument = async (data: Prisma.DocumentCreateInput) => {
    // @ts-ignore: document exists in schema
    return await prisma.document.create({
        data,
    });
};

export const deleteDocument = async (id: string) => {
    // @ts-ignore: document exists in schema
    return await prisma.document.delete({
        where: { id },
    });
};
