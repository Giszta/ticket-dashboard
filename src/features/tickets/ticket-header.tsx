import Link from "next/link";
import { cn } from "@/lib/utils";
import { getStatusConfig, getPriorityConfig, formatDate } from "@/lib/utils/formatters";
import { TicketStatus, TicketPriority } from "@prisma/client";

interface TicketHeaderProps {
  ticket: {
    id: string;
    title: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt: Date | null;
    createdBy: {
      name: string | null;
      email: string;
    };
  };
}

export function TicketHeader({ ticket }: TicketHeaderProps) {
  const statusConfig = getStatusConfig(ticket.status);
  const priorityConfig = getPriorityConfig(ticket.priority);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/tickets" className="transition-colors hover:text-gray-700">
          Tickets
        </Link>
        <svg
          className="h-4 w-4 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="max-w-xs truncate font-medium text-gray-700">{ticket.title}</span>
      </nav>

      {/* Ticket ID */}
      <p className="mb-2 font-mono text-xs text-gray-400">#{ticket.id.slice(-12).toUpperCase()}</p>

      {/* Title */}
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{ticket.title}</h1>

      {/* Badges */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
            statusConfig.color,
            statusConfig.textColor,
          )}
        >
          <span
            className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dotColor)}
            aria-hidden="true"
          />
          {statusConfig.label}
        </span>

        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-sm font-medium",
            priorityConfig.color,
            priorityConfig.textColor,
          )}
        >
          {priorityConfig.label} Priority
        </span>
      </div>

      {/* Meta */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gray-100 pt-4 text-sm text-gray-500">
        <span>
          Opened by{" "}
          <span className="font-medium text-gray-700">
            {ticket.createdBy.name ?? ticket.createdBy.email}
          </span>
        </span>
        <span>
          Created{" "}
          <span className="font-medium text-gray-700" title={formatDate(ticket.createdAt)}>
            {formatDate(ticket.createdAt)}
          </span>
        </span>
        {ticket.resolvedAt && (
          <span>
            Resolved{" "}
            <span className="font-medium text-green-700">{formatDate(ticket.resolvedAt)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
