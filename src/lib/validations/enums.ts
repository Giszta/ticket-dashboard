// src/lib/validations/enums.ts
// Enumy zduplikowane z Prismy — bezpieczne dla Client Components
// Prisma generuje identyczne wartości w bazie

export const TicketPriorityEnum = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export type TicketPriorityType = keyof typeof TicketPriorityEnum;

export const TicketStatusEnum = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  WAITING_FOR_CUSTOMER: "WAITING_FOR_CUSTOMER",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type TicketStatusType = keyof typeof TicketStatusEnum;

export const UserRoleEnum = {
  CUSTOMER: "CUSTOMER",
  AGENT: "AGENT",
  ADMIN: "ADMIN",
} as const;

export type UserRoleType = keyof typeof UserRoleEnum;
