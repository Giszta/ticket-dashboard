import { auth } from "@/lib/auth";
import { UserRole } from "../../../src/generated/prisma/client";
import { redirect } from "next/navigation";

/**
 * Zwraca sesję zalogowanego użytkownika lub null.
 * Używaj w Server Components gdy dostęp dla niezalogowanych jest opcjonalny.
 */
export async function getSession() {
  const session = await auth();
  return session;
}

/**
 * Zwraca sesję lub przekierowuje na /login.
 * Używaj w Server Components wymagających logowania.
 *
 * @example
 * const session = await requireAuth();
 * // Jeśli tu dotarłeś, user jest zalogowany
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Zwraca sesję lub przekierowuje jeśli user nie ma wymaganej roli.
 * Używaj w Server Components z kontrolą dostępu per rola.
 *
 * @example
 * const session = await requireRole("ADMIN");
 */
export async function requireRole(role: UserRole | UserRole[]) {
  const session = await requireAuth();

  const allowedRoles = Array.isArray(role) ? role : [role];

  if (!allowedRoles.includes(session.user.role)) {
    // Nie ujawniamy że strona istnieje — redirect na dashboard
    redirect("/");
  }

  return session;
}

/**
 * Sprawdza czy user ma daną rolę (bez przekierowania).
 * Używaj w komponentach do warunkowego renderowania UI.
 *
 * @example
 * const canAssign = hasRole(session.user.role, ["AGENT", "ADMIN"]);
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole | UserRole[]): boolean {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(userRole);
}

/**
 * Zwraca display name dla roli.
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    CUSTOMER: "Customer",
    AGENT: "Support Agent",
    ADMIN: "Administrator",
  };
  return labels[role];
}
