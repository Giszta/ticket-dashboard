import { TicketStatus, TicketPriority } from "@prisma/client";

/**
 * Formatuje datę do czytelnej formy relatywnej.
 * "2 hours ago", "3 days ago" itp.
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

/**
 * Formatuje datę do pełnego formatu.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================
// STATUS HELPERS
// ============================================================

export type StatusConfig = {
  label: string;
  color: string; // Tailwind bg color
  textColor: string; // Tailwind text color
  dotColor: string; // Tailwind dot color
};

export const STATUS_CONFIG: Record<TicketStatus, StatusConfig> = {
  OPEN: {
    label: "Open",
    color: "bg-blue-100",
    textColor: "text-blue-800",
    dotColor: "bg-blue-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-yellow-100",
    textColor: "text-yellow-800",
    dotColor: "bg-yellow-500",
  },
  WAITING_FOR_CUSTOMER: {
    label: "Waiting",
    color: "bg-purple-100",
    textColor: "text-purple-800",
    dotColor: "bg-purple-500",
  },
  RESOLVED: {
    label: "Resolved",
    color: "bg-green-100",
    textColor: "text-green-800",
    dotColor: "bg-green-500",
  },
  CLOSED: {
    label: "Closed",
    color: "bg-gray-100",
    textColor: "text-gray-600",
    dotColor: "bg-gray-400",
  },
};

export type PriorityConfig = {
  label: string;
  color: string;
  textColor: string;
  order: number; // do sortowania
};

export const PRIORITY_CONFIG: Record<TicketPriority, PriorityConfig> = {
  LOW: {
    label: "Low",
    color: "bg-gray-100",
    textColor: "text-gray-600",
    order: 1,
  },
  MEDIUM: {
    label: "Medium",
    color: "bg-blue-100",
    textColor: "text-blue-700",
    order: 2,
  },
  HIGH: {
    label: "High",
    color: "bg-orange-100",
    textColor: "text-orange-700",
    order: 3,
  },
  URGENT: {
    label: "Urgent",
    color: "bg-red-100",
    textColor: "text-red-700",
    order: 4,
  },
};

export function getStatusConfig(status: TicketStatus): StatusConfig {
  return STATUS_CONFIG[status];
}

export function getPriorityConfig(priority: TicketPriority): PriorityConfig {
  return PRIORITY_CONFIG[priority];
}
