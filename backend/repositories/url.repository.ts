import { prisma } from "@/config/prisma.js";

export const findUrlBySlug = async (slug: string) => {
  return prisma.url.findUnique({
    where: { slug },
  });
};

export const findSlugById = async (id: string) => {
  return prisma.url.findUnique({
    where: { id },
    select: { slug: true },
  });
}

export const createUrl = async (data: {
  slug: string;
  url: string;
  userId: string;
}) => {
  return prisma.url.create({
    data,
  });
};

export const findUrlsByUserId = async (userId: string) => {
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

export const deleteUrlByIdAndUserId = async (id: string, userId: string) => {
  return prisma.url.deleteMany({
    where: {
      id,
      userId,
    },
  });
};
