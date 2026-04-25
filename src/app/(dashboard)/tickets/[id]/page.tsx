import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/helpers";
import { ticketRepository } from "@/server/repositories/ticket.repository";
import { db } from "@/server/db/client";
import { TicketHeader } from "@/features/tickets/ticket-header";
import { TicketMeta } from "@/features/tickets/ticket-meta";
import { TicketComments } from "@/features/tickets/ticket-comments";
import { TicketActivity } from "@/features/tickets/ticket-activity";
import { TicketActionsPanel } from "@/features/tickets/ticket-actions-panel";
import { AddCommentForm } from "@/features/tickets/add-comment-form";
import { UserRole } from "@prisma/client";

interface TicketPageProps {
  params: Promise<{ id: string }>; // ← Promise w Next.js 15+
}

export async function generateMetadata({ params }: TicketPageProps) {
  const { id } = await params; // ← await PRZED użyciem
  const ticket = await ticketRepository.findById(id);
  if (!ticket) return { title: "Ticket Not Found" };
  return { title: `#${ticket.id.slice(-8).toUpperCase()} — ${ticket.title}` };
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { id } = await params; // ← await PRZED użyciem
  const session = await requireAuth();
  const userRole = session.user.role as UserRole;

  const [ticket, agents] = await Promise.all([
    ticketRepository.findById(id),
    userRole !== "CUSTOMER"
      ? db.user.findMany({
          where: { role: { in: ["AGENT", "ADMIN"] } },
          select: { id: true, name: true, email: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  if (!ticket) notFound();

  if (userRole === "CUSTOMER" && ticket.createdById !== session.user.id) {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Lewa kolumna */}
          <div className="space-y-6 lg:col-span-2">
            <TicketHeader ticket={ticket} />

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Description</h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                {ticket.description}
              </p>
            </div>

            <TicketComments
              comments={ticket.comments}
              currentUserRole={userRole}
              addCommentForm={<AddCommentForm ticketId={ticket.id} userRole={userRole} />}
            />
          </div>

          {/* Prawa kolumna */}
          <div className="space-y-6">
            <TicketMeta
              ticket={ticket}
              actions={
                userRole !== "CUSTOMER" ? (
                  <TicketActionsPanel
                    ticketId={ticket.id}
                    currentStatus={ticket.status}
                    currentPriority={ticket.priority}
                    currentAssignedToId={ticket.assignedToId}
                    agents={agents}
                    userRole={userRole}
                  />
                ) : undefined
              }
            />

            <TicketActivity activityLogs={ticket.activityLogs} />
          </div>
        </div>
      </div>
    </div>
  );
}
