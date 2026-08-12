import { prisma } from "@/config/prisma.js";
export const findUrlBySlug = async (slug) => {
    return prisma.url.findUnique({
        where: { slug },
    });
};
export const createUrl = async (data) => {
    return prisma.url.create({
        data,
    });
};
export const findUrlsByUserId = async (userId) => {
    return prisma.url.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            slug: true,
            url: true,
            createdAt: true,
        },
    });
};
export const deleteUrlByIdAndUserId = async (id, userId) => {
    return prisma.url.deleteMany({
        where: {
            id,
            userId,
        },
    });
};
//# sourceMappingURL=url.repository.js.map