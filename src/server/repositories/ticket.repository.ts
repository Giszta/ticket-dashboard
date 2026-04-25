import { db } from "@/server/db/client";
import { TicketStatus, TicketPriority, Prisma } from "@prisma/client";

// ============================================================
// TYPY
// ============================================================

export type TicketWithRelations = Prisma.TicketGetPayload<{
  include: {
    createdBy: { select: { id: true; name: true; email: true } };
    assignedTo: { select: { id: true; name: true; email: true } };
    category: { select: { id: true; name: true; color: true } };
    _count: { select: { comments: true } };
  };
}>;

export type TicketListParams = {
  page?: number;
  pageSize?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
  assignedToId?: string;
  createdById?: string;
  categoryId?: string;
  sortBy?: "createdAt" | "updatedAt" | "priority" | "status";
  sortOrder?: "asc" | "desc";
};

export type TicketStats = {
  totalOpen: number;
  totalInProgress: number;
  totalWaitingForCustomer: number;
  totalResolved: number;
  totalClosed: number;
  totalByPriority: Record<TicketPriority, number>;
  total: number;
};

// ============================================================
// REPOSITORY
// ============================================================

export const ticketRepository = {
  /**
   * Zlicza tickety pogrupowane po statusie i priorytecie.
   * Używamy $transaction żeby dostać spójny snapshot danych.
   */
  async getStats(filter?: { createdById?: string }): Promise<TicketStats> {
    const where: Prisma.TicketWhereInput = filter?.createdById
      ? { createdById: filter.createdById }
      : {};

    const [statusCounts, priorityCounts] = await db.$transaction([
      // Grupujemy tickety po statusie
      db.ticket.groupBy({
        by: ["status"],
        where,
        _count: { id: true },
      }),
      // Grupujemy tickety po priorytecie
      db.ticket.groupBy({
        by: ["priority"],
        where,
        _count: { id: true },
      }),
    ]);

    // Mapujemy wyniki na wygodny obiekt
    const byStatus = Object.fromEntries(statusCounts.map((s) => [s.status, s._count.id])) as Record<
      TicketStatus,
      number
    >;

    const byPriority = Object.fromEntries(
      priorityCounts.map((p) => [p.priority, p._count.id]),
    ) as Record<TicketPriority, number>;

    // Uzupełniamy zerami dla brakujących statusów/priorytetów
    const allStatuses: TicketStatus[] = [
      "OPEN",
      "IN_PROGRESS",
      "WAITING_FOR_CUSTOMER",
      "RESOLVED",
      "CLOSED",
    ];
    const allPriorities: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

    for (const status of allStatuses) {
      byStatus[status] = byStatus[status] ?? 0;
    }
    for (const priority of allPriorities) {
      byPriority[priority] = byPriority[priority] ?? 0;
    }

    const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);

    return {
      totalOpen: byStatus.OPEN,
      totalInProgress: byStatus.IN_PROGRESS,
      totalWaitingForCustomer: byStatus.WAITING_FOR_CUSTOMER,
      totalResolved: byStatus.RESOLVED,
      totalClosed: byStatus.CLOSED,
      totalByPriority: byPriority,
      total,
    };
  },

  /**
   * Pobiera listę ticketów z paginacją, filtrowaniem i sortowaniem.
   * Zwraca dane i total count w jednej transakcji.
   */
  async findMany(params: TicketListParams = {}) {
    const {
      page = 1,
      pageSize = 20,
      status,
      priority,
      search,
      assignedToId,
      createdById,
      categoryId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * pageSize;

    // Budujemy where clause dynamicznie
    const where: Prisma.TicketWhereInput = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedToId && { assignedToId }),
      ...(createdById && { createdById }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // Sortowanie — priority wymaga specjalnego traktowania
    // bo nie możemy sortować enuma alfabetycznie (HIGH < LOW < MEDIUM < URGENT)
    const orderBy: Prisma.TicketOrderByWithRelationInput =
      sortBy === "priority" ? { priority: sortOrder } : { [sortBy]: sortOrder };

    const [tickets, totalCount] = await db.$transaction([
      db.ticket.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          category: {
            select: { id: true, name: true, color: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
      db.ticket.count({ where }),
    ]);

    return {
      tickets,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      pageSize,
    };
  },

  /**
   * Pobiera jeden ticket z pełnymi danymi.
   */
  async findById(id: string) {
    return db.ticket.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, color: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        activityLogs: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { comments: true },
        },
      },
    });
  },

  /**
   * Pobiera ostatnie N ticketów — do widgetu "Recent Tickets" na dashboardzie.
   */
  async findRecent(limit: number = 5, filter?: { createdById?: string }) {
    const where: Prisma.TicketWhereInput = filter?.createdById
      ? { createdById: filter.createdById }
      : {};

    return db.ticket.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, color: true },
        },
      },
    });
  },
};
