import { prisma } from "@/config/prisma.js";
export async function findByEmail(email) {
    return prisma.user.findUnique({
        where: {
            email,
        },
    });
}
export async function findById(id) {
    return prisma.user.findUnique({
        where: {
            id,
        },
    });
}
export async function createUser(name, email, password) {
    return prisma.user.create({
        data: {
            name,
            email,
            password,
        },
    });
}
//# sourceMappingURL=user.repository.js.map