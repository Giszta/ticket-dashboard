import { cn } from "@/lib/utils";
import type { TicketStats } from "@/server/repositories/ticket.repository";

interface StatsCardsProps {
  stats: TicketStats;
}

type StatCard = {
  label: string;
  value: number;
  description: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
};

// function TrendIcon({ value }: { value: number }) {
//   return (
//     <span
//       className={cn(
//         "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
//         value > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700",
//       )}
//     >
//       {value > 0 ? "↑" : "↓"} active
//     </span>
//   );
// }

export function StatsCards({ stats }: StatsCardsProps) {
  const cards: StatCard[] = [
    {
      label: "Open Tickets",
      value: stats.totalOpen,
      description: "Awaiting assignment",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      label: "In Progress",
      value: stats.totalInProgress,
      description: "Being worked on",
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Waiting",
      value: stats.totalWaitingForCustomer,
      description: "Awaiting customer reply",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      label: "Resolved",
      value: stats.totalResolved + stats.totalClosed,
      description: "Total resolved & closed",
      color: "text-green-700",
      bgColor: "bg-green-50",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-400">{card.description}</p>
            </div>
            <div className={cn("rounded-lg p-2.5", card.bgColor, card.color)}>{card.icon}</div>
          </div>

          {/* Mini progress bar — % z total */}
          {stats.total > 0 && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-gray-400">of total</span>
                <span className="text-xs font-medium text-gray-600">
                  {Math.round((card.value / stats.total) * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    card.color.replace("text-", "bg-"),
                  )}
                  style={{ width: `${(card.value / stats.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
