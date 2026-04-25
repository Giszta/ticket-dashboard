import { ticketRepository } from "../ticket.repository";
import { UserRole } from "@prisma/client";

type DashboardServiceParams = {
  userId: string;
  userRole: UserRole;
};

export const dashboardService = {
  /**
   * Pobiera wszystkie dane potrzebne na dashboard.
   * Logika biznesowa: Customer widzi tylko swoje tickety.
   * Agent i Admin widzą wszystkie.
   */
  async getDashboardData({ userId, userRole }: DashboardServiceParams) {
    // Customers widzą tylko swoje dane
    const filter = userRole === "CUSTOMER" ? { createdById: userId } : undefined;

    // Pobieramy stats i recent tickets równolegle — Promise.all
    // zamiast await jeden po drugim (waterfall)
    const [stats, recentTickets] = await Promise.all([
      ticketRepository.getStats(filter),
      ticketRepository.findRecent(5, filter),
    ]);

    return { stats, recentTickets };
  },
};
