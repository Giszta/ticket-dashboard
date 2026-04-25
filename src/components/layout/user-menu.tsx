"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { UserRole } from "@prisma/client";
import { getRoleLabel } from "@/lib/utils/role-helpers"; // ← zmieniony import

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: UserRole;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user.email?.[0].toUpperCase() ?? "?");

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{user.name ?? "Unknown"}</p>
        <p className="truncate text-xs text-gray-500">{getRoleLabel(user.role)}</p>
      </div>

      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
        title="Sign out"
        aria-label="Sign out"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </div>
  );
}
