"use client";

import { useState, useTransition } from "react";
import { changeUserRoleAction } from "@/server/actions/user.actions";
import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";

interface ChangeRoleSelectProps {
  userId: string;
  currentRole: UserRole;
  isCurrentUser: boolean;
}

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  {
    value: "CUSTOMER",
    label: "Customer",
    description: "Can create and view own tickets",
  },
  {
    value: "AGENT",
    label: "Agent",
    description: "Can manage and respond to tickets",
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "Full access to all features",
  },
];

const ROLE_COLORS: Record<UserRole, string> = {
  CUSTOMER: "bg-gray-100 text-gray-700",
  AGENT: "bg-blue-100 text-blue-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

export function ChangeRoleSelect({ userId, currentRole, isCurrentUser }: ChangeRoleSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimisticRole, setOptimisticRole] = useState<UserRole>(currentRole);

  function handleChange(newRole: UserRole) {
    if (newRole === optimisticRole) return;

    setError(null);
    const previousRole = optimisticRole;

    // Optimistic update — natychmiast pokazujemy nową rolę
    setOptimisticRole(newRole);

    startTransition(async () => {
      const result = await changeUserRoleAction(userId, newRole);
      if (!result.success) {
        // Rollback przy błędzie
        setOptimisticRole(previousRole);
        setError(result.error);
      }
    });
  }

  if (isCurrentUser) {
    return (
      <span
        className={cn(
          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
          ROLE_COLORS[currentRole],
        )}
      >
        {currentRole} (you)
      </span>
    );
  }

  return (
    <div className="space-y-1">
      <select
        value={optimisticRole}
        onChange={(e) => handleChange(e.target.value as UserRole)}
        disabled={isPending}
        className={cn(
          "rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
          "focus:ring-2 focus:ring-blue-500/20 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
          ROLE_COLORS[optimisticRole],
          "border-transparent",
        )}
        aria-label={`Change role for this user`}
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
