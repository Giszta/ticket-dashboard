"use server";

// "use server" na górze pliku oznacza że WSZYSTKIE eksportowane funkcje
// z tego pliku są Server Actions. Możesz też oznaczać pojedyncze funkcje.

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/server/db/client";
import { createTicketSchema } from "@/lib/validations/ticket";
import { ActivityAction, TicketStatus, TicketPriority, UserRole } from "@prisma/client";
import type { ActionResult } from "@/types";

// ============================================================
// CREATE TICKET
// ============================================================

export async function createTicketAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  // 1. Sprawdź sesję
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "You must be logged in to create a ticket" };
  }

  // 2. Uprawnienia — PRZED walidacją danych
  const userRole = session.user.role as UserRole;
  if (userRole === "AGENT") {
    return { success: false, error: "Agents cannot create tickets" };
  }

  // 3. Walidacja — PO sprawdzeniu uprawnień
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    categoryId: formData.get("categoryId"),
  };

  const parsed = createTicketSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: firstError?.message ?? "Invalid form data",
    };
  }

  const { title, description, priority, categoryId } = parsed.data;

  try {
    const ticket = await db.$transaction(async (tx) => {
      const newTicket = await tx.ticket.create({
        data: {
          title,
          description,
          priority,
          status: "OPEN",
          createdById: session.user.id,
          categoryId: categoryId || null,
        },
      });

      await tx.activityLog.create({
        data: {
          ticketId: newTicket.id,
          userId: session.user.id,
          action: "TICKET_CREATED",
        },
      });

      return newTicket;
    });

    revalidatePath("/tickets");
    revalidatePath("/");

    return { success: true, data: { id: ticket.id } };
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return { success: false, error: "Failed to create ticket. Please try again." };
  }
}

// ============================================================
// UPDATE TICKET STATUS
// ============================================================

export async function updateTicketStatusAction(
  ticketId: string,
  newStatus: TicketStatus,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userRole = session.user.role as UserRole;

  // Customer nie może zmieniać statusu
  if (userRole === "CUSTOMER") {
    return { success: false, error: "You don't have permission to change ticket status" };
  }

  // Pobieramy ticket żeby sprawdzić obecny status
  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, status: true, assignedToId: true },
  });

  if (!ticket) {
    return { success: false, error: "Ticket not found" };
  }

  // Walidacja przejść statusów — nie wszystkie są dozwolone
  const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
    OPEN: ["IN_PROGRESS", "CLOSED"],
    IN_PROGRESS: ["WAITING_FOR_CUSTOMER", "RESOLVED", "OPEN"],
    WAITING_FOR_CUSTOMER: ["IN_PROGRESS", "RESOLVED", "CLOSED"],
    RESOLVED: ["CLOSED", "OPEN"],
    CLOSED: ["OPEN"],
  };

  if (!allowedTransitions[ticket.status].includes(newStatus)) {
    return {
      success: false,
      error: `Cannot change status from ${ticket.status} to ${newStatus}`,
    };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: newStatus,
          // Ustawiamy resolvedAt gdy ticket jest resolved lub closed
          resolvedAt:
            newStatus === "RESOLVED" || newStatus === "CLOSED"
              ? new Date()
              : newStatus === "OPEN" || newStatus === "IN_PROGRESS"
                ? null // cofamy resolvedAt gdy ticket jest ponownie otwierany
                : undefined,
        },
      });

      await tx.activityLog.create({
        data: {
          ticketId,
          userId: session.user.id,
          action: ActivityAction.STATUS_CHANGED,
          metadata: { from: ticket.status, to: newStatus },
        },
      });
    });

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath("/tickets");
    revalidatePath("/");

    return { success: true, data: undefined };
  } catch (error) {
    // Logujemy pełny błąd żeby zobaczyć co się dzieje
    console.error("Failed to create ticket — full error:", JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create ticket. Please try again.",
    };
  }
}

// ============================================================
// UPDATE TICKET PRIORITY
// ============================================================

export async function updateTicketPriorityAction(
  ticketId: string,
  newPriority: TicketPriority,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userRole = session.user.role as UserRole;
  if (userRole === "CUSTOMER") {
    return { success: false, error: "You don't have permission to change priority" };
  }

  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, priority: true },
  });

  if (!ticket) {
    return { success: false, error: "Ticket not found" };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticketId },
        data: { priority: newPriority },
      });

      await tx.activityLog.create({
        data: {
          ticketId,
          userId: session.user.id,
          action: ActivityAction.PRIORITY_CHANGED,
          metadata: { from: ticket.priority, to: newPriority },
        },
      });
    });

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath("/tickets");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update priority:", error);
    return { success: false, error: "Failed to update priority. Please try again." };
  }
}

// ============================================================
// ASSIGN TICKET
// ============================================================

export async function assignTicketAction(
  ticketId: string,
  agentId: string | null,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userRole = session.user.role as UserRole;
  if (userRole === "CUSTOMER") {
    return { success: false, error: "You don't have permission to assign tickets" };
  }

  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, assignedToId: true },
  });

  if (!ticket) {
    return { success: false, error: "Ticket not found" };
  }

  // Walidacja agenta
  let agentName: string | null = null;
  if (agentId) {
    const agent = await db.user.findUnique({
      where: { id: agentId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!agent || agent.role === "CUSTOMER") {
      return { success: false, error: "Invalid agent" };
    }

    agentName = agent.name ?? agent.email;
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticketId },
        data: { assignedToId: agentId },
      });

      await tx.activityLog.create({
        data: {
          ticketId,
          userId: session.user.id,
          action: ActivityAction.ASSIGNED_TO_CHANGED,
          metadata: agentName ? { agentName } : {},
        },
      });
    });

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath("/tickets");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to assign ticket:", error);
    return { success: false, error: "Failed to assign ticket. Please try again." };
  }
}

// ============================================================
// ADD COMMENT
// ============================================================

export async function addCommentAction(
  ticketId: string,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const body = formData.get("body");
  const visibilityRaw = formData.get("visibility");

  // Walidacja
  if (!body || typeof body !== "string" || body.trim().length < 1) {
    return { success: false, error: "Comment cannot be empty" };
  }

  if (body.trim().length > 5000) {
    return { success: false, error: "Comment is too long (max 5000 characters)" };
  }

  // Customer może dodawać tylko PUBLIC komentarze
  const userRole = session.user.role as UserRole;
  const visibility =
    userRole !== "CUSTOMER" && visibilityRaw === "INTERNAL" ? "INTERNAL" : "PUBLIC";

  // Sprawdź że ticket istnieje i user ma do niego dostęp
  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, createdById: true, status: true },
  });

  if (!ticket) {
    return { success: false, error: "Ticket not found" };
  }

  if (userRole === "CUSTOMER" && ticket.createdById !== session.user.id) {
    return { success: false, error: "You don't have access to this ticket" };
  }

  // Nie można komentować zamkniętego ticketu (customer)
  if (userRole === "CUSTOMER" && ticket.status === "CLOSED") {
    return { success: false, error: "This ticket is closed" };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.comment.create({
        data: {
          ticketId,
          authorId: session.user.id,
          body: body.trim(),
          visibility,
        },
      });

      await tx.activityLog.create({
        data: {
          ticketId,
          userId: session.user.id,
          action: ActivityAction.COMMENT_ADDED,
        },
      });
    });

    revalidatePath(`/tickets/${ticketId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to add comment:", error);
    return { success: false, error: "Failed to add comment. Please try again." };
  }
}
