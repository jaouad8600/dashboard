import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export const getPrograms = async () => {
    // @ts-ignore: program exists in schema
    return await prisma.program.findMany({
        orderBy: { updatedAt: "desc" },
    });
};

export const createProgram = async (data: Prisma.ProgramCreateInput) => {
    // @ts-ignore: program exists in schema
    return await prisma.program.create({
        data,
    });
};

export const deleteProgram = async (id: string) => {
    // @ts-ignore: program exists in schema
    return await prisma.program.delete({
        where: { id },
    });
};
