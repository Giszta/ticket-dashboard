import Link from "next/link";
import { formatRelativeTime, getStatusConfig, getPriorityConfig } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

type RecentTicket = Prisma.TicketGetPayload<{
  include: {
    createdBy: { select: { id: true; name: true; email: true } };
    assignedTo: { select: { id: true; name: true; email: true } };
    category: { select: { id: true; name: true; color: true } };
  };
}>;

interface RecentTicketsProps {
  tickets: RecentTicket[];
}

export function RecentTickets({ tickets }: RecentTicketsProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-gray-900">Recent Tickets</h3>
        <div className="mt-8 flex flex-col items-center justify-center text-center">
          <svg
            className="h-10 w-10 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No tickets yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Recent Tickets</h3>
        <Link href="/tickets" className="text-xs font-medium text-blue-600 hover:text-blue-700">
          View all →
        </Link>
      </div>

      <ul className="divide-y divide-gray-50">
        {tickets.map((ticket) => {
          const statusConfig = getStatusConfig(ticket.status);
          const priorityConfig = getPriorityConfig(ticket.priority);

          return (
            <li key={ticket.id}>
              <Link
                href={`/tickets/${ticket.id}`}
                className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-gray-50"
              >
                {/* Status dot */}
                <div className="mt-1.5 shrink-0">
                  <span
                    className={cn("block h-2 w-2 rounded-full", statusConfig.dotColor)}
                    title={statusConfig.label}
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{ticket.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        statusConfig.color,
                        statusConfig.textColor,
                      )}
                    >
                      {statusConfig.label}
                    </span>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        priorityConfig.color,
                        priorityConfig.textColor,
                      )}
                    >
                      {priorityConfig.label}
                    </span>
                    {ticket.category && (
                      <span className="text-xs text-gray-400">{ticket.category.name}</span>
                    )}
                  </div>
                </div>

                {/* Time */}
                <div className="shrink-0 text-right">
                  <p className="text-xs text-gray-400">{formatRelativeTime(ticket.createdAt)}</p>
                  {ticket.assignedTo && (
                    <p className="mt-1 text-xs text-gray-400">
                      → {ticket.assignedTo.name ?? ticket.assignedTo.email}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
