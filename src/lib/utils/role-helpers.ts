import { UserRole } from "@prisma/client";

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    CUSTOMER: "Customer",
    AGENT: "Support Agent",
    ADMIN: "Administrator",
  };
  return labels[role];
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole | UserRole[]): boolean {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(userRole);
}
