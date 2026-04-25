import { cn } from "@/lib/utils";
import { formatRelativeTime, formatDate } from "@/lib/utils/formatters";
import { ActivityAction } from "@prisma/client";

type ActivityLog = {
  id: string;
  action: ActivityAction;
  metadata: unknown;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
};

interface TicketActivityProps {
  activityLogs: ActivityLog[];
}

// Konfiguracja dla każdego rodzaju akcji
const ACTION_CONFIG: Record<
  ActivityAction,
  { label: (meta: Record<string, string>) => string; icon: string; color: string }
> = {
  TICKET_CREATED: {
    label: () => "created this ticket",
    icon: "📝",
    color: "bg-blue-100 text-blue-600",
  },
  STATUS_CHANGED: {
    label: (meta) => `changed status from ${meta.from ?? "?"} to ${meta.to ?? "?"}`,
    icon: "🔄",
    color: "bg-purple-100 text-purple-600",
  },
  PRIORITY_CHANGED: {
    label: (meta) => `changed priority from ${meta.from ?? "?"} to ${meta.to ?? "?"}`,
    icon: "⚡",
    color: "bg-yellow-100 text-yellow-600",
  },
  ASSIGNED_TO_CHANGED: {
    label: (meta) =>
      meta.agentName ? `assigned ticket to ${meta.agentName}` : "unassigned ticket",
    icon: "👤",
    color: "bg-green-100 text-green-600",
  },
  COMMENT_ADDED: {
    label: () => "added a comment",
    icon: "💬",
    color: "bg-gray-100 text-gray-600",
  },
  TICKET_RESOLVED: {
    label: () => "resolved this ticket",
    icon: "✅",
    color: "bg-green-100 text-green-600",
  },
  TICKET_CLOSED: {
    label: () => "closed this ticket",
    icon: "🔒",
    color: "bg-gray-100 text-gray-600",
  },
};

export function TicketActivity({ activityLogs }: TicketActivityProps) {
  if (activityLogs.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-sm font-semibold text-gray-900">Activity</h2>
      </div>

      <ul className="px-6 py-4">
        {activityLogs.map((log, index) => {
          const config = ACTION_CONFIG[log.action];
          const meta = (log.metadata as Record<string, string>) ?? {};
          const isLast = index === activityLogs.length - 1;

          return (
            <li key={log.id} className="relative flex gap-4">
              {/* Linia łącząca zdarzenia */}
              {!isLast && (
                <div
                  className="absolute top-8 bottom-0 left-4 w-px bg-gray-100"
                  aria-hidden="true"
                />
              )}

              {/* Ikona zdarzenia */}
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm",
                  config.color,
                )}
                aria-hidden="true"
              >
                {config.icon}
              </div>

              {/* Treść zdarzenia */}
              <div className={cn("min-w-0 flex-1 pb-5", isLast && "pb-0")}>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">
                    {log.user.name ?? log.user.email}
                  </span>{" "}
                  {config.label(meta)}
                </p>
                <time
                  dateTime={new Date(log.createdAt).toISOString()}
                  className="mt-0.5 block text-xs text-gray-400"
                  title={formatDate(log.createdAt)}
                >
                  {formatRelativeTime(log.createdAt)}
                </time>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
