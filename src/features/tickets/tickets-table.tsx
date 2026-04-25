import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatRelativeTime, getStatusConfig, getPriorityConfig } from "@/lib/utils/formatters";
import type { TicketWithRelations } from "@/server/repositories/ticket.repository";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

interface TicketsTableProps {
  tickets: TicketWithRelations[];
  isLoading?: boolean;
}

export function TicketsTable({ tickets, isLoading }: TicketsTableProps) {
  if (!isLoading && tickets.length === 0) {
    return (
      <EmptyState
        title="No tickets found"
        description="Try adjusting your filters or search query."
        icon={
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Ticket
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Priority
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase md:table-cell">
              Assigned To
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase lg:table-cell">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
            : tickets.map((ticket) => {
                const statusConfig = getStatusConfig(ticket.status);
                const priorityConfig = getPriorityConfig(ticket.priority);

                return (
                  <tr key={ticket.id} className="group transition-colors hover:bg-gray-50">
                    {/* Ticket title + meta */}
                    <td className="px-4 py-3">
                      <Link href={`/tickets/${ticket.id}`} className="block">
                        <p className="line-clamp-1 text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600">
                          {ticket.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-xs text-gray-400">#{ticket.id.slice(-8)}</span>
                          {ticket._count.comments > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-gray-400">
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              {ticket._count.comments}
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
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
                    </td>

                    {/* Priority badge */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                          priorityConfig.color,
                          priorityConfig.textColor,
                        )}
                      >
                        {priorityConfig.label}
                      </span>
                    </td>

                    {/* Assigned to */}
                    <td className="hidden px-4 py-3 md:table-cell">
                      {ticket.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                            {(ticket.assignedTo.name ?? ticket.assignedTo.email)[0].toUpperCase()}
                          </div>
                          <span className="max-w-25 truncate text-sm text-gray-700">
                            {ticket.assignedTo.name ?? ticket.assignedTo.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Unassigned</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {ticket.category ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: ticket.category.color }}
                            aria-hidden="true"
                          />
                          <span className="max-w-25 truncate text-sm text-gray-600">
                            {ticket.category.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Created at */}
                    <td className="px-4 py-3">
                      <span
                        className="text-sm text-gray-500"
                        title={new Date(ticket.createdAt).toISOString()}
                      >
                        {formatRelativeTime(ticket.createdAt)}
                      </span>
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}
