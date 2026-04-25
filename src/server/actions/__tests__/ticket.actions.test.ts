import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";

// vi.hoisted() wykonuje się PRZED hoistingiem vi.mock
// dzięki temu mockAuthFn istnieje gdy vi.mock go używa
const { mockAuthFn } = vi.hoisted(() => ({
  mockAuthFn: vi.fn<() => Promise<Session | null>>(),
}));

vi.mock("@/lib/auth", () => ({
  auth: mockAuthFn,
}));

vi.mock("@/server/db/client", () => ({
  db: {
    ticket: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    activityLog: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { db } from "@/server/db/client";
import { createTicketAction, updateTicketStatusAction } from "@/server/actions/ticket.actions";

const mockDb = vi.mocked(db);

const mockAgentSession: Session = {
  user: {
    id: "user-123",
    email: "agent@test.com",
    name: "Test Agent",
    role: "AGENT",
    avatarUrl: null,
  },
  expires: "2099-01-01",
};

const mockCustomerSession: Session = {
  user: {
    id: "user-456",
    email: "customer@test.com",
    name: "Test Customer",
    role: "CUSTOMER",
    avatarUrl: null,
  },
  expires: "2099-01-01",
};

describe("createTicketAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthFn.mockResolvedValue(mockAgentSession);
  });

  it("returns error when user is not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const formData = new FormData();
    const result = await createTicketAction(formData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("logged in");
    }
  });

  it("returns error when AGENT tries to create ticket", async () => {
    const formData = new FormData();
    formData.append("title", "Test ticket title here");
    formData.append("description", "This is a detailed description of the issue.");
    formData.append("priority", "MEDIUM");
    const result = await createTicketAction(formData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Agents cannot create");
    }
  });

  it("returns validation error for short title", async () => {
    mockAuthFn.mockResolvedValue(mockCustomerSession);
    const formData = new FormData();
    formData.append("title", "Hi");
    formData.append("description", "Some long enough description text here.");
    formData.append("priority", "MEDIUM");
    const result = await createTicketAction(formData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("5 characters");
    }
  });

  it("creates ticket successfully for CUSTOMER", async () => {
    mockAuthFn.mockResolvedValue(mockCustomerSession);

    const mockTicket = { id: "ticket-456" };

    vi.mocked(mockDb.$transaction).mockImplementation(async (fn: unknown) => {
      const callback = fn as (tx: {
        ticket: { create: ReturnType<typeof vi.fn> };
        activityLog: { create: ReturnType<typeof vi.fn> };
      }) => Promise<unknown>;
      return callback({
        ticket: { create: vi.fn().mockResolvedValue(mockTicket) },
        activityLog: { create: vi.fn().mockResolvedValue({}) },
      });
    });

    const formData = new FormData();
    formData.append("title", "My ticket title");
    formData.append("description", "Detailed description of the problem I encountered.");
    formData.append("priority", "HIGH");
    formData.append("categoryId", ""); // ← dodaj pusty string

    const result = await createTicketAction(formData);

    console.log("Result:", JSON.stringify(result, null, 2));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("ticket-456");
    }
  });

  describe("updateTicketStatusAction", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockAuthFn.mockResolvedValue(mockAgentSession);
    });

    it("returns error for CUSTOMER trying to change status", async () => {
      mockAuthFn.mockResolvedValue(mockCustomerSession);
      const result = await updateTicketStatusAction("ticket-123", "IN_PROGRESS");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("permission");
      }
    });

    it("returns error for invalid status transition", async () => {
      vi.mocked(mockDb.ticket.findUnique).mockResolvedValue({
        id: "ticket-123",
        status: "CLOSED",
        assignedToId: null,
      } as Awaited<ReturnType<typeof mockDb.ticket.findUnique>>);
      const result = await updateTicketStatusAction("ticket-123", "IN_PROGRESS");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Cannot change status");
      }
    });

    it("allows valid transition OPEN → IN_PROGRESS", async () => {
      vi.mocked(mockDb.ticket.findUnique).mockResolvedValue({
        id: "ticket-123",
        status: "OPEN",
        assignedToId: null,
      } as Awaited<ReturnType<typeof mockDb.ticket.findUnique>>);

      vi.mocked(mockDb.$transaction).mockImplementation(async (fn: unknown) => {
        const callback = fn as (tx: {
          ticket: { update: ReturnType<typeof vi.fn> };
          activityLog: { create: ReturnType<typeof vi.fn> };
        }) => Promise<unknown>;
        return callback({
          ticket: { update: vi.fn().mockResolvedValue({}) },
          activityLog: { create: vi.fn().mockResolvedValue({}) },
        });
      });

      const result = await updateTicketStatusAction("ticket-123", "IN_PROGRESS");
      expect(result.success).toBe(true);
    });

    it("returns error when ticket not found", async () => {
      vi.mocked(mockDb.ticket.findUnique).mockResolvedValue(null);
      const result = await updateTicketStatusAction("non-existent", "IN_PROGRESS");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("not found");
      }
    });
  });
});
