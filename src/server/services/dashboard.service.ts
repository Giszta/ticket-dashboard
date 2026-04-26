import { ticketRepository } from "@/server/repositories/ticket.repository";
import { UserRole } from "@prisma/client";

type DashboardServiceParams = {
  userId: string;
  userRole: UserRole;
};

export const dashboardService = {
  async getDashboardData({ userId, userRole }: DashboardServiceParams) {
    const filter = userRole === "CUSTOMER" ? { createdById: userId } : undefined;

    const [stats, recentTickets] = await Promise.all([
      ticketRepository.getStats(filter),
      ticketRepository.findRecent(5, filter),
    ]);

    return { stats, recentTickets };
  },
};
