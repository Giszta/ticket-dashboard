import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

// Re-eksportujemy z dedykowanego pliku żeby nie tworzyć circular deps
export { getRoleLabel, hasRole } from "@/lib/utils/role-helpers";

export async function getSession() {
  const session = await auth();
  return session;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(role: UserRole | UserRole[]) {
  const session = await requireAuth();
  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!allowedRoles.includes(session.user.role as UserRole)) {
    redirect("/");
  }
  return session;
}
