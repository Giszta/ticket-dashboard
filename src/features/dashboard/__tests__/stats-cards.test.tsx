import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsCards } from "@/features/dashboard/stats-cards";
import type { TicketStats } from "@/server/repositories/ticket.repository";

const mockStats: TicketStats = {
  totalOpen: 5,
  totalInProgress: 3,
  totalWaitingForCustomer: 2,
  totalResolved: 10,
  totalClosed: 4,
  totalByPriority: {
    LOW: 2,
    MEDIUM: 8,
    HIGH: 3,
    URGENT: 1,
  },
  total: 24,
};

describe("StatsCards", () => {
  it("renders all four stat cards", () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText("Open Tickets")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Waiting")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
  });

  it("displays correct counts", () => {
    render(<StatsCards stats={mockStats} />);

    expect(screen.getByText("5")).toBeInTheDocument(); // Open
    expect(screen.getByText("3")).toBeInTheDocument(); // In Progress
    expect(screen.getByText("2")).toBeInTheDocument(); // Waiting
    // Resolved = totalResolved + totalClosed = 14
    expect(screen.getByText("14")).toBeInTheDocument();
  });

  it("shows 0 when stats are all zero", () => {
    const emptyStats: TicketStats = {
      ...mockStats,
      totalOpen: 0,
      totalInProgress: 0,
      totalWaitingForCustomer: 0,
      totalResolved: 0,
      totalClosed: 0,
      total: 0,
    };

    render(<StatsCards stats={emptyStats} />);
    // Wszystkie karty powinny pokazywać 0
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(4);
  });
});
