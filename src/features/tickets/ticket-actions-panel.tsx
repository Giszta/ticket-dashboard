"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateTicketStatusAction,
  updateTicketPriorityAction,
  assignTicketAction,
} from "@/server/actions/ticket.actions";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import type { UserRoleType, TicketStatusType, TicketPriorityType } from "@/lib/validations/enums";

interface Agent {
  id: string;
  name: string | null;
  email: string;
}

interface TicketActionsPanelProps {
  ticketId: string;
  currentStatus: TicketStatusType;
  currentPriority: TicketPriorityType;
  currentAssignedToId: string | null;
  agents: Agent[];
  userRole: UserRoleType;
}

export function TicketActionsPanel({
  ticketId,
  currentStatus,
  currentPriority,
  currentAssignedToId,
  agents,
  userRole,
}: TicketActionsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Customer nie widzi panelu akcji w ogóle
  if (userRole === "CUSTOMER") return null;

  async function handleStatusChange(newStatus: TicketStatusType) {
    setError(null);
    startTransition(async () => {
      const result = await updateTicketStatusAction(ticketId, newStatus);
      if (!result.success) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  async function handlePriorityChange(newPriority: TicketPriorityType) {
    setError(null);
    startTransition(async () => {
      const result = await updateTicketPriorityAction(ticketId, newPriority);
      if (!result.success) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  async function handleAssign(agentId: string) {
    setError(null);
    startTransition(async () => {
      const result = await assignTicketAction(ticketId, agentId === "" ? null : agentId);
      if (!result.success) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  const statuses = Object.entries(STATUS_CONFIG) as [
    TicketStatusType,
    (typeof STATUS_CONFIG)[TicketStatusType],
  ][];
  const priorities = Object.entries(PRIORITY_CONFIG) as [
    TicketPriorityType,
    (typeof PRIORITY_CONFIG)[TicketPriorityType],
  ][];

  return (
    <div className={cn("space-y-4", isPending && "pointer-events-none opacity-60")}>
      {error && (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Status */}
      <div>
        <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Status
        </label>
        <div className="space-y-1">
          {statuses.map(([status, config]) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={status === currentStatus || isPending}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                status === currentStatus
                  ? cn(config.color, config.textColor, "cursor-default font-medium")
                  : "text-gray-600 hover:bg-gray-100",
              )}
              aria-pressed={status === currentStatus}
            >
              <span
                className={cn("h-2 w-2 shrink-0 rounded-full", config.dotColor)}
                aria-hidden="true"
              />
              {config.label}
              {status === currentStatus && (
                <svg className="ml-auto h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="border-t border-gray-100 pt-4">
        <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Priority
        </label>
        <div className="space-y-1">
          {priorities.map(([priority, config]) => (
            <button
              key={priority}
              onClick={() => handlePriorityChange(priority)}
              disabled={priority === currentPriority || isPending}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                priority === currentPriority
                  ? cn(config.color, config.textColor, "cursor-default font-medium")
                  : "text-gray-600 hover:bg-gray-100",
              )}
              aria-pressed={priority === currentPriority}
            >
              {config.label}
              {priority === currentPriority && (
                <svg className="ml-auto h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Assign */}
      <div className="border-t border-gray-100 pt-4">
        <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Assigned To
        </label>
        <select
          value={currentAssignedToId ?? ""}
          onChange={(e) => handleAssign(e.target.value)}
          disabled={isPending}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          aria-label="Assign ticket to agent"
        >
          <option value="">Unassigned</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name ?? agent.email}
            </option>
          ))}
        </select>
      </div>

      {isPending && <p className="text-center text-xs text-gray-400">Saving...</p>}
    </div>
  );
}
