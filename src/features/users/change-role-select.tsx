"use client";

import { useState, useTransition } from "react";
import { changeUserRoleAction } from "@/server/actions/user.actions";
import { cn } from "@/lib/utils";
import type { UserRoleType } from "@/lib/validations/enums";
import { UserRoleEnum } from "@/lib/validations/enums";
interface ChangeRoleSelectProps {
  userId: string;
  currentRole: UserRoleType;
  isCurrentUser: boolean;
}

const ROLE_OPTIONS: { value: UserRoleType; label: string; description: string }[] = [
  {
    value: UserRoleEnum.CUSTOMER,
    label: "Customer",
    description: "Can create and view own tickets",
  },
  { value: UserRoleEnum.AGENT, label: "Agent", description: "Can manage and respond to tickets" },
  { value: UserRoleEnum.ADMIN, label: "Admin", description: "Full access to all features" },
];

const ROLE_COLORS: Record<UserRoleType, string> = {
  CUSTOMER: "bg-gray-100 text-gray-700",
  AGENT: "bg-blue-100 text-blue-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

export function ChangeRoleSelect({ userId, currentRole, isCurrentUser }: ChangeRoleSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimisticRole, setOptimisticRole] = useState<UserRoleType>(currentRole);

  function handleChange(newRole: UserRoleType) {
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
        onChange={(e) => handleChange(e.target.value as UserRoleType)}
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
