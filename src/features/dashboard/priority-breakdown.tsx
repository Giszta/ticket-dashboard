import { cn } from "@/lib/utils";
import { PRIORITY_CONFIG } from "@/lib/utils/formatters";
import type { TicketStats } from "@/server/repositories/ticket.repository";
import { TicketPriority } from "@prisma/client";

interface PriorityBreakdownProps {
  stats: TicketStats;
}

export function PriorityBreakdown({ stats }: PriorityBreakdownProps) {
  const priorities: TicketPriority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];
  const activeTotal = stats.totalOpen + stats.totalInProgress + stats.totalWaitingForCustomer;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-semibold text-gray-900">Priority Breakdown</h3>
      <p className="mt-0.5 text-xs text-gray-500">Active tickets by priority</p>

      <div className="mt-6 space-y-4">
        {priorities.map((priority) => {
          const config = PRIORITY_CONFIG[priority];
          const count = stats.totalByPriority[priority] ?? 0;
          const percentage = activeTotal > 0 ? (count / activeTotal) * 100 : 0;

          return (
            <div key={priority}>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      config.color,
                      config.textColor,
                    )}
                  >
                    {config.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    config.color.replace("bg-", "bg-"),
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
