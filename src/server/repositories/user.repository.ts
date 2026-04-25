import { db } from "@/server/db/client";
import { UserRole, Prisma } from "@prisma/client";

export type UserWithStats = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
  _count: {
    createdTickets: number;
    assignedTickets: number;
  };
};

export const userRepository = {
  async findMany(
    params: {
      search?: string;
      role?: UserRole;
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<{ users: UserWithStats[]; totalCount: number }> {
    const { search, role, page = 1, pageSize = 20 } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [users, totalCount] = await db.$transaction([
      db.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              createdTickets: true,
              assignedTickets: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    return { users, totalCount };
  },

  async findById(id: string) {
    return db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  },

  async updateRole(id: string, role: UserRole) {
    return db.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
  },
};
